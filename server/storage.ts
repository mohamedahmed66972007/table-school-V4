import { type Teacher, type InsertTeacher, type ScheduleSlot, type InsertScheduleSlot } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Teacher methods
  getTeacher(id: string): Promise<Teacher | undefined>;
  getAllTeachers(): Promise<Teacher[]>;
  createTeacher(teacher: InsertTeacher): Promise<Teacher>;
  updateTeacher(id: string, teacher: Partial<InsertTeacher>): Promise<Teacher | undefined>;
  deleteTeacher(id: string): Promise<boolean>;

  // Schedule slot methods
  getScheduleSlot(id: string): Promise<ScheduleSlot | undefined>;
  getTeacherScheduleSlots(teacherId: string): Promise<ScheduleSlot[]>;
  getAllScheduleSlots(): Promise<ScheduleSlot[]>;
  createScheduleSlot(slot: InsertScheduleSlot): Promise<ScheduleSlot>;
  updateScheduleSlot(id: string, slot: Partial<InsertScheduleSlot>): Promise<ScheduleSlot | undefined>;
  deleteScheduleSlot(id: string): Promise<boolean>;
  deleteTeacherScheduleSlots(teacherId: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private teachers: Map<string, Teacher>;
  private scheduleSlots: Map<string, ScheduleSlot>;

  constructor() {
    this.teachers = new Map();
    this.scheduleSlots = new Map();
  }

  // Teacher methods
  async getTeacher(id: string): Promise<Teacher | undefined> {
    return this.teachers.get(id);
  }

  async getAllTeachers(): Promise<Teacher[]> {
    return Array.from(this.teachers.values());
  }

  async createTeacher(insertTeacher: InsertTeacher): Promise<Teacher> {
    const id = randomUUID();
    const teacher: Teacher = { ...insertTeacher, id };
    this.teachers.set(id, teacher);
    return teacher;
  }

  async updateTeacher(id: string, updates: Partial<InsertTeacher>): Promise<Teacher | undefined> {
    const teacher = this.teachers.get(id);
    if (!teacher) return undefined;
    
    const updated = { ...teacher, ...updates };
    this.teachers.set(id, updated);
    return updated;
  }

  async deleteTeacher(id: string): Promise<boolean> {
    const deleted = this.teachers.delete(id);
    if (deleted) {
      await this.deleteTeacherScheduleSlots(id);
    }
    return deleted;
  }

  // Schedule slot methods
  async getScheduleSlot(id: string): Promise<ScheduleSlot | undefined> {
    return this.scheduleSlots.get(id);
  }

  async getTeacherScheduleSlots(teacherId: string): Promise<ScheduleSlot[]> {
    return Array.from(this.scheduleSlots.values()).filter(
      (slot) => slot.teacherId === teacherId
    );
  }

  async getAllScheduleSlots(): Promise<ScheduleSlot[]> {
    return Array.from(this.scheduleSlots.values());
  }

  async createScheduleSlot(insertSlot: InsertScheduleSlot): Promise<ScheduleSlot> {
    const id = randomUUID();
    const slot: ScheduleSlot = { ...insertSlot, id } as ScheduleSlot;
    this.scheduleSlots.set(id, slot);
    return slot;
  }

  async updateScheduleSlot(id: string, updates: Partial<InsertScheduleSlot>): Promise<ScheduleSlot | undefined> {
    const slot = this.scheduleSlots.get(id);
    if (!slot) return undefined;
    
    const updated = { ...slot, ...updates } as ScheduleSlot;
    this.scheduleSlots.set(id, updated);
    return updated;
  }

  async deleteScheduleSlot(id: string): Promise<boolean> {
    return this.scheduleSlots.delete(id);
  }

  async deleteTeacherScheduleSlots(teacherId: string): Promise<boolean> {
    const slots = await this.getTeacherScheduleSlots(teacherId);
    slots.forEach(slot => this.scheduleSlots.delete(slot.id));
    return true;
  }
}

export const storage = new MemStorage();
