import { pgTable, text, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const SUBJECTS = [
  "عربي",
  "إنجليزي",
  "رياضيات",
  "كيمياء",
  "فيزياء",
  "أحياء",
  "إسلامية وقرآن",
  "اجتماعيات",
  "جيولوجيا",
  "دستور",
] as const;

export const DAYS = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس"] as const;

export const PERIODS = [1, 2, 3, 4, 5, 6, 7] as const;

export const GRADES = [10, 11, 12] as const;

export const SECTIONS = [1, 2, 3, 4, 5, 6, 7, 8] as const;

export type Subject = typeof SUBJECTS[number];
export type Day = typeof DAYS[number];
export type Period = typeof PERIODS[number];
export type Grade = typeof GRADES[number];
export type Section = typeof SECTIONS[number];

export const teachers = pgTable("teachers", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  subject: text("subject").notNull().$type<Subject>(),
});

export const scheduleSlots = pgTable("schedule_slots", {
  id: text("id").primaryKey(),
  teacherId: text("teacher_id").notNull().references(() => teachers.id, { onDelete: "cascade" }),
  day: text("day").notNull().$type<Day>(),
  period: integer("period").notNull().$type<Period>(),
  grade: integer("grade").notNull().$type<Grade>(),
  section: integer("section").notNull().$type<Section>(),
});

export const insertTeacherSchema = createInsertSchema(teachers).omit({ id: true }).extend({
  subject: z.enum(SUBJECTS),
});

export const insertScheduleSlotSchema = createInsertSchema(scheduleSlots).omit({ id: true }).extend({
  day: z.enum(DAYS),
  period: z.number().int().min(1).max(7),
  grade: z.number().int().min(10).max(12),
  section: z.number().int().min(1).max(8),
  teacherId: z.string(),
});

export type Teacher = typeof teachers.$inferSelect;
export type InsertTeacher = z.infer<typeof insertTeacherSchema>;
export type ScheduleSlot = typeof scheduleSlots.$inferSelect;
export type InsertScheduleSlot = z.infer<typeof insertScheduleSlotSchema>;
