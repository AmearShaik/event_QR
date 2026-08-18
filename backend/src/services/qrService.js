const crypto = require('crypto');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

function generateRandomToken() {
  return crypto.randomBytes(32).toString('hex');
}

async function getOrCreateActiveQrToken(candidateId, eventIdInput) {
  let event;
  if (eventIdInput) {
    event = await prisma.event.findFirst({
      where: { OR: [{ id: eventIdInput }, { slug: eventIdInput }] },
    });
  }

  if (!event) {
    event = (await prisma.event.findFirst({ where: { isActive: true } })) ||
            (await prisma.event.findFirst());
  }

  if (!event) {
    throw new Error('No active event found to link QR token.');
  }

  const existingToken = await prisma.qrToken.findFirst({
    where: {
      candidateId,
      eventId: event.id,
      isActive: true,
    },
  });

  if (existingToken) {
    return existingToken;
  }

  await prisma.qrToken.updateMany({
    where: { candidateId, eventId: event.id },
    data: { isActive: false },
  });

  const newTokenValue = generateRandomToken();

  return await prisma.qrToken.create({
    data: {
      token: newTokenValue,
      candidate: { connect: { id: candidateId } },
      event: { connect: { id: event.id } },
      isActive: true,
    },
  });
}

async function verifyQrToken(tokenString) {
  const qrRecord = await prisma.qrToken.findUnique({
    where: { token: tokenString },
    include: { candidate: true, event: true },
  });

  if (!qrRecord) {
    return { valid: false, reason: 'INVALID_TOKEN' };
  }

  if (!qrRecord.isActive) {
    return { valid: false, reason: 'TOKEN_DISABLED', candidate: qrRecord.candidate };
  }

  return { valid: true, qrRecord, candidate: qrRecord.candidate };
}

module.exports = { generateRandomToken, getOrCreateActiveQrToken, verifyQrToken };
