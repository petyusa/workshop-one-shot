'use client';

import { useEffect, useState } from "react";
import { Loader2, XCircle } from "lucide-react";
import type { SpaceSummary, UserSummary } from "@/types";
import clsx from "clsx";
import { format } from "date-fns";

type Props = {
  space: SpaceSummary | null;
  currentUser: UserSummary;
  onClose: () => void;
  onSuccess: () => void;
};

function toLocalDateInput(date: Date) {
  return format(date, "yyyy-MM-dd");
}

export function ReservationDialog({ space, currentUser, onClose, onSuccess }: Props) {
  const [date, setDate] = useState(() => toLocalDateInput(new Date()));
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "saving">("idle");
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!space) {
      return;
    }

    setDate(toLocalDateInput(new Date()));
    setStartTime("09:00");
    setEndTime("10:00");
    setNotes("");
    setSuccessMessage(null);
    setError(null);
  }, [space]);

  if (!space) {
    return null;
  }

  const openingDescription = space.openingWindows?.length
    ? new Intl.ListFormat("en", { style: "short", type: "conjunction" }).format(
        [...new Set(space.openingWindows.map((window) => window.dayOfWeek))].map((day) =>
          ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][day],
        ),
      )
    : "Always open";

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!space) {
      return;
    }

    const start = new Date(`${date}T${startTime}`);
    const end = new Date(`${date}T${endTime}`);

    if (start >= end) {
      setError("Start time must be before end time.");
      return;
    }

    setStatus("saving");
    setError(null);

    try {
      const response = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          spaceId: space.id,
          userId: currentUser.id,
          start: start.toISOString(),
          end: end.toISOString(),
          notes,
        }),
      });

      const payload = await response.json();

      if (!response.ok && response.status !== 202) {
        throw new Error(payload.message ?? "Unable to create reservation.");
      }

      setSuccessMessage(
        payload.requiresApproval
          ? "Approval request sent to the space owner. You'll be notified once it's accepted."
          : "Reservation confirmed!",
      );

      onSuccess();

      if (!payload.requiresApproval) {
        setTimeout(() => {
          onClose();
        }, 1000);
      }
    } catch (exception) {
      setError(exception instanceof Error ? exception.message : "Unable to create reservation.");
    } finally {
      setStatus("idle");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/40 px-4 pb-10 pt-24 sm:items-center sm:pt-0">
      <div className="relative w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 transition hover:text-slate-600"
        >
          <XCircle className="h-5 w-5" />
        </button>
        <h2 className="text-xl font-semibold text-slate-900">
          Reserve {space.name}
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          {space.description ?? "Reserve this space for focused work."}
        </p>

        <dl className="mt-4 grid grid-cols-2 gap-3 text-sm text-slate-600">
          <div>
            <dt className="text-xs uppercase tracking-wide text-slate-400">Location</dt>
            <dd className="font-medium text-slate-800">{space.location.name}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-slate-400">Capacity</dt>
            <dd className="font-medium text-slate-800">{space.capacity}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-slate-400">Opening</dt>
            <dd className="font-medium text-slate-800">{openingDescription}</dd>
          </div>
          {space.owner && (
            <div>
              <dt className="text-xs uppercase tracking-wide text-slate-400">Owner</dt>
              <dd className="font-medium text-slate-800">{space.owner.name}</dd>
            </div>
          )}
        </dl>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
              Date
              <input
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
                className="rounded-xl border border-slate-300 px-3 py-2 text-slate-900 focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/20"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
              Start
              <input
                type="time"
                value={startTime}
                onChange={(event) => setStartTime(event.target.value)}
                className="rounded-xl border border-slate-300 px-3 py-2 text-slate-900 focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/20"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
              End
              <input
                type="time"
                value={endTime}
                onChange={(event) => setEndTime(event.target.value)}
                className="rounded-xl border border-slate-300 px-3 py-2 text-slate-900 focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/20"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
              Notes (optional)
              <input
                type="text"
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Agenda, guests, or reminders"
                className="rounded-xl border border-slate-300 px-3 py-2 text-slate-900 focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/20"
              />
            </label>
          </div>

          {error && <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
          {successMessage && (
            <p className="rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-600">{successMessage}</p>
          )}

          <button
            type="submit"
            disabled={status === "saving"}
            className={clsx(
              "inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-slate-900/30 transition",
              status === "saving" ? "opacity-75" : "hover:bg-slate-800",
            )}
          >
            {status === "saving" ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {status === "saving" ? "Saving..." : "Confirm reservation"}
          </button>
        </form>
      </div>
    </div>
  );
}
