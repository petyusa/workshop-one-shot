import { PrismaClient, RequestStatus, ReservationStatus } from "@/generated/prisma";
import { prisma } from "./prisma";
import { assertChronological, isWithinOpeningWindows, overlaps } from "./time";

const managedStatuses = [ReservationStatus.RESERVED, ReservationStatus.OCCUPIED];

export type ReservationOutcome =
  | {
      kind: "reservation";
      reservationId: string;
    }
  | {
      kind: "request";
      requestId: string;
    };

export type CreateReservationInput = {
  spaceId: string;
  userId: string;
  start: Date;
  end: Date;
  notes?: string;
};

export async function ensureAvailability(
  prismaClient: PrismaClient,
  spaceId: string,
  start: Date,
  end: Date,
  excludeReservationId?: string,
) {
  const reservations = await prismaClient.reservation.findMany({
    where: {
      spaceId,
      status: {
        in: managedStatuses,
      },
      ...(excludeReservationId ? { NOT: { id: excludeReservationId } } : {}),
    },
    select: {
      id: true,
      start: true,
      end: true,
    },
  });

  for (const reservation of reservations) {
    if (overlaps(start, end, reservation.start, reservation.end)) {
      throw new Error("Space is already booked in the chosen time window.");
    }
  }
}

export async function createReservation(
  input: CreateReservationInput,
  prismaClient: PrismaClient = prisma,
): Promise<ReservationOutcome> {
  assertChronological(input.start, input.end);

  const space = await prismaClient.space.findUnique({
    where: { id: input.spaceId },
    include: {
      location: true,
      openingWindows: true,
    },
  });

  if (!space) {
    throw new Error("Space not found.");
  }

  if (!isWithinOpeningWindows(space.openingWindows, input.start, input.end, space.location.timezone)) {
    throw new Error("Requested time is outside of the space opening hours.");
  }

  await ensureAvailability(prismaClient, input.spaceId, input.start, input.end);

  if (space.hasFixedOwner && space.ownerId && space.ownerId !== input.userId) {
    await ensureNoConflictingPendingRequest(prismaClient, input.spaceId, input.start, input.end);

    const request = await prismaClient.occupancyRequest.create({
      data: {
        spaceId: input.spaceId,
        requesterId: input.userId,
        start: input.start,
        end: input.end,
      },
    });

    return {
      kind: "request",
      requestId: request.id,
    };
  }

  const reservation = await prismaClient.reservation.create({
    data: {
      spaceId: input.spaceId,
      userId: input.userId,
      start: input.start,
      end: input.end,
      status: ReservationStatus.RESERVED,
      notes: input.notes,
    },
  });

  return {
    kind: "reservation",
    reservationId: reservation.id,
  };
}

async function ensureNoConflictingPendingRequest(
  prismaClient: PrismaClient,
  spaceId: string,
  start: Date,
  end: Date,
) {
  const overlapping = await prismaClient.occupancyRequest.findFirst({
    where: {
      spaceId,
      status: RequestStatus.PENDING,
      OR: [
        {
          start: {
            lte: start,
          },
          end: {
            gt: start,
          },
        },
        {
          start: {
            lt: end,
          },
          end: {
            gte: end,
          },
        },
        {
          start: {
            gte: start,
          },
          end: {
            lte: end,
          },
        },
      ],
    },
  });

  if (overlapping) {
    throw new Error("There is already a pending approval request for this time window.");
  }
}

export async function approveRequest(
  requestId: string,
  approverId: string,
  approve: boolean,
  note?: string,
  prismaClient: PrismaClient = prisma,
) {
  const request = await prismaClient.occupancyRequest.findUnique({
    where: { id: requestId },
    include: {
      space: {
        include: {
          location: true,
          openingWindows: true,
        },
      },
    },
  });

  if (!request) {
    throw new Error("Request not found.");
  }

  if (request.status !== RequestStatus.PENDING) {
    throw new Error("Request has already been resolved.");
  }

  const { space } = request;

  if (!approve) {
    return prismaClient.occupancyRequest.update({
      where: { id: requestId },
      data: {
        status: RequestStatus.DECLINED,
        handledById: approverId,
        decisionNote: note,
      },
    });
  }

  await ensureAvailability(prismaClient, space.id, request.start, request.end);

  if (
    !isWithinOpeningWindows(space.openingWindows, request.start, request.end, space.location.timezone)
  ) {
    throw new Error("Requested time is outside of opening hours.");
  }

  const result = await prismaClient.$transaction(async (tx) => {
    const updated = await tx.occupancyRequest.update({
      where: { id: requestId },
      data: {
        status: RequestStatus.APPROVED,
        handledById: approverId,
        decisionNote: note,
      },
    });

    const reservation = await tx.reservation.create({
      data: {
        spaceId: updated.spaceId,
        userId: updated.requesterId,
        start: updated.start,
        end: updated.end,
        status: ReservationStatus.RESERVED,
      },
    });

    return { updated, reservation };
  });

  return result;
}

export async function updateReservationStatus(
  reservationId: string,
  status: ReservationStatus,
  prismaClient: PrismaClient = prisma,
) {
  return prismaClient.reservation.update({
    where: { id: reservationId },
    data: {
      status,
    },
  });
}

export async function cancelReservation(reservationId: string, prismaClient: PrismaClient = prisma) {
  return prismaClient.reservation.update({
    where: { id: reservationId },
    data: {
      status: ReservationStatus.CANCELLED,
    },
  });
}

export async function nextAvailability(spaceId: string, prismaClient: PrismaClient = prisma) {
  const reservations = await prismaClient.reservation.findMany({
    where: {
      spaceId,
      status: {
        in: managedStatuses,
      },
    },
    orderBy: {
      start: "asc",
    },
  });

  const now = new Date();

  for (const reservation of reservations) {
    if (reservation.start > now) {
      return reservation.start;
    }
  }

  return null;
}
