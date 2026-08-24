import { z } from 'zod';
import { EmploymentType, VacancyStatus } from './vacancy.types';

const dateField = z.coerce.date().optional();

const nonNegativeInt = z.number().int().nonnegative().max(60).optional();
const amount = z.number().nonnegative().max(1_000_000_000).optional();

export const createVacancySchema = z
  .object({
    title: z.string().trim().min(2, 'Job title is required').max(200),
    department: z.string().trim().min(2, 'Department is required').max(100),
    location: z.string().trim().min(2, 'Location is required').max(200),
    employmentType: z.nativeEnum(EmploymentType),
    openings: z.number().int().min(1).max(1000).default(1),

    minExperience: nonNegativeInt,
    maxExperience: nonNegativeInt,
    minSalary: amount,
    maxSalary: amount,

    description: z.string().trim().min(10, 'Description must be at least 10 characters').max(10_000),
    responsibilities: z.array(z.string().trim().min(1).max(500)).max(50).default([]),
    requiredSkills: z.array(z.string().trim().min(1).max(100)).max(50).default([]),

    applicationDeadline: dateField,
    status: z.nativeEnum(VacancyStatus).default(VacancyStatus.DRAFT),
    featured: z.boolean().default(false),
    urgent: z.boolean().default(false),
  })
  .refine((data) => data.minExperience == null || data.maxExperience == null || data.minExperience <= data.maxExperience, {
    message: 'Minimum experience cannot exceed maximum experience',
    path: ['maxExperience'],
  })
  .refine((data) => data.minSalary == null || data.maxSalary == null || data.minSalary <= data.maxSalary, {
    message: 'Minimum salary cannot exceed maximum salary',
    path: ['maxSalary'],
  });

export const updateVacancySchema = z
  .object({
    title: z.string().trim().min(2).max(200).optional(),
    department: z.string().trim().min(2).max(100).optional(),
    location: z.string().trim().min(2).max(200).optional(),
    employmentType: z.nativeEnum(EmploymentType).optional(),
    openings: z.number().int().min(1).max(1000).optional(),

    minExperience: nonNegativeInt,
    maxExperience: nonNegativeInt,
    minSalary: amount,
    maxSalary: amount,

    description: z.string().trim().min(10).max(10_000).optional(),
    responsibilities: z.array(z.string().trim().min(1).max(500)).max(50).optional(),
    requiredSkills: z.array(z.string().trim().min(1).max(100)).max(50).optional(),

    applicationDeadline: dateField,
    status: z.nativeEnum(VacancyStatus).optional(),
    featured: z.boolean().optional(),
    urgent: z.boolean().optional(),
  })
  .refine((data) => data.minExperience == null || data.maxExperience == null || data.minExperience <= data.maxExperience, {
    message: 'Minimum experience cannot exceed maximum experience',
    path: ['maxExperience'],
  })
  .refine((data) => data.minSalary == null || data.maxSalary == null || data.minSalary <= data.maxSalary, {
    message: 'Minimum salary cannot exceed maximum salary',
    path: ['maxSalary'],
  });

export const updateVacancyStatusSchema = z.object({
  status: z.nativeEnum(VacancyStatus),
});

export type CreateVacancyInput = z.infer<typeof createVacancySchema>;
export type UpdateVacancyInput = z.infer<typeof updateVacancySchema>;
