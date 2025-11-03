import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertTeacherSchema, insertScheduleSlotSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Teacher routes
  app.get("/api/teachers", async (req, res) => {
    try {
      const teachers = await storage.getAllTeachers();
      res.json(teachers);
    } catch (error) {
      console.error("Error fetching teachers:", error);
      res.status(500).json({ error: "Failed to fetch teachers" });
    }
  });

  app.get("/api/teachers/:id", async (req, res) => {
    try {
      const teacher = await storage.getTeacher(req.params.id);
      if (!teacher) {
        return res.status(404).json({ error: "Teacher not found" });
      }
      res.json(teacher);
    } catch (error) {
      console.error("Error fetching teacher:", error);
      res.status(500).json({ error: "Failed to fetch teacher" });
    }
  });

  app.post("/api/teachers", async (req, res) => {
    try {
      const validatedData = insertTeacherSchema.parse(req.body);
      const teacher = await storage.createTeacher(validatedData);
      res.status(201).json(teacher);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid data", details: error.errors });
      }
      console.error("Error creating teacher:", error);
      res.status(500).json({ error: "Failed to create teacher" });
    }
  });

  app.patch("/api/teachers/:id", async (req, res) => {
    try {
      const updates = insertTeacherSchema.partial().parse(req.body);
      const teacher = await storage.updateTeacher(req.params.id, updates);
      if (!teacher) {
        return res.status(404).json({ error: "Teacher not found" });
      }
      res.json(teacher);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid data", details: error.errors });
      }
      console.error("Error updating teacher:", error);
      res.status(500).json({ error: "Failed to update teacher" });
    }
  });

  app.delete("/api/teachers/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteTeacher(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Teacher not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting teacher:", error);
      res.status(500).json({ error: "Failed to delete teacher" });
    }
  });

  // Schedule slot routes
  app.get("/api/schedule-slots", async (req, res) => {
    try {
      const slots = await storage.getAllScheduleSlots();
      res.json(slots);
    } catch (error) {
      console.error("Error fetching schedule slots:", error);
      res.status(500).json({ error: "Failed to fetch schedule slots" });
    }
  });

  app.get("/api/teachers/:teacherId/schedule-slots", async (req, res) => {
    try {
      const slots = await storage.getTeacherScheduleSlots(req.params.teacherId);
      res.json(slots);
    } catch (error) {
      console.error("Error fetching teacher schedule slots:", error);
      res.status(500).json({ error: "Failed to fetch teacher schedule slots" });
    }
  });

  app.post("/api/schedule-slots", async (req, res) => {
    try {
      const validatedData = insertScheduleSlotSchema.parse(req.body);
      const slot = await storage.createScheduleSlot(validatedData);
      res.status(201).json(slot);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid data", details: error.errors });
      }
      console.error("Error creating schedule slot:", error);
      res.status(500).json({ error: "Failed to create schedule slot" });
    }
  });

  app.patch("/api/schedule-slots/:id", async (req, res) => {
    try {
      const updates = insertScheduleSlotSchema.partial().parse(req.body);
      const slot = await storage.updateScheduleSlot(req.params.id, updates);
      if (!slot) {
        return res.status(404).json({ error: "Schedule slot not found" });
      }
      res.json(slot);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid data", details: error.errors });
      }
      console.error("Error updating schedule slot:", error);
      res.status(500).json({ error: "Failed to update schedule slot" });
    }
  });

  app.delete("/api/schedule-slots/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteScheduleSlot(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Schedule slot not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting schedule slot:", error);
      res.status(500).json({ error: "Failed to delete schedule slot" });
    }
  });

  // Batch operations for schedule slots
  app.post("/api/teachers/:teacherId/schedule-slots/batch", async (req, res) => {
    try {
      const { slots } = req.body;
      if (!Array.isArray(slots)) {
        return res.status(400).json({ error: "Slots must be an array" });
      }

      // Delete existing slots for this teacher
      await storage.deleteTeacherScheduleSlots(req.params.teacherId);

      // Create new slots
      const createdSlots = [];
      for (const slotData of slots) {
        const validatedData = insertScheduleSlotSchema.parse({
          ...slotData,
          teacherId: req.params.teacherId,
        });
        const slot = await storage.createScheduleSlot(validatedData);
        createdSlots.push(slot);
      }

      res.status(201).json(createdSlots);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid data", details: error.errors });
      }
      console.error("Error batch creating schedule slots:", error);
      res.status(500).json({ error: "Failed to batch create schedule slots" });
    }
  });

  // Get class schedules (aggregate all teachers' schedules by grade/section)
  app.get("/api/class-schedules/:grade/:section", async (req, res) => {
    try {
      const grade = parseInt(req.params.grade);
      const section = parseInt(req.params.section);

      if (isNaN(grade) || isNaN(section)) {
        return res.status(400).json({ error: "Invalid grade or section" });
      }

      const allSlots = await storage.getAllScheduleSlots();
      const allTeachers = await storage.getAllTeachers();

      const classSlots = allSlots.filter(
        slot => slot.grade === grade && slot.section === section
      );

      const teacherMap = new Map(allTeachers.map(t => [t.id, t]));

      const schedule = classSlots.map(slot => {
        const teacher = teacherMap.get(slot.teacherId);
        return {
          day: slot.day,
          period: slot.period,
          subject: teacher?.subject || "Unknown",
          teacherName: teacher?.name || "Unknown",
        };
      });

      res.json(schedule);
    } catch (error) {
      console.error("Error fetching class schedule:", error);
      res.status(500).json({ error: "Failed to fetch class schedule" });
    }
  });

  // Save class schedule
  app.post("/api/class-schedules/:grade/:section", async (req, res) => {
    try {
      const grade = parseInt(req.params.grade);
      const section = parseInt(req.params.section);
      const { slots } = req.body;

      if (isNaN(grade) || isNaN(section)) {
        return res.status(400).json({ error: "Invalid grade or section" });
      }

      if (!Array.isArray(slots)) {
        return res.status(400).json({ error: "Slots must be an array" });
      }

      // Delete existing slots for this class
      const allSlots = await storage.getAllScheduleSlots();
      const existingSlots = allSlots.filter(
        slot => slot.grade === grade && slot.section === section
      );
      
      for (const slot of existingSlots) {
        await storage.deleteScheduleSlot(slot.id);
      }

      // Create new slots
      const createdSlots = [];
      for (const slotData of slots) {
        const validatedData = insertScheduleSlotSchema.parse({
          ...slotData,
          grade,
          section,
        });
        const slot = await storage.createScheduleSlot(validatedData);
        createdSlots.push(slot);
      }

      res.status(201).json(createdSlots);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid data", details: error.errors });
      }
      console.error("Error saving class schedule:", error);
      res.status(500).json({ error: "Failed to save class schedule" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
