import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { approveRequest } from "@/lib/reservations";
import { RequestStatus } from "@/generated/prisma";
import { prisma } from "@/lib/prisma";

const decisionSchema = z.object({
  approve: z.boolean(),
  handlerId: z.string().min(1),
  note: z.string().optional(),
});

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const body = await request.json();
  const parsed = decisionSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ message: parsed.error.message }, { status: 400 });
  }

  try {
    if (!parsed.data.approve) {
      const updated = await prisma.occupancyRequest.update({
        where: { id },
        data: {
          status: RequestStatus.DECLINED,
          handledById: parsed.data.handlerId,
          decisionNote: parsed.data.note,
        },
      });

      return NextResponse.json(updated);
    }

    const result = await approveRequest(id, parsed.data.handlerId, parsed.data.approve, parsed.data.note);

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Unable to process request." },
      { status: 400 },
    );
  }
}
