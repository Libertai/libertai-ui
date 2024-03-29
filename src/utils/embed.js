import axios from 'axios';
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

// Naive chunking implementation
export async function chunkText(documentName, text, chunkSize=500, overlapSize=100) {
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: chunkSize,
    chunkOverlap: overlapSize,
    separators: ["\n\n---\n\n", "\n\n", "\n", " "],
  });

  // const chunks = [];
  // for (let i = 0; i < text.length; i += chunkSize - overlapSize) {
  //   chunks.push(text.slice(i, i + chunkSize));
  // }

  // this is a list of langchain document
  const output = await splitter.createDocuments(
    [text],
    [],
    {
      chunkHeader: `DOCUMENT NAME: ${documentName}\n\n---\n\n`,
      appendChunkOverlapHeader: true
    }
  );
  console.log(output);

  // python: [item.pageContent for item in output]
  const chunks = output.map((i) => i.pageContent);
  console.log(chunks)

  return chunks;
}

export async function embed(content) {
    let apiUrl = "https://curated.aleph.cloud/vm/ee1b2a8e5bd645447739d8b234ef495c9a2b4d0b98317d510a3ccf822808ebe5/embedding";
    // Actually do the completion, calling the engine API
    let params = {
        content: content,
    };
    
    const response = await axios.post(
        apiUrl, params,
    );

    return response.data.embedding;
}