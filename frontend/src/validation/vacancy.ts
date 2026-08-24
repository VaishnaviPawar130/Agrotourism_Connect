import { z } from 'zod';
import { EmploymentType, VacancyStatus } from '../types';
import { requiredText, optionalDate, nonNegativeAmount } from './common';

const nonNegativeYears = z.number().int('Must be a whole number').min(0, 'Cannot be negative').max(60, 'Value looks unrealistic').optional();

export const vacancyFormSchema = z
  .object({
    title: requiredText('Job title', 2, 200),
    department: requiredText('Department', 2, 100),
    location: requiredText('Location', 2, 200),
    employmentType: z.nativeEnum(EmploymentType, { errorMap: () => ({ message: 'Please select an employment type' }) }),
    openings: z.number().int().min(1, 'At least 1 opening is required').max(1000, 'Number of openings looks unrealistic'),

    minExperience: nonNegativeYears,
    maxExperience: nonNegativeYears,
    minSalary: nonNegativeAmount('Minimum salary').max(1_000_000_000).optional(),
    maxSalary: nonNegativeAmount('Maximum salary').max(1_000_000_000).optional(),

    description: z.string().trim().min(1, 'Job description is required').min(10, 'Description must be at least 10 characters').max(10_000),
    responsibilitiesText: z.string().optional(),
    requiredSkillsText: z.string().optional(),

    applicationDeadline: optionalDate,
    status: z.nativeEnum(VacancyStatus),
    featured: z.boolean(),
    urgent: z.boolean(),
  })
  .refine((data) => data.minExperience == null || data.maxExperience == null || data.minExperience <= data.maxExperience, {
    message: 'Minimum experience cannot exceed maximum experience',
    path: ['maxExperience'],
  })
  .refine((data) => data.minSalary == null || data.maxSalary == null || data.minSalary <= data.maxSalary, {
    message: 'Minimum salary cannot exceed maximum salary',
    path: ['maxSalary'],
  });

export type VacancyFormValues = z.infer<typeof vacancyFormSchema>;
