import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createReservation } from "@/lib/reservations";
import { RequestStatus } from "@/generated/prisma";

const createRequestSchema = z.object({
  spaceId: z.string().min(1),
  userId: z.string().min(1),
  start: z.string().datetime(),
  end: z.string().datetime(),
  notes: z.string().optional(),
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const locationId = searchParams.get("locationId") ?? undefined;
  const status = searchParams.get("status") ?? undefined;

  const requests = await prisma.occupancyRequest.findMany({
    where: {
      ...(locationId ? { space: { locationId } } : {}),
      ...(status ? { status: status as RequestStatus } : {}),
    },
    include: {
      requester: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      handledBy: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      space: {
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
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
      createdAt: "desc",
    },
  });

  return NextResponse.json(requests);
}

export async function POST(request: Request) {
  const json = await request.json();
  const parsed = createRequestSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json({ message: parsed.error.message }, { status: 400 });
  }

  try {
    const outcome = await createReservation({
      spaceId: parsed.data.spaceId,
      userId: parsed.data.userId,
      start: new Date(parsed.data.start),
      end: new Date(parsed.data.end),
      notes: parsed.data.notes,
    });

    return NextResponse.json(outcome, { status: outcome.kind === "request" ? 201 : 200 });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Unable to create request." },
      { status: 400 },
    );
  }
}
