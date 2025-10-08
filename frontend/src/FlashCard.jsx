import React from "react";
import { useParams } from "react-router";
import FlashCardComponent from "./components/FlashCardComponent";
import Uploader from "./components/Uploader";

export default function FlashCard() {
  // Grab the sessionId from the URL
  const { session } = useParams();

  return (
    <div className="h-screen flex p-4 bg-gray-100 space-x-4">
      {/* Chat Section (3/4) */}
      <div className="flex-1">
        <FlashCardComponent sessionId={session} />
      </div>
      {/* updating comments */}
      {/* Upload Section (1/4) */}
      <div className="w-1/4">
        <Uploader sessionId={session} />
      </div>
    </div>
  );
}
