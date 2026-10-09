import { generateEmbedding } from '../embedding/embedding.service';
import { KnowledgeChunk } from '../knowledge/knowledge.model';

const VECTOR_INDEX_NAME = 'knowledge_vector_index';

// Intent-scoped supplemental retrieval from the same collection as vector search.
// Never use unsynced constants or private records as company answer evidence.
export async function retrievePublicServiceKnowledge(limit = 40) {
    return KnowledgeChunk.find({
        visibility: 'PUBLIC',
        sourceType: { $in: ['COMPANY', 'SERVICE'] },
        category: { $in: ['ABOUT_SERVICES', 'SERVICES'] },
        'metadata.managedBy': 'public-website-sync',
    })
        .select('title category sourceType sourceId sourceName content')
        // COMPANY precedes SERVICE; the overview and core summary fit within five.
        .sort({ sourceType: 1, sourceId: 1 })
        .limit(limit)
        .lean();
}

export async function retrievePublicTopicKnowledge(category: string, limit = 12) {
    return KnowledgeChunk.find({
        visibility: 'PUBLIC',
        'metadata.managedBy': 'public-website-sync',
        $or: [
            { category },
            ...(category === 'INVESTMENT' ? [{ sourceId: 'service:investment-platform' }, { sourceId: 'service:investor-facilitation' }] : []),
        ],
    })
        .select('title category sourceType sourceId sourceName content')
        .sort({ sourceId: 1 }).limit(limit).lean();
}

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
                sourceId: 1,
                score: {
                    $meta: 'vectorSearchScore'
                }
            }
        }
    ]);

    const MIN_SCORE = 0.80;

    return results.filter((item) => item.score >= MIN_SCORE);
}
