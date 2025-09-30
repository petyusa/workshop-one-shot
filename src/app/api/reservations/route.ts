import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createReservation } from "@/lib/reservations";
import { ReservationStatus } from "@/generated/prisma";

const createReservationSchema = z.object({
  spaceId: z.string().min(1),
  userId: z.string().min(1),
  start: z.string().datetime(),
  end: z.string().datetime(),
  notes: z.string().optional(),
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const locationId = searchParams.get("locationId") ?? undefined;
  const spaceId = searchParams.get("spaceId") ?? undefined;
  const userId = searchParams.get("userId") ?? undefined;
  const status = searchParams.get("status") ?? undefined;

  const reservations = await prisma.reservation.findMany({
    where: {
      ...(locationId ? { space: { locationId } } : {}),
      ...(spaceId ? { spaceId } : {}),
      ...(userId ? { userId } : {}),
      ...(status ? { status: status as ReservationStatus } : {}),
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      space: {
        select: {
          id: true,
          name: true,
          type: true,
          location: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
    orderBy: {
      start: "asc",
    },
  });

  return NextResponse.json(reservations);
}

export async function POST(request: Request) {
  const json = await request.json();
  const result = createReservationSchema.safeParse(json);

  if (!result.success) {
    return NextResponse.json({ message: result.error.message }, { status: 400 });
  }

  const { spaceId, userId, start, end, notes } = result.data;

  try {
    const outcome = await createReservation({
      spaceId,
      userId,
      start: new Date(start),
      end: new Date(end),
      notes,
    });

    if (outcome.kind === "request") {
      return NextResponse.json(
        {
          message: "Owner approval required.",
          requestId: outcome.requestId,
          requiresApproval: true,
        },
        { status: 202 },
      );
    }

    return NextResponse.json(
      {
        message: "Reservation created.",
        reservationId: outcome.reservationId,
        requiresApproval: false,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : "Unable to create reservation.",
      },
      { status: 400 },
    );
  }
}
