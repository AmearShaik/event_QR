const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function listEvents(req, res) {
  try {
    const events = await prisma.event.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { attendances: true },
        },
      },
    });

    return res.json({ events });
  } catch (error) {
    console.error('List events error:', error);
    return res.status(500).json({ error: 'Failed to fetch graduation ceremony events.' });
  }
}

async function createEvent(req, res) {
  try {
    const { name, slug, description, isActive } = req.body;

    if (!name || !slug) {
      return res.status(400).json({ error: 'Event name and slug are required.' });
    }

    if (isActive) {
      await prisma.event.updateMany({ data: { isActive: false } });
    }

    const newEvent = await prisma.event.create({
      data: {
        name: name.trim(),
        slug: slug.trim().toLowerCase(),
        description: description ? description.trim() : null,
        isActive: isActive ?? true,
      },
    });

    return res.status(201).json({ message: 'Event created successfully.', event: newEvent });
  } catch (error) {
    console.error('Create event error:', error);
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'An event with this slug already exists.' });
    }
    return res.status(500).json({ error: 'Failed to create graduation ceremony event.' });
  }
}

async function updateEvent(req, res) {
  try {
    const { id } = req.params;
    const { name, description, isActive } = req.body;

    if (isActive) {
      await prisma.event.updateMany({
        where: { id: { not: id } },
        data: { isActive: false },
      });
    }

    const updated = await prisma.event.update({
      where: { id },
      data: {
        ...(name && { name: name.trim() }),
        ...(description !== undefined && { description: description ? description.trim() : null }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    return res.json({ message: 'Event updated successfully.', event: updated });
  } catch (error) {
    console.error('Update event error:', error);
    return res.status(500).json({ error: 'Failed to update ceremony event.' });
  }
}

async function getEventStats(req, res) {
  try {
    const { id } = req.params;

    const event = await prisma.event.findUnique({ where: { id } });
    if (!event) return res.status(404).json({ error: 'Event not found.' });

    const totalEligible = await prisma.candidate.count({ where: { eligibilityStatus: true } });
    const attendanceCount = await prisma.attendance.count({ where: { eventId: id } });

    return res.json({
      event,
      totalEligible,
      attendanceCount,
      remainingEligible: Math.max(0, totalEligible - attendanceCount),
      attendanceRate: totalEligible > 0 ? ((attendanceCount / totalEligible) * 100).toFixed(1) : '0.0',
    });
  } catch (error) {
    console.error('Event stats error:', error);
    return res.status(500).json({ error: 'Failed to fetch event statistics.' });
  }
}

module.exports = { listEvents, createEvent, updateEvent, getEventStats };
