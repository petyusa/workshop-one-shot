import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ReservationStatus } from "@/generated/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const locationId = searchParams.get("locationId") ?? undefined;
  const includeWindows = searchParams.get("includeOpening") === "true";

  const now = new Date();

  const spaces = await prisma.space.findMany({
    where: {
      ...(locationId ? { locationId } : {}),
    },
    include: {
      location: true,
      owner: {
        select: {
          id: true,
          name: true,
          email: true,
          avatarColor: true,
        },
      },
      openingWindows: includeWindows,
      reservations: {
        where: {
          status: {
            in: [ReservationStatus.RESERVED, ReservationStatus.OCCUPIED],
          },
          end: {
            gte: now,
          },
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          start: "asc",
        },
        take: 5,
      },
    },
    orderBy: [{ location: { name: "asc" } }, { name: "asc" }],
  });

  return NextResponse.json(
    spaces.map((space) => {
      const current = space.reservations.find(
        (reservation) =>
          reservation.status === ReservationStatus.OCCUPIED &&
          reservation.start <= now &&
          reservation.end >= now,
      );

      const upcoming = space.reservations.find((reservation) => reservation.start > now);

      return {
        id: space.id,
        name: space.name,
        code: space.code,
        type: space.type,
        description: space.description,
        capacity: space.capacity,
        location: {
          id: space.locationId,
          name: space.location.name,
          timezone: space.location.timezone,
        },
        floor: space.floor,
        gridX: space.gridX,
        gridY: space.gridY,
        color: space.color,
        hasFixedOwner: space.hasFixedOwner,
        owner: space.owner,
        openingWindows: includeWindows ? space.openingWindows : undefined,
        reservations: space.reservations,
        status: current ? "occupied" : upcoming ? "reserved" : "available",
        nextAvailability: upcoming?.start ?? null,
      };
    }),
  );
}
