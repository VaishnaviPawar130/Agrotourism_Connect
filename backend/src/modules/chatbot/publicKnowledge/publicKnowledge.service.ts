// publicKnowledge.data.ts
// → create embedding
// → save/update knowledgechunks
// → visibility = PUBLIC

import { generateEmbedding } from '../embedding/embedding.service';
import { KnowledgeChunk } from '../knowledge/knowledge.model';
import { PUBLIC_KNOWLEDGE } from './publicKnowledge.data';

const PUBLIC_KNOWLEDGE_MANAGER = 'public-website-sync';

export async function syncPublicKnowledge() {
    // 1. Check duplicate sourceType + sourceId combinations
    const seen = new Set<string>();

    for (const item of PUBLIC_KNOWLEDGE) {
        const key = `${item.sourceType}:${item.sourceId}`;

        if (seen.has(key)) {
            throw new Error(
                `Duplicate public knowledge record found: ${key}`
            );
        }

        seen.add(key);
    }

    // 2. Keep track of active source IDs
    const activeSourceIds = PUBLIC_KNOWLEDGE.map(
        (item) => item.sourceId
    );

    // 3. Generate embedding and upsert each record
    for (const item of PUBLIC_KNOWLEDGE) {
        const embedding = await generateEmbedding(item.content);

        await KnowledgeChunk.findOneAndUpdate(
            {
                sourceType: item.sourceType,
                sourceId: item.sourceId,
            },
            {
                $set: {
                    title: item.title,
                    content: item.content,
                    category: item.category,
                    visibility: 'PUBLIC',
                    sourceType: item.sourceType,
                    sourceId: item.sourceId,
                    sourceName: item.sourceName,
                    embedding,
                    metadata: {
                        ...item.metadata,
                        managedBy: PUBLIC_KNOWLEDGE_MANAGER,
                    },
                },
            },
            {
                upsert: true,
                new: true,
                runValidators: true,
            }
        );
    }

    // 4. Remove retired records created by this sync only
    await KnowledgeChunk.deleteMany({
        'metadata.managedBy': PUBLIC_KNOWLEDGE_MANAGER,
        sourceId: {
            $nin: activeSourceIds,
        },
    });

    return {
        synced: PUBLIC_KNOWLEDGE.length,
    };
}