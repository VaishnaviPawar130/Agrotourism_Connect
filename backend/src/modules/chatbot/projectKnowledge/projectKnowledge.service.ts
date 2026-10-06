import { Project } from '../../projects/project.model';
import { ProjectStatus } from '../../projects/project.types';
import { generateEmbedding } from '../embedding/embedding.service';
import { KnowledgeChunk } from '../knowledge/knowledge.model';

const PUBLIC_PROJECT_STATUSES = [
    ProjectStatus.PLANNING,
    ProjectStatus.FEASIBILITY,
    ProjectStatus.INVESTOR_REQUIRED,
    ProjectStatus.UNDER_DEVELOPMENT,
    ProjectStatus.OPERATIONAL,
];

export async function syncPublicProjectsToKnowledge() {
    const projects = await Project.find({
        isPublic: true,
        status: { $in: PUBLIC_PROJECT_STATUSES },
    })
        .select(
            'projectName slug location totalLand projectType description status startDate expectedCompletion thumbnail'
        )
        .lean();

    for (const project of projects) {
        const content = [
            `Project Name: ${project.projectName}`,
            `Location: ${project.location}`,
            `Project Type: ${project.projectType}`,
            `Status: ${project.status}`,
            project.totalLand != null
                ? `Total Land: ${project.totalLand}`
                : null,
            project.description
                ? `Description: ${project.description}`
                : null,
            project.startDate
                ? `Start Date: ${project.startDate.toISOString()}`
                : null,
            project.expectedCompletion
                ? `Expected Completion: ${project.expectedCompletion.toISOString()}`
                : null,
        ]
            .filter(Boolean)
            .join('\n');

        const embedding = await generateEmbedding(content);

        await KnowledgeChunk.updateOne(
            {
                sourceType: 'PROJECT',
                sourceId: project._id,
            },
            {
                $set: {
                    title: project.projectName,
                    content,
                    category: 'PROJECT',
                    visibility: 'PUBLIC',
                    sourceType: 'PROJECT',
                    sourceId: project._id,
                    sourceName: project.projectName,
                    embedding,
                    metadata: {
                        location: project.location,
                        projectStatus: project.status,
                        projectType: project.projectType,
                    },
                },
            },
            { upsert: true }
        );
    }

    // Remove knowledge for projects that are no longer public/searchable
    const validProjectIds = projects.map((project) => project._id);

    await KnowledgeChunk.deleteMany({
        sourceType: 'PROJECT',
        $or: [
            { sourceId: { $nin: validProjectIds } },
            { visibility: { $ne: 'PUBLIC' } },
        ],
    });

    return {
        synced: projects.length,
    };
}