require('dotenv').config();
const fs = require('fs');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini client
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);

// Function to calculate cosine similarity between two vectors
function cosineSimilarity(vecA, vecB) {
  const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
  return dotProduct / (magnitudeA * magnitudeB);
}

// Function to search through embeddings
async function search(query, topK = 5) {
  try {
    // Create embedding for the search query
    const model = genAI.getGenerativeModel({ model: "embedding-001" });
    const result = await model.embedContent(query);
    const queryEmbedding = result.embedding.values;

    // Load embeddings from file
    const embeddings = JSON.parse(fs.readFileSync('embeddings.json', 'utf-8'));

    // Calculate similarity scores
    const results = embeddings.map(item => ({
      ...item,
      similarity: cosineSimilarity(queryEmbedding, item.embedding)
    }));

    // Sort by similarity and get top K results
    const topResults = results
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, topK);

    return topResults;
  } catch (error) {
    console.error('Error searching:', error);
    return [];
  }
}

// Example usage
async function main() {
  const query = process.argv[2] || 'What are the best beaches in the Philippines?';
  console.log(`Searching for: ${query}\n`);
  
  const results = await search(query);
  
  results.forEach((result, index) => {
    console.log(`Result ${index + 1}:`);
    console.log(`File: ${result.file}`);
    console.log(`Similarity: ${result.similarity.toFixed(4)}`);
    console.log(`Text: ${result.text.substring(0, 200)}...\n`);
  });
}

// Run the search if this file is executed directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { search }; 