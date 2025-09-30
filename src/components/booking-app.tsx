'use client';

import { useEffect, useMemo, useRef, useState } from "react";
import {
  type LocationSummary,
  type OccupancyRequestSummary,
  type ReservationSummary,
  type SpaceSummary,
} from "@/types";
import { LoginPanel } from "@/components/login-panel";
import { useAppStore } from "@/store/app-store";
import { ReservationDialog } from "@/components/reservation-dialog";
import { SpaceCard } from "@/components/space-card";
import { FloorPlan } from "@/components/floor-plan";
import { SummaryCards } from "@/components/dashboard/summary-cards";
import { ManagerInsights } from "@/components/dashboard/manager-insights";
import { ReservationsTable } from "@/components/dashboard/reservations-table";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { RequestQueue } from "@/components/dashboard/request-queue";
import { Building2, RefreshCcw } from "lucide-react";
import clsx from "clsx";

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    cache: "no-store",
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

type DashboardData = {
  locations: LocationSummary[];
  spaces: SpaceSummary[];
  reservations: ReservationSummary[];
  requests: OccupancyRequestSummary[];
};

export function BookingApp() {
  const currentUser = useAppStore((state) => state.currentUser);
  const selectedLocationId = useAppStore((state) => state.selectedLocationId);
  const selectLocation = useAppStore((state) => state.setSelectedLocation);
  const logout = useAppStore((state) => state.logout);

  const [data, setData] = useState<DashboardData>({
    locations: [],
    spaces: [],
    reservations: [],
    requests: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reservationTarget, setReservationTarget] = useState<SpaceSummary | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const autoSelectedRef = useRef(false);

  const canManage = currentUser?.role === "MANAGER" || (currentUser?.manages?.length ?? 0) > 0;

  const locationOptions = data.locations;
  const activeLocation = locationOptions.find((location) => location.id === selectedLocationId) ?? null;

  useEffect(() => {
    if (!currentUser) {
      setData({ locations: [], spaces: [], reservations: [], requests: [] });
      autoSelectedRef.current = false;
      return;
    }

    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError(null);

        const locationQuery = selectedLocationId ? `?locationId=${selectedLocationId}` : "";

        const [locations, spaces, reservations, requests] = await Promise.all([
          fetchJson<LocationSummary[]>(`/api/locations`),
          fetchJson<SpaceSummary[]>(`/api/spaces${locationQuery ? `${locationQuery}&includeOpening=true` : "?includeOpening=true"}`),
          fetchJson<ReservationSummary[]>(`/api/reservations${locationQuery}`),
          fetchJson<OccupancyRequestSummary[]>(`/api/requests${locationQuery}`),
        ]);

        if (cancelled) {
          return;
        }

        setData({ locations, spaces, reservations, requests });

        if (!autoSelectedRef.current && !selectedLocationId && locations.length) {
          selectLocation(locations[0].id);
          autoSelectedRef.current = true;
        }
      } catch (exception) {
        if (!cancelled) {
          setError(exception instanceof Error ? exception.message : "Unable to load workspace data.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [currentUser, selectedLocationId, selectLocation]);

  const spacesForLocation = useMemo(() => {
    if (!selectedLocationId) {
      return data.spaces;
    }
    return data.spaces.filter((space) => space.location.id === selectedLocationId);
  }, [data.spaces, selectedLocationId]);

  const pendingRequests = useMemo(
    () => data.requests.filter((request) => request.status === "PENDING"),
    [data.requests],
  );

  const refreshData = async () => {
    if (!currentUser) {
      return;
    }

    try {
      setRefreshing(true);
      const locationQuery = selectedLocationId ? `?locationId=${selectedLocationId}` : "";
      const [spaces, reservations, requests] = await Promise.all([
        fetchJson<SpaceSummary[]>(`/api/spaces${locationQuery ? `${locationQuery}&includeOpening=true` : "?includeOpening=true"}`),
        fetchJson<ReservationSummary[]>(`/api/reservations${locationQuery}`),
        fetchJson<OccupancyRequestSummary[]>(`/api/requests${locationQuery}`),
      ]);
      setData((previous) => ({
        ...previous,
        spaces,
        reservations,
        requests,
      }));
    } catch (exception) {
      setError(exception instanceof Error ? exception.message : "Unable to refresh data.");
    } finally {
      setRefreshing(false);
    }
  };

  const handleDecision = async (requestId: string, approve: boolean) => {
    if (!currentUser) {
      throw new Error("You must be logged in to decide on a request.");
    }

    const response = await fetch(`/api/requests/${requestId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        approve,
        handlerId: currentUser.id,
      }),
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      throw new Error(payload.message ?? "Unable to update request.");
    }

    await refreshData();
  };

  if (!currentUser) {
    return (
      <div className="mx-auto max-w-4xl space-y-8 py-16">
        <section className="rounded-3xl border border-slate-100 bg-white/80 p-10 text-center shadow-2xl shadow-slate-200/60">
          <h1 className="text-4xl font-semibold text-slate-900">Workspace Flow</h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600">
            Reserve desks, parking, and meeting spaces across every office. Mock logins let you switch roles instantly to explore approval workflows and manager dashboards.
          </p>
        </section>
        <LoginPanel />
      </div>
    );
  }

  return (
    <div className="space-y-10 py-10">
      <header className="flex flex-col gap-6 rounded-3xl border border-slate-200 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 px-8 py-10 text-white shadow-2xl shadow-slate-900/20">
        <div className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-slate-300">Workspace operations</p>
            <h1 className="mt-2 text-4xl font-semibold">Hello, {currentUser.name.split(" ")[0]}</h1>
            <p className="mt-3 max-w-xl text-sm text-slate-200">
              {activeLocation
                ? `You're viewing ${activeLocation.name}. Switch locations to see availability in other offices.`
                : "Choose a location to explore availability and upcoming reservations."}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-3">
              <span
                className="flex h-12 w-12 items-center justify-center rounded-2xl text-lg font-semibold text-white shadow-lg shadow-slate-900/40"
                style={{ backgroundColor: currentUser.avatarColor ?? "#1e293b" }}
              >
                {currentUser.name
                  .split(" ")
                  .map((part) => part[0])
                  .join("")}
              </span>
              <div className="leading-tight">
                <p className="font-semibold">{currentUser.name}</p>
                <p className="text-xs uppercase tracking-wide text-slate-300">{currentUser.role.toLowerCase()}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={logout}
              className="rounded-2xl border border-white/20 px-4 py-2 text-sm font-semibold text-white transition hover:border-white hover:bg-white/10"
            >
              Log out
            </button>
          </div>
        </div>
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <span className="rounded-2xl bg-white/10 p-3">
              <Building2 className="h-5 w-5 text-white" />
            </span>
            <div className="flex flex-col gap-1 text-sm">
              <span className="text-xs uppercase tracking-wide text-slate-300">Active location</span>
              <select
                value={selectedLocationId ?? ""}
                onChange={(event) => {
                  autoSelectedRef.current = true;
                  selectLocation(event.target.value || null);
                }}
                className="min-w-[220px] rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-sm font-semibold text-white shadow-inner backdrop-blur hover:border-white/40 focus:border-white focus:outline-none"
              >
                <option value="">All locations</option>
                {locationOptions.map((location) => (
                  <option key={location.id} value={location.id}>
                    {location.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <button
            type="button"
            onClick={refreshData}
            disabled={refreshing}
            className="inline-flex items-center gap-2 self-start rounded-2xl border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:border-white hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-70"
          >
            <RefreshCcw className={clsx("h-4 w-4", refreshing && "animate-spin")} />
            Refresh data
          </button>
        </div>
      </header>

      {error && (
        <p className="rounded-3xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
          {error}
        </p>
      )}

      {loading ? (
        <div className="flex h-64 items-center justify-center rounded-3xl border border-dashed border-slate-200">
          <span className="text-sm text-slate-500">Loading workspace data...</span>
        </div>
      ) : (
        <div className="space-y-10">
          {data.locations.length > 0 && <SummaryCards locations={data.locations} />}

          <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">Reservable spaces</h2>
                  <p className="text-sm text-slate-500">
                    Browse desks, rooms, parking, and more. Click reserve to book instantly or request owner approval.
                  </p>
                </div>
              </div>
              <div className="grid gap-5 lg:grid-cols-2">
                {spacesForLocation.map((space) => (
                  <SpaceCard key={space.id} space={space} onReserve={setReservationTarget} />
                ))}
              </div>
              {spacesForLocation.length === 0 && (
                <p className="rounded-3xl border border-dashed border-slate-200 p-10 text-center text-sm text-slate-500">
                  No spaces found for this location.
                </p>
              )}
            </div>
            <FloorPlan spaces={spacesForLocation.slice(0, 25)} onSelectSpace={setReservationTarget} />
          </div>

          {canManage && (
            <section className="space-y-8">
              <div className="flex flex-col gap-2">
                <h2 className="text-xl font-semibold text-slate-900">Manager dashboard</h2>
                <p className="text-sm text-slate-500">
                  Track availability, upcoming reservations, and approval workflows for the locations you oversee.
                </p>
              </div>
              <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
                <div className="space-y-6">
                  <ManagerInsights location={activeLocation} pendingRequests={pendingRequests} />
                  <ReservationsTable reservations={data.reservations} requests={pendingRequests} />
                </div>
                <div className="space-y-6">
                  <RequestQueue requests={pendingRequests} onDecision={handleDecision} />
                  <ActivityFeed reservations={data.reservations} requests={data.requests} />
                </div>
              </div>
            </section>
          )}
        </div>
      )}

      <ReservationDialog
        space={reservationTarget}
        currentUser={currentUser}
        onClose={() => setReservationTarget(null)}
        onSuccess={refreshData}
      />
    </div>
  );
}
