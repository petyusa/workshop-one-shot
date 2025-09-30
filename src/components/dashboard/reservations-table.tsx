import type { OccupancyRequestSummary, ReservationSummary } from "@/types";
import { format } from "date-fns";
import { BadgeCheck, ClockAlert, UserCheck2 } from "lucide-react";
import clsx from "clsx";

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-semibold uppercase",
        status === "RESERVED" && "bg-amber-100 text-amber-700",
        status === "OCCUPIED" && "bg-emerald-100 text-emerald-700",
        status === "CANCELLED" && "bg-slate-200 text-slate-600",
      )}
    >
      {status}
    </span>
  );
}

type Props = {
  reservations: ReservationSummary[];
  requests: OccupancyRequestSummary[];
};

export function ReservationsTable({ reservations, requests }: Props) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Upcoming reservations
          </h3>
          <BadgeCheck className="h-5 w-5 text-slate-400" />
        </div>
        <div className="mt-4 space-y-3 text-sm">
          {reservations.slice(0, 6).map((reservation) => (
            <div
              key={reservation.id}
              className="rounded-2xl border border-slate-100 bg-slate-50/60 p-3"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-slate-900">
                    {reservation.space.name} · {reservation.space.location.name}
                  </p>
                  <p className="text-xs text-slate-500">
                    {format(new Date(reservation.start), "MMM d, h:mma")} –
                    {" "}
                    {format(new Date(reservation.end), "h:mma")} · {reservation.user.name}
                  </p>
                </div>
                <StatusBadge status={reservation.status} />
              </div>
            </div>
          ))}

          {reservations.length === 0 && (
            <p className="rounded-2xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500">
              No upcoming reservations yet.
            </p>
          )}
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Approval requests
          </h3>
          <ClockAlert className="h-5 w-5 text-slate-400" />
        </div>
        <div className="mt-4 space-y-3 text-sm">
          {requests.slice(0, 6).map((request) => (
            <div
              key={request.id}
              className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50/60 p-3"
            >
              <div>
                <p className="font-semibold text-slate-900">
                  {request.space.name} · {request.space.location.name}
                </p>
                <p className="text-xs text-slate-500">
                  {format(new Date(request.start), "MMM d, h:mma")} –
                  {" "}
                  {format(new Date(request.end), "h:mma")} · {request.requester.name}
                </p>
              </div>
              <UserCheck2 className="h-5 w-5 text-slate-400" />
            </div>
          ))}

          {requests.length === 0 && (
            <p className="rounded-2xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500">
              No pending approvals right now.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
