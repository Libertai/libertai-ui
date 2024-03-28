import axios from 'axios';

// Naive chunking implementation
export function chunkText(text, chunkSize=500, overlapSize=50) {
  const chunks = [];
  for (let i = 0; i < text.length; i += chunkSize - overlapSize) {
    chunks.push(text.slice(i, i + chunkSize));
  }
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