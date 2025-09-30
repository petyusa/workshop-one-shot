import { addDays, addMinutes, startOfDay } from "date-fns";
import { PrismaClient, RequestStatus, ReservationStatus, Role, SpaceType } from "@/generated/prisma";

const prisma = new PrismaClient();

const tomorrow = startOfDay(addDays(new Date(), 1));

function slot(dayOffset: number, startHour: number, durationMinutes: number) {
  const start = addMinutes(addDays(tomorrow, dayOffset), startHour * 60);
  const end = addMinutes(start, durationMinutes);
  return { start, end };
}

async function main() {
  await prisma.occupancyRequest.deleteMany();
  await prisma.reservation.deleteMany();
  await prisma.openingWindow.deleteMany();
  await prisma.space.deleteMany();
  await prisma.locationAdmin.deleteMany();
  await prisma.location.deleteMany();
  await prisma.user.deleteMany();

  const users = await Promise.all([
    prisma.user.create({
      data: {
        name: "Amelia Singh",
        email: "amelia.manager@workspace.com",
        role: Role.MANAGER,
        avatarColor: "#ec4899",
      },
    }),
    prisma.user.create({
      data: {
        name: "Noah Patel",
        email: "noah.manager@workspace.com",
        role: Role.MANAGER,
        avatarColor: "#f97316",
      },
    }),
    prisma.user.create({
      data: {
        name: "Olivia Chen",
        email: "olivia.chen@workspace.com",
        role: Role.EMPLOYEE,
        avatarColor: "#6366f1",
      },
    }),
    prisma.user.create({
      data: {
        name: "Liam Torres",
        email: "liam.torres@workspace.com",
        role: Role.EMPLOYEE,
        avatarColor: "#14b8a6",
      },
    }),
    prisma.user.create({
      data: {
        name: "Emma Robinson",
        email: "emma.robinson@workspace.com",
        role: Role.EMPLOYEE,
        avatarColor: "#a855f7",
      },
    }),
    prisma.user.create({
      data: {
        name: "Ethan Wu",
        email: "ethan.wu@workspace.com",
        role: Role.EMPLOYEE,
        avatarColor: "#facc15",
      },
    }),
  ]);

  const [amelia, noah, olivia, liam, emma, ethan] = users;

  const downtown = await prisma.location.create({
    data: {
      name: "Downtown HQ",
      slug: "downtown-hq",
      timezone: "America/Los_Angeles",
      address: "100 Market Street, San Francisco, CA",
      description: "Flagship office with open collaboration spaces and executive parking.",
      admins: {
        create: [
          { userId: amelia.id },
          { userId: olivia.id },
        ],
      },
    },
  });

  const innovation = await prisma.location.create({
    data: {
      name: "Innovation Hub",
      slug: "innovation-hub",
      timezone: "America/New_York",
      address: "88 Harbor Avenue, Boston, MA",
      description: "R&D campus with labs, garages, and focus rooms.",
      admins: {
        create: [
          { userId: noah.id },
        ],
      },
    },
  });

  const spaces = await Promise.all([
    prisma.space.create({
      data: {
        name: "Skyline Desk 101",
        code: "HQ-D-101",
        type: SpaceType.DESK,
        description: "Window desk with standing desk converter and dual monitors.",
        capacity: 1,
        locationId: downtown.id,
        floor: 12,
        gridX: 1,
        gridY: 1,
        color: "#0ea5e9",
        openingWindows: {
          create: [0, 1, 2, 3, 4].map((day) => ({
            dayOfWeek: day,
            startTime: "08:00",
            endTime: "18:00",
          })),
        },
      },
    }),
    prisma.space.create({
      data: {
        name: "Design Lab Desk 202",
        code: "HQ-D-202",
        type: SpaceType.DESK,
        description: "Dedicated product designer desk with prototyping tools.",
        capacity: 1,
        locationId: downtown.id,
        floor: 8,
        gridX: 2,
        gridY: 1,
        color: "#22c55e",
        hasFixedOwner: true,
        ownerId: olivia.id,
        openingWindows: {
          create: [0, 1, 2, 3, 4].map((day) => ({
            dayOfWeek: day,
            startTime: "09:00",
            endTime: "17:00",
          })),
        },
      },
    }),
    prisma.space.create({
      data: {
        name: "Executive Parking P1",
        code: "HQ-P-1",
        type: SpaceType.PARKING,
        description: "Reserved EV-ready parking spot with charging.",
        capacity: 1,
        locationId: downtown.id,
        floor: -1,
        gridX: 0,
        gridY: 3,
        color: "#f97316",
        hasFixedOwner: true,
        ownerId: amelia.id,
      },
    }),
    prisma.space.create({
      data: {
        name: "Ocean Meeting Room",
        code: "HQ-M-12",
        type: SpaceType.MEETING,
        description: "12-person conference room with Teams Room setup.",
        capacity: 12,
        locationId: downtown.id,
        floor: 15,
        gridX: 3,
        gridY: 1,
        color: "#38bdf8",
        openingWindows: {
          create: [0, 1, 2, 3, 4].map((day) => ({
            dayOfWeek: day,
            startTime: "08:00",
            endTime: "20:00",
          })),
        },
      },
    }),
    prisma.space.create({
      data: {
        name: "Innovation Desk A",
        code: "IH-D-A",
        type: SpaceType.DESK,
        description: "Hot desk near robotics lab with acoustic partitions.",
        capacity: 1,
        locationId: innovation.id,
        floor: 4,
        gridX: 1,
        gridY: 2,
        color: "#a855f7",
        openingWindows: {
          create: [1, 2, 3, 4, 5].map((day) => ({
            dayOfWeek: day,
            startTime: "07:00",
            endTime: "19:00",
          })),
        },
      },
    }),
    prisma.space.create({
      data: {
        name: "Prototype Garage",
        code: "IH-G-1",
        type: SpaceType.PARKING,
        description: "Garage bay for prototype vehicles and testing equipment.",
        capacity: 2,
        locationId: innovation.id,
        floor: 1,
        gridX: 4,
        gridY: 2,
        color: "#facc15",
        openingWindows: {
          create: [0, 1, 2, 3, 4, 5].map((day) => ({
            dayOfWeek: day,
            startTime: "06:00",
            endTime: "22:00",
          })),
        },
      },
    }),
    prisma.space.create({
      data: {
        name: "Focus Phone Booth",
        code: "IH-PB-7",
        type: SpaceType.PHONE,
        description: "Soundproof pod with video lighting and ergonomic stool.",
        capacity: 1,
        locationId: innovation.id,
        floor: 5,
        gridX: 2,
        gridY: 3,
        color: "#f43f5e",
        openingWindows: {
          create: [0, 1, 2, 3, 4, 5].map((day) => ({
            dayOfWeek: day,
            startTime: "07:00",
            endTime: "21:00",
          })),
        },
      },
    }),
  ]);

  const [skylineDesk, designDesk, , oceanRoom, , , phoneBooth] = spaces;

  const { start: skyStart, end: skyEnd } = slot(0, 10, 120);
  const { start: oceanStart, end: oceanEnd } = slot(1, 11, 60);
  const { start: phoneStart, end: phoneEnd } = slot(0, 14, 45);

  await prisma.reservation.createMany({
    data: [
      {
        spaceId: skylineDesk.id,
        userId: liam.id,
        start: skyStart,
        end: skyEnd,
        status: ReservationStatus.RESERVED,
      },
      {
        spaceId: oceanRoom.id,
        userId: emma.id,
        start: oceanStart,
        end: oceanEnd,
        status: ReservationStatus.RESERVED,
        notes: "Quarterly roadmap sync",
      },
      {
        spaceId: phoneBooth.id,
        userId: ethan.id,
        start: phoneStart,
        end: phoneEnd,
        status: ReservationStatus.OCCUPIED,
      },
    ],
  });

  const { start: requestStart, end: requestEnd } = slot(2, 9, 90);

  await prisma.occupancyRequest.create({
    data: {
      spaceId: designDesk.id,
      requesterId: liam.id,
      start: requestStart,
      end: requestEnd,
      status: RequestStatus.PENDING,
    },
  });

  console.info("✅ Database seeded.");
}

main()
  .catch((error) => {
    console.error("❌ Seed failed", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
