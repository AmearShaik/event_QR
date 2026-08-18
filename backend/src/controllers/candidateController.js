const { PrismaClient } = require('@prisma/client');
const { getOrCreateActiveQrToken } = require('../services/qrService');

const prisma = new PrismaClient();

function stripNonAlphanumeric(str) {
  return (str || '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

async function findCandidateByFlexibleId(inputStr) {
  if (!inputStr) return null;
  const cleanInput = inputStr.trim();
  const strippedInput = stripNonAlphanumeric(cleanInput);

  // 1. Try exact match in DB
  let candidate = await prisma.candidate.findFirst({
    where: { studentId: { equals: cleanInput } },
  });
  if (candidate) return candidate;

  // 2. Try substring match in DB
  candidate = await prisma.candidate.findFirst({
    where: { studentId: { contains: cleanInput } },
  });
  if (candidate) return candidate;

  // 3. Fallback: Normalized non-alphanumeric match across candidate master table
  const allCandidates = await prisma.candidate.findMany({
    select: {
      id: true,
      studentId: true,
      name: true,
      program: true,
      paymentStatus: true,
      normalizedPaymentStatus: true,
      eligibilityStatus: true,
      registrationStatus: true,
    },
  });

  // Exact stripped match (e.g. "245122732001" === "245122732001")
  candidate = allCandidates.find((c) => stripNonAlphanumeric(c.studentId) === strippedInput);
  if (candidate) return candidate;

  // StartsWith stripped match (e.g. "2451-22-732-001" startsWith "24512273200")
  candidate = allCandidates.find((c) => stripNonAlphanumeric(c.studentId).startsWith(strippedInput));
  if (candidate) return candidate;

  // Includes stripped match
  candidate = allCandidates.find((c) => stripNonAlphanumeric(c.studentId).includes(strippedInput));
  if (candidate) return candidate;

  return null;
}

async function verifyCandidatePublic(req, res) {
  try {
    const { studentId } = req.params;

    if (!studentId) {
      return res.status(400).json({ error: 'Student ID parameter is required.' });
    }

    const candidate = await findCandidateByFlexibleId(studentId);

    if (!candidate) {
      const sampleCandidates = await prisma.candidate.findMany({
        take: 3,
        select: { studentId: true },
      });
      const samplesText = sampleCandidates.map((c) => `${c.studentId}`).join(', ');

      return res.status(404).json({
        eligible: false,
        message: `Student ID "${studentId.trim()}" not found in official graduation directory. Please check for typos. (Examples: ${samplesText} or enter without hyphens e.g. 245122732001)`,
      });
    }

    if (!candidate.eligibilityStatus) {
      return res.status(403).json({
        eligible: false,
        reason: candidate.normalizedPaymentStatus,
        message: `Candidate ${candidate.name} is NOT ELIGIBLE due to unpaid or partial payment status (${candidate.paymentStatus}).`,
        candidate: {
          studentId: candidate.studentId,
          name: candidate.name,
          program: candidate.program,
          paymentStatus: candidate.paymentStatus,
        },
      });
    }

    return res.json({
      eligible: true,
      message: `Candidate ${candidate.name} is ELIGIBLE for Graduation Day 2026.`,
      candidate: {
        studentId: candidate.studentId,
        name: candidate.name,
        program: candidate.program,
        paymentStatus: candidate.paymentStatus,
      },
    });
  } catch (error) {
    console.error('Candidate verification error:', error);
    return res.status(500).json({ error: 'Failed to verify candidate eligibility.' });
  }
}

async function registerCandidatePublic(req, res) {
  try {
    const { studentId } = req.body;

    if (!studentId) {
      return res.status(400).json({ error: 'Student ID is required.' });
    }

    const candidate = await findCandidateByFlexibleId(studentId);

    if (!candidate) {
      return res.status(404).json({ error: `Student ID "${studentId.trim()}" not found in master records.` });
    }

    if (!candidate.eligibilityStatus) {
      return res.status(403).json({
        error: 'Candidate is not eligible due to unpaid or partial payment status.',
        reason: candidate.normalizedPaymentStatus,
      });
    }

    if (candidate.registrationStatus === 'NOT_REGISTERED') {
      await prisma.candidate.update({
        where: { id: candidate.id },
        data: { registrationStatus: 'REGISTERED' },
      });
    }

    const activeEvent =
      (await prisma.event.findFirst({ where: { isActive: true } })) ||
      (await prisma.event.findFirst());

    const qrRecord = await getOrCreateActiveQrToken(candidate.id, activeEvent ? activeEvent.id : undefined);

    return res.json({
      message: 'Registration pass generated successfully.',
      candidate: {
        studentId: candidate.studentId,
        name: candidate.name,
        program: candidate.program,
        paymentStatus: candidate.paymentStatus,
      },
      event: {
        name: activeEvent ? activeEvent.name : 'Graduation Day 2026',
        slug: activeEvent ? activeEvent.slug : 'attendance',
      },
      qrToken: qrRecord.token,
    });
  } catch (error) {
    console.error('Candidate registration error:', error);
    return res.status(500).json({ error: 'Failed to generate registration pass.' });
  }
}

async function studentLogin(req, res) {
  try {
    const { studentId, password } = req.body;
    if (!studentId || !password) {
      return res.status(400).json({ error: 'User ID (Roll Number) and Password are required.' });
    }

    const cleanId = studentId.trim();
    const cleanPass = password.trim();

    if (cleanId.toLowerCase() !== cleanPass.toLowerCase()) {
      return res.status(401).json({
        error: 'Invalid Password. For student login, your Roll Number is your User ID and Password.',
      });
    }

    const candidate = await findCandidateByFlexibleId(cleanId);

    if (!candidate) {
      return res.status(404).json({
        eligible: false,
        status: 'NOT_FOUND',
        error: 'Student record not found. Please verify your Roll Number with the administration.',
      });
    }

    if (!candidate.eligibilityStatus) {
      return res.status(200).json({
        eligible: false,
        status: 'NOT_ELIGIBLE',
        message: `Student ${candidate.name} (${candidate.studentId}) is currently not eligible for entrance. Payment Status: ${candidate.paymentStatus}.`,
        candidate: {
          id: candidate.id,
          studentId: candidate.studentId,
          name: candidate.name,
          program: candidate.program,
          paymentStatus: candidate.paymentStatus,
          eligibilityStatus: candidate.eligibilityStatus,
        },
      });
    }

    let activeEvent = (await prisma.event.findFirst({ where: { isActive: true } })) || (await prisma.event.findFirst());

    const qrRecord = await getOrCreateActiveQrToken(candidate.id, activeEvent ? activeEvent.id : undefined);

    if (candidate.registrationStatus === 'NOT_REGISTERED') {
      await prisma.candidate.update({
        where: { id: candidate.id },
        data: { registrationStatus: 'REGISTERED' },
      });
    }

    const attendance = activeEvent
      ? await prisma.attendance.findUnique({
          where: {
            candidateId_eventId: {
              candidateId: candidate.id,
              eventId: activeEvent.id,
            },
          },
        })
      : null;

    return res.json({
      eligible: true,
      status: 'ELIGIBLE',
      message: 'Student authenticated successfully.',
      candidate: {
        id: candidate.id,
        studentId: candidate.studentId,
        name: candidate.name,
        program: candidate.program,
        paymentStatus: candidate.paymentStatus,
        registrationStatus: 'REGISTERED',
      },
      event: {
        id: activeEvent ? activeEvent.id : 'attendance',
        name: activeEvent ? activeEvent.name : 'Graduation Day 2026',
        slug: activeEvent ? activeEvent.slug : 'attendance',
      },
      qrToken: qrRecord.token,
      attendance: attendance
        ? {
            id: attendance.id,
            entryTime: attendance.entryTime.toISOString(),
            status: attendance.status,
          }
        : null,
    });
  } catch (error) {
    console.error('Student login error:', error);
    return res.status(500).json({ error: 'Failed to process student login.' });
  }
}

module.exports = { verifyCandidatePublic, registerCandidatePublic, studentLogin };
