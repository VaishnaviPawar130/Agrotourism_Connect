import { generateEmbedding } from '../embedding/embedding.service';
import { KnowledgeChunk } from '../knowledge/knowledge.model';

const VECTOR_INDEX_NAME = 'knowledge_vector_index';

export async function retrieveRelevantKnowledge(
    query: string,
    limit = 5
) {
    const queryEmbedding = await generateEmbedding(query);

    const results = await KnowledgeChunk.aggregate([
        {
            $vectorSearch: {
                index: VECTOR_INDEX_NAME,
                path: 'embedding',
                queryVector: queryEmbedding,
                numCandidates: 50,
                limit,
                filter: {
                    visibility: 'PUBLIC'
                }
            }
        },
        {
            $project: {
                _id: 0,
                title: 1,
                content: 1,
                category: 1,
                sourceType: 1,
                sourceName: 1,
                metadata: 1,
                score: {
                    $meta: 'vectorSearchScore'
                }
            }
        }
    ]);

    const MIN_SCORE = 0.80;

    return results.filter((item) => item.score >= MIN_SCORE);
}