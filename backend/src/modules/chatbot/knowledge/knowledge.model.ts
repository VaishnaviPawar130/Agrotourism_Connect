import { Schema, model } from 'mongoose';
import { KNOWLEDGE_SOURCE_TYPES } from './knowledge.types';
import type { IKnowledgeChunk } from './knowledge.types';

export { KNOWLEDGE_SOURCE_TYPES } from './knowledge.types';
export type { KnowledgeSourceType, IKnowledgeChunk } from './knowledge.types';

const knowledgeChunkSchema = new Schema<IKnowledgeChunk>(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },

        content: {
            type: String,
            required: true,
        },

        category: {
            type: String,
            required: true,
        },

        visibility: {
            type: String,
            enum: ['PUBLIC', 'INTERNAL'],
            required: true,
            default: 'PUBLIC',
            index: true,
        },

        sourceType: {
            type: String,
            enum: KNOWLEDGE_SOURCE_TYPES,
            required: true,
        },

        sourceId: {
            type: Schema.Types.Mixed,
            required: true,
            index: true,
        },

        sourceName: {
            type: String,
            required: true,
        },

        embedding: {
            type: [Number],
            default: [],
        },

        metadata: {
            location: String,
            projectStatus: String,
            projectType: String,

            sourcePath: String,
            sourceFile: String,
            section: String,
            managedBy: String,
        },
    },
    {
        timestamps: true,
    }
);

knowledgeChunkSchema.index({
    sourceType: 1,
    sourceId: 1,
    visibility: 1,
});

export const KnowledgeChunk = model<IKnowledgeChunk>(
    'KnowledgeChunk',
    knowledgeChunkSchema
);