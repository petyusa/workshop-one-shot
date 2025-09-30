import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const body = await request.json();
  const { email, userId } = body ?? {};

  if (!email && !userId) {
    return NextResponse.json({ message: "Email or userId is required." }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: email ? { email } : { id: userId },
    include: {
      managedLocations: {
        include: { location: true },
      },
      ownerships: {
        select: {
          id: true,
          name: true,
          locationId: true,
        },
      },
    },
  });

  if (!user) {
    return NextResponse.json({ message: "User not found." }, { status: 404 });
  }

  return NextResponse.json({
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
    ownerships: user.ownerships,
  });
}
