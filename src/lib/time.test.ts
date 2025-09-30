import { describe, expect, it } from "vitest";
import { addMinutes } from "date-fns";
import { assertChronological, isWithinOpeningWindows, overlaps } from "./time";

describe("time helpers", () => {
  describe("overlaps", () => {
    it("detects overlapping intervals", () => {
      const startA = new Date("2025-06-01T09:00:00.000Z");
      const endA = addMinutes(startA, 60);
      const startB = addMinutes(startA, 30);
      const endB = addMinutes(startB, 45);
      expect(overlaps(startA, endA, startB, endB)).toBe(true);
    });

    it("returns false when intervals are disjoint", () => {
      const startA = new Date("2025-06-01T09:00:00.000Z");
      const endA = addMinutes(startA, 60);
      const startB = addMinutes(endA, 15);
      const endB = addMinutes(startB, 30);
      expect(overlaps(startA, endA, startB, endB)).toBe(false);
    });
  });

  describe("assertChronological", () => {
    it("throws when start is not before end", () => {
      const start = new Date("2025-06-01T10:00:00.000Z");
      const end = new Date("2025-06-01T09:00:00.000Z");
      expect(() => assertChronological(start, end)).toThrow("Start time must be before end time");
    });

    it("throws on invalid dates", () => {
      expect(() => assertChronological(new Date("invalid"), new Date())).toThrow("Invalid start date");
      expect(() => assertChronological(new Date(), new Date("invalid"))).toThrow("Invalid end date");
    });

    it("passes for valid chronological dates", () => {
      expect(() =>
        assertChronological(new Date("2025-06-01T09:00:00.000Z"), new Date("2025-06-01T10:00:00.000Z")),
      ).not.toThrow();
    });
  });

  describe("isWithinOpeningWindows", () => {
    const timezone = "America/Los_Angeles";

    it("returns true when the reservation is inside a window", () => {
      const start = new Date("2025-06-02T16:00:00.000Z");
      const end = addMinutes(start, 60);
      const windows = [
        { dayOfWeek: 1, startTime: "08:00", endTime: "18:00" },
        { dayOfWeek: 2, startTime: "08:00", endTime: "18:00" },
      ];

      expect(isWithinOpeningWindows(windows, start, end, timezone)).toBe(true);
    });

    it("returns false when reservation crosses days", () => {
      const start = new Date("2025-06-03T06:30:00.000Z");
      const end = addMinutes(start, 120);
      const windows = [{ dayOfWeek: 1, startTime: "08:00", endTime: "23:00" }];

      expect(isWithinOpeningWindows(windows, start, end, timezone)).toBe(false);
    });

    it("returns false when outside any opening window", () => {
      const start = new Date("2025-06-02T13:00:00.000Z");
      const end = addMinutes(start, 60);
      const windows = [{ dayOfWeek: 1, startTime: "14:00", endTime: "18:00" }];

      expect(isWithinOpeningWindows(windows, start, end, timezone)).toBe(false);
    });
  });
});
