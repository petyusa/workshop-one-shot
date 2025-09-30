import type { LocationSummary, SpaceSummary } from "@/types";
import { useMemo } from "react";

type Props = {
  locations: LocationSummary[];
  spaces: SpaceSummary[];
};

const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function AllocationHeatmap({ locations, spaces }: Props) {
  const occupancyRates = useMemo(() => {
    return locations.map((location) => {
      const locationSpaces = spaces.filter((space) => space.location.id === location.id);

      const counts = dayLabels.map((_day, index) => {
        const reservationsForDay = locationSpaces.flatMap((space) =>
          space.reservations.filter((reservation) => new Date(reservation.start).getDay() === ((index + 1) % 7)),
        );
        const availability = locationSpaces.length > 0 ? reservationsForDay.length / locationSpaces.length : 0;
        return Math.min(1, availability);
      });

      return {
        location,
        counts,
      };
    });
  }, [locations, spaces]);

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
        Occupancy by day
      </h3>
      <div className="mt-4 overflow-x-auto">
        <table className="min-w-full text-left text-xs text-slate-500">
          <thead>
            <tr>
              <th className="px-2 py-1 text-slate-400">Location</th>
              {dayLabels.map((day) => (
                <th key={day} className="px-2 py-1 text-center uppercase text-slate-400">
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {occupancyRates.map(({ location, counts }) => (
              <tr key={location.id} className="border-t border-slate-100">
                <td className="px-2 py-2 font-semibold text-slate-800">{location.name}</td>
                {counts.map((count, index) => (
                  <td key={index} className="px-2 py-2">
                    <div className="h-8 w-full rounded-full bg-slate-100">
                      <div
                        className="h-8 rounded-full bg-slate-900/60"
                        style={{ width: `${Math.round(count * 100)}%` }}
                      />
                    </div>
                    <span className="mt-1 block text-center text-[10px] font-semibold text-slate-400">
                      {Math.round(count * 100)}%
                    </span>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
