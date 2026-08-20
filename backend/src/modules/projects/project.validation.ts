import { z } from 'zod';
import { ProjectType, ProjectStatus } from './project.types';

export const createProjectSchema = z.object({
  projectName: z.string().min(2),
  land: z.string().optional(),
  landowner: z.string().optional(),
  location: z.string().min(2),
  totalLand: z.number().positive().optional(),
  projectType: z.nativeEnum(ProjectType),
  description: z.string().optional(),
  projectManager: z.string().optional(),
  startDate: z.coerce.date().optional(),
  expectedCompletion: z.coerce.date().optional(),
  isPublic: z.boolean().optional(),
});

export const updateProjectSchema = createProjectSchema.partial().extend({
  status: z.nativeEnum(ProjectStatus).optional(),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
