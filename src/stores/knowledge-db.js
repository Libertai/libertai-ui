import { defineStore } from "pinia";
import { v4 as uuidv4 } from "uuid";
import distance from "euclidean-distance";

import { embed, chunkText } from "../utils/embed";

const KNOWLEDGE_DB_KEY = "knowledge-db";
const KNOWLEDGE_DB_DOCUMENTS_KEY = "knowledge-db-documents";
const KNOWLEDGE_DB_EMBEDDINGS_KEY = "knowledge-db-embeddings";

export const useKnowledgeDBStore = defineStore(KNOWLEDGE_DB_KEY, {
  state: () => ({
    documents: [],
    embeddings: [],
  }),
  actions: {
    async loadFromStorage() {
      try {
        let documents = localStorage.getItem(KNOWLEDGE_DB_DOCUMENTS_KEY);
        let embeddings = localStorage.getItem(KNOWLEDGE_DB_EMBEDDINGS_KEY);
        if (documents) {
          this.documents = JSON.parse(documents);
        }
        if (embeddings) {
          this.embeddings = JSON.parse(embeddings);
        }
      } catch (error) {
        console.error("Error initializing knowledgeDB:", error);
      }
    },
    async addDocument(title, content) {
      // Add our new document
      let id = uuidv4();
      let document = {
        id,
        title,
        content,
      };
      this.documents.push(document);

      // Generate our embeddings
      let chunks = await chunkText(title, document.content);
      console.log("Chunks: ", chunks);
      let promises = [];
      for (let chunk of chunks) {
        promises.push(
          (async function () {
            let id = uuidv4();
            let e = await embed(chunk);
            let embedding = {
              id,
              document_id: document.id,
              content: chunk,
              embedding: e,
            };
            console.log("Embed: ", embedding);
            return embedding;
          })()
        );
      }
      let embeddings = await Promise.all(promises);
      this.embeddings = this.embeddings.concat(embeddings);
      console.log("Generated embeddings: ", embeddings);

      // Done!
      // this.saveToStorage();
    },
    // TODO: probably horribly inefficient, but it works for now
    async search(query, num_results = 5, max_distance = 20) {
      let query_embedding = await embed(query);
      console.log("Query embedding: ", query_embedding);
      let res = {
        query,
        embedding: query_embedding,
        matches: [],
      };
      let farthest = Number.MAX_VALUE;
      let farthest_index = -1;
      // Iterate over all embeddings
      for (let embedding of this.embeddings) {
        console.log("Considering Embedding: ", embedding);
        // Get the euclidean distance between the query and the embedding
        let euclidean_distance = distance(query_embedding, embedding.embedding);
        console.log("Distance: ", euclidean_distance);
        if (euclidean_distance > max_distance) {
          continue;
        }

        // If we have less than num_results matches, add this one
        if (res.matches.length < num_results) {
          console.log("Adding match");
          res.matches.push({
            id: embedding.id,
            document_id: embedding.document_id,
            content: embedding.content,
            embedding: embedding.embedding,
            distance: euclidean_distance,
          });
          // Make sure we keep track of the farthest match, if it is indeed the farthest
          if (euclidean_distance > farthest) {
            console.log("New farthest match: ", euclidean_distance);
            farthest = euclidean_distance;
            farthest_index = res.matches.length - 1;
          }
        }
        // Otherwise, decide if we should replace the farthest match
        else if (euclidean_distance < farthest) {
          console.log("Replacing farthest match");
          console.log("Old farthest: ", farthest);
          console.log("Old farthest index: ", farthest_index);
          // Replace the farthest match
          res.matches[farthest_index] = {
            id: embedding.id,
            document_id: embedding.document_id,
            content: embedding.content,
            embedding: embedding.embedding,
            distance: euclidean_distance,
          };
          // Naively find the new farthest match
          farthest = Number.MIN_VALUE;
          for (let i = 0; i < res.matches.length; i++) {
            if (res.matches[i].distance > farthest) {
              farthest = res.matches[i].distance;
              farthest_index = i;
            }
          }
          console.log("New farthest: ", farthest);
          console.log("New farthest index: ", farthest_index);
        }
      }
      return res;
    },
    saveToStorage() {
      try {
        localStorage.setItem(
          KNOWLEDGE_DB_DOCUMENTS_KEY,
          JSON.stringify(this.documents)
        );
        localStorage.setItem(
          KNOWLEDGE_DB_EMBEDDINGS_KEY,
          JSON.stringify(this.embeddings)
        );
      } catch (error) {
        console.error("Error saving knowledgeDB to local storage:", error);
      }
    },
  },
});
