import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type OpenAI from 'openai';
import { KnowledgeChunk } from '../modules/chatbot/knowledge/knowledge.model';
import { PUBLIC_KNOWLEDGE } from '../modules/chatbot/publicKnowledge/publicKnowledge.data';
import { PUBLIC_KNOWLEDGE as legacyKnowledge } from '../modules/chatbot/publicKnowledge.data';
import { syncPublicKnowledge } from '../modules/chatbot/publicKnowledge/publicKnowledge.service';
import { retrieveIntentKnowledge, selectRelevantEvidence } from '../modules/chatbot/chatbot.evidence';
import { retrieveRelevantKnowledge } from '../modules/chatbot/retrieval/retrieval.service';

const { embed } = vi.hoisted(() => ({ embed: vi.fn() }));
vi.mock('../modules/chatbot/embedding/embedding.service', () => ({ generateEmbedding: embed }));

const overview = PUBLIC_KNOWLEDGE.find((item) => item.sourceId === 'company:overview')!;
const core = PUBLIC_KNOWLEDGE.find((item) => item.sourceId === 'service:core-services')!;
const land = PUBLIC_KNOWLEDGE.find((item) => item.sourceId === 'service:land-development')!;
const questions = [
    'What does your project do?',
    'What does this platform do?',
    'What is Agrotourism Connect?',
    'What services do you provide?',
    'How can you help a landowner?',
];

let aggregate: ReturnType<typeof vi.spyOn>;
let find: ReturnType<typeof vi.spyOn>;
let upsert: ReturnType<typeof vi.spyOn>;
let remove: ReturnType<typeof vi.spyOn>;
let query: { select: ReturnType<typeof vi.fn>; sort: ReturnType<typeof vi.fn>; limit: ReturnType<typeof vi.fn>; lean: ReturnType<typeof vi.fn> };

beforeEach(() => {
    embed.mockReset().mockResolvedValue([0.1, 0.2, 0.3]);
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    aggregate = vi.spyOn(KnowledgeChunk, 'aggregate').mockResolvedValue([]);
    query = { select: vi.fn(), sort: vi.fn(), limit: vi.fn(), lean: vi.fn().mockResolvedValue([overview, core, land]) };
    query.select.mockReturnValue(query);
    query.sort.mockReturnValue(query);
    query.limit.mockReturnValue(query);
    find = vi.spyOn(KnowledgeChunk, 'find').mockReturnValue(query as never);
    upsert = vi.spyOn(KnowledgeChunk, 'findOneAndUpdate').mockResolvedValue(null);
    remove = vi.spyOn(KnowledgeChunk, 'deleteMany').mockResolvedValue({ acknowledged: true, deletedCount: 0 });
});
afterEach(() => vi.restoreAllMocks());

