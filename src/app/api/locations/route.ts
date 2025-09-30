import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ReservationStatus, SpaceType } from "@/generated/prisma";

export async function GET() {
  const now = new Date();
  const locations = await prisma.location.findMany({
    include: {
      spaces: {
        include: {
          reservations: {
            where: {
              status: {
                in: [ReservationStatus.RESERVED, ReservationStatus.OCCUPIED],
              },
              end: {
                gte: new Date(now.getTime() - 1000 * 60 * 60 * 12),
              },
            },
            orderBy: {
              start: "asc",
            },
          },
        },
      },
      admins: {
        include: {
          user: true,
        },
      },
    },
    orderBy: {
      name: "asc",
    },
  });

  return NextResponse.json(
    locations.map((location) => {
      const counts = {
        totalSpaces: location.spaces.length,
        available: 0,
        reserved: 0,
        occupied: 0,
      };

      const spaceTypes: Partial<Record<SpaceType, number>> = {};

      location.spaces.forEach((space) => {
        spaceTypes[space.type] = (spaceTypes[space.type] ?? 0) + 1;

        const current = space.reservations.find(
          (reservation) =>
            reservation.status === ReservationStatus.OCCUPIED &&
            reservation.start <= now &&
            reservation.end >= now,
        );

        if (current) {
          counts.occupied += 1;
          return;
        }

        const upcoming = space.reservations.find(
          (reservation) =>
            reservation.status === ReservationStatus.RESERVED && reservation.start > now,
        );

        if (upcoming) {
          counts.reserved += 1;
          return;
        }

        counts.available += 1;
      });

      return {
        id: location.id,
        name: location.name,
        slug: location.slug,
        timezone: location.timezone,
        address: location.address,
        description: location.description,
        stats: counts,
        spaceTypes,
        admins: location.admins.map((admin) => ({
          id: admin.userId,
          name: admin.user.name,
          email: admin.user.email,
        })),
      };
    }),
  );
}
