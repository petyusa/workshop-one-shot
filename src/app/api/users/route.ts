import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const users = await prisma.user.findMany({
    include: {
      managedLocations: {
        include: {
          location: true,
        },
      },
    },
    orderBy: {
      name: "asc",
    },
  });

  return NextResponse.json(
    users.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatarColor: user.avatarColor,
      manages: user.managedLocations.map((membership) => ({
        id: membership.locationId,
        name: membership.location.name,
        slug: membership.location.slug,
      })),
    })),
  );
}
