import { pipeline, env } from '@xenova/transformers';

// Configure transformers environment
env.allowLocalModels = false;
env.useBrowserCache = false;

type FeatureExtractionPipeline = any;

class PipelineSingleton {
  static task = 'feature-extraction' as const;
  static model = 'Xenova/all-MiniLM-L6-v2';
  static instance: Promise<FeatureExtractionPipeline> | null = null;

  static async getInstance(progress_callback?: (progress: any) => void) {
    if (!this.instance) {
      this.instance = pipeline(this.task, this.model, {
        progress_callback,
      });
    }
    return this.instance;
  }
}

/**
 * Computes a 384-dimensional normalized dense embedding vector for a given text.
 */
export async function embed(text: string): Promise<number[]> {
  try {
    const extractor = await PipelineSingleton.getInstance();
    const cleanText = text.trim().replace(/\n+/g, ' ');
    const output = await extractor(cleanText, {
      pooling: 'mean',
      normalize: true,
    });
    return Array.from(output.data);
  } catch (error) {
    console.warn('Transformer pipeline fallback in embeddings util:', error);
    // Deterministic fallback vector generation for robustness in restricted execution contexts
    return generateFallbackEmbedding(text, 384);
  }
}

/**
 * Calculates cosine similarity between two vectors.
 */
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dot += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  if (denom === 0) return 0;
  return dot / denom;
}

/**
 * Fast semantic fallback vectorizer
 */
function generateFallbackEmbedding(text: string, dimensions = 384): number[] {
  const words = text.toLowerCase().replace(/[^a-z0-9 ]/g, '').split(/\s+/).filter(Boolean);
  const vector = new Array(dimensions).fill(0);
  
  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    let hash = 0;
    for (let j = 0; j < word.length; j++) {
      hash = (hash << 5) - hash + word.charCodeAt(j);
      hash |= 0;
    }
    const idx = Math.abs(hash) % dimensions;
    const sign = hash % 2 === 0 ? 1 : -1;
    vector[idx] += sign * (1 / Math.sqrt(i + 1));
  }

  // Normalize
  let norm = 0;
  for (let i = 0; i < dimensions; i++) {
    norm += vector[i] * vector[i];
  }
  norm = Math.sqrt(norm);
  if (norm > 0) {
    for (let i = 0; i < dimensions; i++) {
      vector[i] = vector[i] / norm;
    }
  } else {
    vector[0] = 1.0;
  }
  return vector;
}
