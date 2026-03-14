const { pipeline } = require('@xenova/transformers');

let extractor = null;

/**
 * Loads the embedding model.
 * Uses Xenova/all-MiniLM-L6-v2 which produces 384-dimensional vectors.
 */
async function initEngine() {
    if (extractor) return extractor;
    console.log('Loading Vector Engine (all-MiniLM-L6-v2)...');
    extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
    console.log('Vector Engine Ready.');
    return extractor;
}

/**
 * Generates an embedding for the given text.
 * @param {string} text 
 * @returns {Promise<number[]>}
 */
async function generateEmbedding(text) {
    const model = await initEngine();
    const output = await model(text, { pooling: 'mean', normalize: true });
    return Array.from(output.data);
}

/**
 * Calculates cosine similarity between two vectors.
 * @param {number[]} vecA 
 * @param {number[]} vecB 
 * @returns {number}
 */
function cosineSimilarity(vecA, vecB) {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < vecA.length; i++) {
        dotProduct += vecA[i] * vecB[i];
        normA += vecA[i] * vecA[i];
        normB += vecB[i] * vecB[i];
    }
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

module.exports = {
    generateEmbedding,
    cosineSimilarity
};
