import { Building2, CalendarClock, CheckCircle2, Clock, Users } from "lucide-react";
import type { LocationSummary } from "@/types";

export function SummaryCards({ locations }: { locations: LocationSummary[] }) {
  const totals = locations.reduce(
    (accumulator, location) => {
      accumulator.totalLocations += 1;
      accumulator.totalSpaces += location.stats.totalSpaces;
      accumulator.available += location.stats.available;
      accumulator.reserved += location.stats.reserved;
      accumulator.occupied += location.stats.occupied;
      return accumulator;
    },
    {
      totalLocations: 0,
      totalSpaces: 0,
      available: 0,
      reserved: 0,
      occupied: 0,
    },
  );

  const cards = [
    {
      label: "Locations",
      value: totals.totalLocations,
      icon: Building2,
      description: "Sites managed across the workspace program.",
    },
    {
      label: "Desks & Rooms",
      value: totals.totalSpaces,
      icon: Users,
      description: "Reservable desks, rooms, parking, and phone booths.",
    },
    {
      label: "Now available",
      value: totals.available,
      icon: CheckCircle2,
      description: "Spaces ready to reserve right now.",
    },
    {
      label: "Upcoming reservations",
      value: totals.reserved,
      icon: CalendarClock,
      description: "Bookings scheduled to start later today.",
    },
    {
      label: "Currently occupied",
      value: totals.occupied,
      icon: Clock,
      description: "Spaces currently checked in by teammates.",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
      {cards.map((card) => (
        <div key={card.label} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start gap-4">
            <span className="rounded-2xl bg-slate-900/5 p-3 text-slate-900">
              <card.icon className="h-6 w-6" />
            </span>
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                {card.label}
              </p>
              <p className="text-2xl font-semibold text-slate-900">{card.value}</p>
              <p className="text-xs text-slate-500">{card.description}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
