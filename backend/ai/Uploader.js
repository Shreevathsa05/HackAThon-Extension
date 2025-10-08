import * as dotenv from 'dotenv';
dotenv.config();

import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import * as XLSX from "xlsx";
import path from "path";
import fs from "fs";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { DocxLoader } from "@langchain/community/document_loaders/fs/docx";
import { PPTXLoader } from "@langchain/community/document_loaders/fs/pptx";
import { TextLoader } from "langchain/document_loaders/fs/text";
import { CSVLoader } from "@langchain/community/document_loaders/fs/csv";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';
import { fileURLToPath } from "url";
import { QdrantVectorStore } from '@langchain/qdrant';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let CHUNK_SIZE = 2000;
let CHUNK_OVERLAP = 300;

export async function loadDocument(filePath, sessionid) {
    if (!fs.existsSync(filePath)) {
        throw new Error(`File not found: ${filePath}`);
    }

    const fileName = path.basename(filePath); // still useful for logging
    const ext = path.extname(fileName).toLowerCase();
    let loader;
    let rawDocs = [];

    switch (ext) {
        case ".pdf":
            loader = new PDFLoader(filePath);
            rawDocs = await loader.load();
            break;

        case ".docx":
            loader = new DocxLoader(filePath);
            rawDocs = await loader.load();
            break;

        case ".pptx":
            loader = new PPTXLoader(filePath);
            rawDocs = await loader.load();
            break;

        case ".txt":
            loader = new TextLoader(filePath);
            rawDocs = await loader.load();
            break;

        case ".csv":
            loader = new CSVLoader(filePath);
            rawDocs = await loader.load();
            break;

        case ".xls":
        case ".xlsx":
            const workbook = XLSX.readFile(filePath);
            const sheetNames = workbook.SheetNames;

            for (const sheetName of sheetNames) {
                const sheet = workbook.Sheets[sheetName];
                const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

                jsonData.forEach((row, rowIndex) => {
                    rawDocs.push({
                        pageContent: row.join(", "),
                        metadata: { sheet: sheetName, row: rowIndex, sessionid },
                    });
                });
            }
            break;

        default:
            throw new Error(`Unsupported file type: ${ext}`);
    }

    generateSummary(rawDocs, sessionid)

    // chunk docs
    const textSplitter = new RecursiveCharacterTextSplitter({
        chunkSize: CHUNK_SIZE,
        chunkOverlap: CHUNK_OVERLAP,
    });
    const chunkedDocs = await textSplitter.splitDocuments(rawDocs);
    console.log("Chunking Completed");

    // vector embeddings
    const embeddings = new GoogleGenerativeAIEmbeddings({
        apiKey: process.env.GEMINI_API_KEY,
        model: 'text-embedding-004',
    });
    console.log("Embedding configured");

    const vectorStore = await QdrantVectorStore.fromDocuments(chunkedDocs, embeddings, {
        url: process.env.QDRANT_URL,
        apiKey: process.env.QDRANT_API_KEY,
        collectionName: `doc_${sessionid}`,
        createCollectionIfNotExists: true,
        // checkCompatibility:false,
        timeout: 10000,
    });
    console.log("Uploaded sucessfully", fileName)
}
// loadDocument('../Resume_Shreevathsa1.pdf')

import SummaryModel from '../schema/ResponseSchema.js'
export async function generateSummary(text, sessionid) {
    console.log("Generating summary...")
    const model = new ChatGoogleGenerativeAI({
        apiKey: process.env.GEMINI_API_KEY,
        model: 'gemini-2.5-flash',
    });
    const fullText = text.map(doc => doc.pageContent).join("\n");
    console.log(fullText.length)
    const prompt = `Please summarize the following document in clear language must include all the keywords of topics so that user can get the complete understanding of all the things covered in this document context, label module wise + topic wise + subtopics + topics inside subtopics structured clearly to get the complete gist of what is there in the document without the need of reaching completely:\n\n${fullText}`;
    try {
        const res= await model.invoke(prompt);
        const summary=res.content;
        console.log("Summary generated...")
        await SummaryModel.create({sessionid,summary})
        console.log("Induced summary into mongo")
    } catch (error) {
        console.log(error)
    }
}