import { getAllDocs, getAllDocsNoFormat } from "./Retriver.js"

export async function summarizeAndStore() {
    const db=getAllDocsNoFormat()
    console.log((await db).length)
}
summarizeAndStore()