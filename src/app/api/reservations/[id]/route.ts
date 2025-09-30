import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { cancelReservation, updateReservationStatus } from "@/lib/reservations";
import { ReservationStatus } from "@/generated/prisma";

const statusSchema = z.object({
  status: z.nativeEnum(ReservationStatus),
});

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const body = await request.json();
  const parsed = statusSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ message: parsed.error.message }, { status: 400 });
  }

  try {
    const reservation = await updateReservationStatus(id, parsed.data.status);
    return NextResponse.json(reservation);
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Unable to update reservation." },
      { status: 400 },
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  try {
    const reservation = await cancelReservation(id);
    return NextResponse.json(reservation);
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Unable to cancel reservation." },
      { status: 400 },
    );
  }
}