describe('public knowledge provenance and sync', () => {
    it('has one canonical dataset with valid schema and existing public sources', () => {
        expect(legacyKnowledge).toBe(PUBLIC_KNOWLEDGE);
        expect(new Set(PUBLIC_KNOWLEDGE.map((item) => item.sourceId)).size).toBe(PUBLIC_KNOWLEDGE.length);
        for (const item of PUBLIC_KNOWLEDGE) {
            expect(new KnowledgeChunk({ ...item, visibility: 'PUBLIC' }).validateSync()).toBeUndefined();
            const source = resolve(__dirname, '../../..', item.metadata!.sourceFile!);
            expect(existsSync(source), item.title).toBe(true);
            expect(item.metadata?.sourcePath).toMatch(/^\//);
        }
        for (const title of ['Land Development', 'Resort Development', 'Agro Tourism', 'Land Advisory',
            'Project Planning', 'Approvals & Legal', 'Development Support', 'Marketing & Sales', 'Operations Support']) {
            expect(core.content).toContain(title);
            expect(readFileSync(resolve(__dirname, '../../../frontend/src/pages/public/HomePage.tsx'), 'utf8')).toContain(title);
        }
    });

    it('validates dry-run without embedding, database queries, writes or cleanup', async () => {
        expect(await syncPublicKnowledge({ dryRun: true })).toEqual({ synced: 0, planned: PUBLIC_KNOWLEDGE.length });
        for (const call of [embed, find, aggregate, upsert, remove]) expect(call).not.toHaveBeenCalled();
    });

    it('upserts every public record into the same model used by retrieval', async () => {
        expect(await syncPublicKnowledge()).toEqual({ synced: PUBLIC_KNOWLEDGE.length });
        expect(KnowledgeChunk.collection.collectionName).toBe('knowledgechunks');
        expect(upsert).toHaveBeenCalledTimes(PUBLIC_KNOWLEDGE.length);
        PUBLIC_KNOWLEDGE.forEach((record, index) => {
            expect(embed.mock.calls[index][0]).toBe(`${record.title}\n${record.content}`);
            expect(upsert.mock.calls[index]).toEqual([
                { sourceType: record.sourceType, sourceId: record.sourceId },
                { $set: expect.objectContaining({ ...record, visibility: 'PUBLIC', embedding: [0.1, 0.2, 0.3] }) },
                { upsert: true, new: true, runValidators: true },
            ]);
        });
        expect(remove).toHaveBeenCalledWith({
            'metadata.managedBy': 'public-website-sync',
            sourceId: { $nin: PUBLIC_KNOWLEDGE.map((item) => item.sourceId) },
        });
    });

    it('does not prune old records when embedding fails', async () => {
        embed.mockRejectedValueOnce(new Error('provider unavailable'));
        await expect(syncPublicKnowledge()).rejects.toThrow('provider unavailable');
        expect(remove).not.toHaveBeenCalled();
        expect(upsert).not.toHaveBeenCalled();
    });
});

describe('intent-specific retrieval through the real retrieval functions', () => {
    // Embeddings and MongoDB responses are mocked; no claim of live vector accuracy.
    it.each(questions)('retrieves verified service records for %s', async (message) => {
        aggregate.mockResolvedValue([{ ...land, score: 0.91 }]);
        const result = await retrieveIntentKnowledge(message, 'ABOUT_SERVICES');
        expect(result.map((item) => item.title)).toEqual([overview.title, core.title, land.title]);
        expect(result.length).toBeLessThanOrEqual(5);
        expect(embed.mock.calls[0][0]).toContain(message);
        expect(embed.mock.calls[0][0]).toContain('Land Development, Resort Development, Agro Tourism');
        expect(aggregate.mock.calls[0][0][0].$vectorSearch).toMatchObject({
            index: 'knowledge_vector_index', limit: 5, filter: { visibility: 'PUBLIC' },
        });
        expect(find).toHaveBeenCalledWith({
            visibility: 'PUBLIC', sourceType: { $in: ['COMPANY', 'SERVICE'] },
            category: { $in: ['ABOUT_SERVICES', 'SERVICES'] }, 'metadata.managedBy': 'public-website-sync',
        });
        expect(query.limit).toHaveBeenCalledWith(5);
    });

    it.each(questions)('recovers synced services when vector scores are too low: %s', async (message) => {
        aggregate.mockResolvedValue([{ ...overview, score: 0.79 }]);
        const result = await retrieveIntentKnowledge(message, 'ABOUT_SERVICES');
        expect(result).toContainEqual(core);
        expect(result).toContainEqual(overview);
    });

    it('preserves the vector score threshold', async () => {
        aggregate.mockResolvedValue([{ ...land, score: 0.79 }, { ...core, score: 0.8 }]);
        expect(await retrieveRelevantKnowledge('Company services', 5)).toEqual([{ ...core, score: 0.8 }]);
    });

    it('uses synced service records if embeddings fail', async () => {
        embed.mockRejectedValueOnce(new Error('offline'));
        expect(await retrieveIntentKnowledge(questions[0], 'ABOUT_SERVICES')).toContainEqual(core);
        expect(aggregate).not.toHaveBeenCalled();
    });

    it('keeps semantic evidence if the supplemental lookup fails', async () => {
        aggregate.mockResolvedValue([{ ...land, score: 0.95 }]);
        query.lean.mockRejectedValue(new Error('lookup failed'));
        expect(await retrieveIntentKnowledge(questions[4], 'ABOUT_SERVICES')).toEqual([{ ...land, score: 0.95 }]);
    });

    it('returns no invented/static evidence when the database has no knowledge', async () => {
        query.lean.mockResolvedValue([]);
        expect(await retrieveIntentKnowledge(questions[0], 'ABOUT_SERVICES')).toEqual([]);
    });

    it('does not substitute service descriptions for PUBLIC_PROJECTS', async () => {
        aggregate.mockResolvedValue([{ ...core, score: 0.98 }]);
        expect(await retrieveIntentKnowledge('What projects are available?', 'PUBLIC_PROJECTS')).toEqual([]);
        expect(find).not.toHaveBeenCalled();
    });

    it('keeps actual public project records and excludes service results', async () => {
        const project = { sourceType: 'PROJECT', title: 'Test project', content: 'Status: PLANNING', score: 0.9 };
        aggregate.mockResolvedValue([{ ...core, score: 0.98 }, project]);
        expect(await retrieveIntentKnowledge('What projects are available?', 'PUBLIC_PROJECTS')).toEqual([project]);
    });

    it('refuses service-only project evidence before calling the model', async () => {
        const create = vi.fn();
        const client = { chat: { completions: { create } } } as unknown as OpenAI;
        expect(await selectRelevantEvidence('What projects are available?', 'PUBLIC_PROJECTS', [core], client, 'mock')).toEqual([]);
        expect(create).not.toHaveBeenCalled();
    });

    it.each(questions)('accepts selected overview/service evidence for %s', async (message) => {
        const create = vi.fn().mockResolvedValue({ choices: [{ message: { content: '[0,1]' } }] });
        const client = { chat: { completions: { create } } } as unknown as OpenAI;
        expect(await selectRelevantEvidence(message, 'ABOUT_SERVICES', [overview, core], client, 'mock')).toEqual([overview, core]);
        expect(create.mock.calls[0][0].messages[0].content).toContain('Accept semantic paraphrases');
        expect(create.mock.calls[0][0].messages[0].content).toContain('do not require an exhaustive catalogue or current project listings');
    });
});
