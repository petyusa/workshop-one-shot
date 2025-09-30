'use client';

import { CalendarPlus, Clock, UsersRound } from "lucide-react";
import type { SpaceSummary } from "@/types";
import clsx from "clsx";
import { format } from "date-fns";

type Props = {
  space: SpaceSummary;
  onReserve: (space: SpaceSummary) => void;
};

function formatStatus(status: SpaceSummary["status"], nextAvailability: string | null) {
  if (status === "available") {
    return "Available now";
  }

  if (nextAvailability) {
    return `Next open ${format(new Date(nextAvailability), "EEE p")}`;
  }

  return status === "occupied" ? "Currently occupied" : "Reserved soon";
}

export function SpaceCard({ space, onReserve }: Props) {
  const statusText = formatStatus(space.status, space.nextAvailability);
  const upcoming = space.reservations[0];

  return (
    <div className="group flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white/70 p-5 shadow-lg shadow-slate-200/70 transition hover:-translate-y-1 hover:border-slate-300 hover:shadow-xl">
      <div className="flex items-start gap-6">
        <div
          className="flex h-12 w-12 items-center justify-center rounded-2xl text-lg font-semibold text-white shadow-lg shadow-slate-900/15"
          style={{ backgroundColor: space.color ?? "#1d4ed8" }}
        >
          {space.name
            .split(" ")
            .map((part) => part[0])
            .join("")}
        </div>
        <div className="flex flex-1 flex-col gap-2">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">{space.name}</h3>
              <p className="text-sm text-slate-500">{space.location.name}</p>
            </div>
            <span
              className={clsx(
                "rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide",
                space.status === "available" && "bg-emerald-100 text-emerald-700",
                space.status === "reserved" && "bg-amber-100 text-amber-700",
                space.status === "occupied" && "bg-rose-100 text-rose-700",
              )}
            >
              {space.status}
            </span>
          </div>
          <p className="text-sm text-slate-600">{space.description}</p>
        </div>
      </div>

      <dl className="grid grid-cols-3 gap-4 text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <UsersRound className="h-4 w-4 text-slate-400" />
          <div>
            <dt className="font-semibold text-slate-700">Capacity</dt>
            <dd className="text-sm text-slate-500">{space.capacity}</dd>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-slate-400" />
          <div>
            <dt className="font-semibold text-slate-700">Status</dt>
            <dd className="text-sm text-slate-500">{statusText}</dd>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <CalendarPlus className="h-4 w-4 text-slate-400" />
          <div>
            <dt className="font-semibold text-slate-700">Upcoming</dt>
            <dd className="text-sm text-slate-500">
              {upcoming ? `${format(new Date(upcoming.start), "EEE p")} with ${upcoming.user.name}` : "None"}
            </dd>
          </div>
        </div>
      </dl>

      <button
        type="button"
        onClick={() => onReserve(space)}
        className={clsx(
          "mt-auto inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold transition",
          space.status === "available"
            ? "bg-slate-900 text-white shadow-lg shadow-slate-900/30 hover:bg-slate-800"
            : "border border-slate-200 bg-white text-slate-700 hover:border-slate-300"
        )}
      >
        Reserve this {space.type.toLowerCase()}
      </button>
    </div>
  );
}
