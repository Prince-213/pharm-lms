import { z } from "zod";

export const createCourseSchema = z.object({
  title: z.string().min(3).max(120),
  subtitle: z.string().max(160).optional().nullable(),
  description: z.string().min(20).max(100000).optional(),
  language: z.string().max(64).optional().nullable(),
  level: z.string().max(64).optional().nullable(),
  category: z.string().max(120).optional().nullable(),
});

export const createSectionSchema = z.object({
  courseId: z.string().cuid(),
  title: z.string().min(3),
  position: z.number().int().positive(),
});

export const createAssignmentSchema = z.object({
  courseId: z.string().cuid(),
  title: z.string().min(5).max(150),
  description: z.string().min(20),
  dueDate: z.string().datetime().optional(),
});

export const meetingRequestSchema = z.object({
  courseId: z.string().cuid().optional(),
  mentorId: z.string().cuid(),
  preferredTime: z.string().datetime().optional(),
  message: z.string().max(500).optional(),
  instant: z.boolean().optional(),
});
