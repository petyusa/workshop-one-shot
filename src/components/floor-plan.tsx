'use client';

import { memo, useMemo } from "react";
import type { SpaceSummary } from "@/types";
import clsx from "clsx";

const GRID_SIZE = 5;
const CELL_SIZE = 72;

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("");
}

type FloorPlanProps = {
  spaces: SpaceSummary[];
  onSelectSpace: (space: SpaceSummary) => void;
};

export const FloorPlan = memo(({ spaces, onSelectSpace }: FloorPlanProps) => {
  const grid = useMemo(() => {
    const gridSpaces: Array<SpaceSummary | null> = Array(GRID_SIZE * GRID_SIZE).fill(null);

    spaces.forEach((space) => {
      if (typeof space.gridX === "number" && typeof space.gridY === "number") {
        const index = space.gridY * GRID_SIZE + space.gridX;
        if (index >= 0 && index < gridSpaces.length) {
          gridSpaces[index] = space;
        }
      }
    });

    return gridSpaces;
  }, [spaces]);

  return (
    <div className="rounded-3xl border border-slate-100 bg-white/70 p-6 shadow-inner">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
        Floor plan snapshot
      </h3>
      <div
        className="mt-4 grid"
        style={{
          gridTemplateColumns: `repeat(${GRID_SIZE}, ${CELL_SIZE}px)`,
          gridTemplateRows: `repeat(${GRID_SIZE}, ${CELL_SIZE}px)`,
        }}
      >
        {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, index) => {
          const space = grid[index];
          const status = space?.status;

          return (
            <button
              key={index}
              type="button"
              onClick={() => space && onSelectSpace(space)}
              className={clsx(
                "flex items-center justify-center rounded-2xl border text-center text-xs font-medium transition",
                space ? "border-slate-200 bg-white shadow-sm shadow-slate-200" : "border-dashed border-slate-200",
                space && status === "available" && "hover:border-emerald-400 hover:shadow-emerald-100",
                space && status === "reserved" && "hover:border-amber-400 hover:shadow-amber-100",
                space && status === "occupied" && "hover:border-rose-400 hover:shadow-rose-100",
              )}
            >
              {space ? (
                <span className="flex h-full w-full flex-col items-center justify-center gap-1 px-3 py-2">
                  <span
                    className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold text-white"
                    style={{ backgroundColor: space.color ?? "#334155" }}
                  >
                    {getInitials(space.name)}
                  </span>
                  <span className="line-clamp-2 text-slate-700">{space.name}</span>
                  <span
                    className={clsx(
                      "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase",
                      status === "available" && "bg-emerald-100 text-emerald-700",
                      status === "reserved" && "bg-amber-100 text-amber-700",
                      status === "occupied" && "bg-rose-100 text-rose-700",
                    )}
                  >
                    {status}
                  </span>
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
});

FloorPlan.displayName = "FloorPlan";
