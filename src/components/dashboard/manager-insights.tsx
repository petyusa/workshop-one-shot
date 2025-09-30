import type { LocationSummary, OccupancyRequestSummary } from "@/types";
import { format } from "date-fns";
import { CalendarClock, Inbox, MailOpen, UserCheck2 } from "lucide-react";

type Props = {
  location?: LocationSummary | null;
  pendingRequests: OccupancyRequestSummary[];
};

export function ManagerInsights({ location, pendingRequests }: Props) {
  const insights = [
    {
      icon: CalendarClock,
      label: "Today's reservations",
      value: location?.stats.reserved ?? 0,
      description: "Bookings that start later today.",
    },
    {
      icon: UserCheck2,
      label: "Currently occupied",
      value: location?.stats.occupied ?? 0,
      description: "Spaces with active check-ins.",
    },
    {
      icon: Inbox,
      label: "Pending approvals",
      value: pendingRequests.length,
      description: "Requests waiting on owner or manager review.",
    },
    {
      icon: MailOpen,
      label: "Latest request",
      value: pendingRequests[0]
        ? format(new Date(pendingRequests[0].createdAt), "MMM d, h:mma")
        : "None",
      description: pendingRequests[0]
        ? `${pendingRequests[0].requester.name} requested ${pendingRequests[0].space.name}`
        : "No pending requests right now.",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {insights.map((insight) => (
        <div key={insight.label} className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-start gap-3">
            <span className="rounded-2xl bg-slate-900/10 p-3 text-slate-900">
              <insight.icon className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                {insight.label}
              </p>
              <p className="text-xl font-semibold text-slate-900">{insight.value}</p>
              <p className="text-xs text-slate-500">{insight.description}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
