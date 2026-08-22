import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class EventController {
  static async listEvents(req: Request, res: Response) {
    console.log(`[Event API] Fetching all events. IP: ${req.ip}`);
    try {
      const events = await prisma.event.findMany({
        orderBy: { createdAt: 'desc' },
      });
      return res.json({ events });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Error fetching events.' });
    }
  }

  static async createEvent(req: Request, res: Response) {
    try {
      const { name, description, slug, requiresPayment } = req.body;
      if (!name) {
        return res.status(400).json({ error: 'Event name is required.' });
      }

      const generatedSlug = slug
        ? slug.toLowerCase().replace(/[^a-z0-9]/g, '-')
        : name.toLowerCase().replace(/[^a-z0-9]/g, '-');

      const event = await prisma.event.create({
        data: {
          name: name.trim(),
          description: description ? description.trim() : null,
          slug: generatedSlug,
          isActive: true,
          requiresPayment: Boolean(requiresPayment), // false=entrance(all), true=kit allocation(paid only)
        },
      });

      return res.status(201).json({ event });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Error creating event.' });
    }
  }

  static async updateEvent(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { name, description, isActive, requiresPayment } = req.body;

      const event = await prisma.event.update({
        where: { id },
        data: {
          ...(name && { name: name.trim() }),
          ...(description !== undefined && { description }),
          ...(isActive !== undefined && { isActive }),
          ...(requiresPayment !== undefined && { requiresPayment: Boolean(requiresPayment) }),
        },
      });

      return res.json({ event });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Error updating event.' });
    }
  }

  static async activateEvent(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const event = await prisma.event.update({
        where: { id },
        data: { isActive: true },
      });
      return res.json({ message: 'Event activated.', event });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Error activating event.' });
    }
  }

  static async deactivateEvent(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const event = await prisma.event.update({
        where: { id },
        data: { isActive: false },
      });
      return res.json({ message: 'Event deactivated.', event });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Error deactivating event.' });
    }
  }

  static async getEventStatistics(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const event = await prisma.event.findUnique({ where: { id } });
      if (!event) {
        return res.status(404).json({ error: 'Event not found.' });
      }

      const totalEligible = await prisma.candidate.count({ where: { eligibilityStatus: true } });
      const qrGenerated = await prisma.qrToken.count({ where: { eventId: id, isActive: true } });
      const attended = await prisma.attendance.count({ where: { eventId: id } });
      const remaining = Math.max(0, totalEligible - attended);
      const percentage = totalEligible > 0 ? (attended / totalEligible) * 100 : 0;

      return res.json({
        event: {
          id: event.id,
          name: event.name,
          isActive: event.isActive,
        },
        statistics: {
          totalEligible,
          qrGenerated,
          attended,
          remaining,
          attendancePercentage: parseFloat(percentage.toFixed(2)),
        },
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Error fetching event statistics.' });
    }
  }
}
