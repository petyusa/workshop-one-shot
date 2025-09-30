'use client';

import { useEffect, useState } from "react";
import { Loader2, LogIn } from "lucide-react";
import { useAppStore } from "@/store/app-store";
import type { UserSummary } from "@/types";
import clsx from "clsx";

export function LoginPanel() {
  const setUser = useAppStore((state) => state.setUser);
  const [users, setUsers] = useState<UserSummary[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadUsers() {
      try {
        const response = await fetch("/api/users");
        const data = await response.json();
        setUsers(data);
        if (data.length) {
          setSelectedUserId(data[0].id);
        }
      } finally {
        setIsLoading(false);
      }
    }

    loadUsers();
  }, []);

  const handleLogin = () => {
    const user = users.find((current) => current.id === selectedUserId);
    if (user) {
      setUser(user);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white/50 shadow-sm">
        <Loader2 className="h-6 w-6 animate-spin text-slate-500" />
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-xl shadow-slate-200">
      <h2 className="text-lg font-semibold text-slate-900">Quick login</h2>
      <p className="mt-1 text-sm text-slate-600">
        Pick a teammate to start reserving desks, parking, or rooms. Roles and permissions are mocked for demo purposes.
      </p>

      <div className="mt-4 space-y-3">
        {users.map((user) => {
          const isSelected = user.id === selectedUserId;
          return (
            <button
              key={user.id}
              type="button"
              onClick={() => setSelectedUserId(user.id)}
              className={clsx(
                "flex w-full items-center gap-3 rounded-xl border p-3 transition",
                isSelected
                  ? "border-slate-900 bg-slate-900 text-white shadow-lg"
                  : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50",
              )}
            >
              <span
                className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold"
                style={{
                  background: user.avatarColor ?? "#0f172a",
                  color: "#fff",
                }}
              >
                {user.name
                  .split(" ")
                  .map((part) => part[0])
                  .join("")}
              </span>
              <div className="flex flex-col items-start">
                <span className="font-medium">{user.name}</span>
                <span className="text-xs uppercase tracking-wide text-slate-500">{user.role.toLowerCase()}</span>
              </div>
              {user.manages.length > 0 && (
                <span className="ml-auto rounded-full bg-slate-900/10 px-2 py-1 text-xs font-medium text-slate-700">
                  Manages {user.manages.length} location{user.manages.length > 1 ? "s" : ""}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={handleLogin}
        disabled={!selectedUserId}
        className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-slate-900/20 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
      >
        <LogIn className="h-4 w-4" />
        Enter workspace
      </button>
    </div>
  );
}
