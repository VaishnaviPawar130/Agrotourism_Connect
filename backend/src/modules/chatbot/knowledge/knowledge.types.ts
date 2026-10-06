import type { Types } from 'mongoose';

export const KNOWLEDGE_SOURCE_TYPES = [
    'PROJECT',
    'COMPANY',
    'CONTACT',
    'SERVICE',
    'FAQ',
    'TRAINING',
] as const;

export type KnowledgeSourceType =
    (typeof KNOWLEDGE_SOURCE_TYPES)[number];

export interface IKnowledgeChunk {
    title: string;
    content: string;
    category: string;
    visibility: 'PUBLIC' | 'INTERNAL';
    sourceType: KnowledgeSourceType;
    sourceId: Types.ObjectId | string;
    sourceName: string;
    embedding: number[];
    metadata?: {
        location?: string;
        projectStatus?: string;
        projectType?: string;

        sourcePath?: string;
        sourceFile?: string;
        section?: string;
        managedBy?: string;
    };
}

