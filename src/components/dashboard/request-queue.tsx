'use client';

import { useState } from "react";
import type { OccupancyRequestSummary } from "@/types";
import { format } from "date-fns";
import { CircleCheck, Loader2, XCircle } from "lucide-react";
import clsx from "clsx";

type Props = {
  requests: OccupancyRequestSummary[];
  onDecision: (requestId: string, approve: boolean) => Promise<void>;
};

export function RequestQueue({ requests, onDecision }: Props) {
  const [processing, setProcessing] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDecision = async (requestId: string, approve: boolean) => {
    try {
      setProcessing(requestId);
      setError(null);
      await onDecision(requestId, approve);
    } catch (exception) {
      setError(exception instanceof Error ? exception.message : "Unable to update request.");
    } finally {
      setProcessing(null);
    }
  };

  if (requests.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500">
        All owner approvals are up to date.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {error && <p className="rounded-2xl bg-rose-50 px-3 py-2 text-sm text-rose-600">{error}</p>}

      {requests.map((request) => (
        <div
          key={request.id}
          className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-slate-900">
                {request.requester.name} → {request.space.name}
              </p>
              <p className="text-xs text-slate-500">
                {format(new Date(request.start), "MMM d, h:mma")} – {format(new Date(request.end), "h:mma")}
                {" · "}
                {request.space.location.name}
              </p>
              {request.space.owner ? (
                <p className="mt-1 text-xs text-slate-400">
                  Owner: {request.space.owner.name} ({request.space.owner.email})
                </p>
              ) : null}
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleDecision(request.id, false)}
                disabled={processing === request.id}
                className={clsx(
                  "inline-flex items-center gap-1 rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-500 transition",
                  processing === request.id ? "opacity-60" : "hover:border-rose-300 hover:text-rose-600",
                )}
              >
                {processing === request.id ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <XCircle className="h-3.5 w-3.5" />
                )}
                Decline
              </button>
              <button
                type="button"
                onClick={() => handleDecision(request.id, true)}
                disabled={processing === request.id}
                className={clsx(
                  "inline-flex items-center gap-1 rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white shadow-sm transition",
                  processing === request.id ? "opacity-60" : "hover:bg-slate-800",
                )}
              >
                {processing === request.id ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <CircleCheck className="h-3.5 w-3.5" />
                )}
                Approve
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
