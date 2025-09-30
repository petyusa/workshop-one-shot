import type { ReservationSummary, OccupancyRequestSummary } from "@/types";
import { ArrowRight, CheckCircle2, Clock, MailQuestion } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import clsx from "clsx";

type Props = {
  reservations: ReservationSummary[];
  requests: OccupancyRequestSummary[];
};

export function ActivityFeed({ reservations, requests }: Props) {
  const events = [
    ...reservations.map((reservation) => ({
      type: "reservation" as const,
      id: reservation.id,
      date: reservation.start,
      title: `${reservation.user.name} reserved ${reservation.space.name}`,
      subtitle: `${reservation.space.location.name} · ${reservation.user.email}`,
    })),
    ...requests.map((request) => ({
      type: "request" as const,
      id: request.id,
      date: request.createdAt,
      title: `${request.requester.name} requested ${request.space.name}`,
      subtitle: `${request.space.location.name}`,
      status: request.status,
    })),
  ]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 8);

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between pb-4">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Latest activity
        </h3>
        <ArrowRight className="h-5 w-5 text-slate-400" />
      </div>
      <div className="space-y-3 text-sm">
        {events.map((event) => (
          <div key={event.id} className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-slate-50/60 p-3">
            <span
              className={clsx(
                "flex h-10 w-10 items-center justify-center rounded-full",
                event.type === "reservation" && "bg-emerald-100 text-emerald-700",
                event.type === "request" && "bg-amber-100 text-amber-700",
              )}
            >
              {event.type === "reservation" ? <CheckCircle2 className="h-5 w-5" /> : <MailQuestion className="h-5 w-5" />}
            </span>
            <div className="flex-1">
              <p className="font-semibold text-slate-900">{event.title}</p>
              <p className="text-xs text-slate-500">{event.subtitle}</p>
            </div>
            <div className="text-right text-xs text-slate-400">
              <p>{formatDistanceToNow(new Date(event.date), { addSuffix: true })}</p>
              {event.type === "request" ? (
                <span
                  className={clsx(
                    "mt-1 inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-semibold uppercase",
                    event.status === "PENDING" && "bg-amber-100 text-amber-700",
                    event.status === "APPROVED" && "bg-emerald-100 text-emerald-700",
                    event.status === "DECLINED" && "bg-rose-100 text-rose-700",
                  )}
                >
                  <Clock className="h-3 w-3" />
                  {event.status}
                </span>
              ) : null}
            </div>
          </div>
        ))}

        {events.length === 0 && (
          <p className="rounded-2xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500">
            No activity yet today.
          </p>
        )}
      </div>
    </div>
  );
}
