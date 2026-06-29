import { describe, expect, it } from "vitest";
import {
  chamberInfoForPosition,
  chamberTypeFor,
  floorChamberFromGlobalIndex,
  globalIndexFor,
} from "@/lib/tower/progression";

describe("tower progression helpers", () => {
  it("maps floor/chamber pairs to a stable global index", () => {
    expect(globalIndexFor(1, 0)).toBe(0);
    expect(globalIndexFor(1, 2)).toBe(2);
    expect(globalIndexFor(2, 0)).toBeGreaterThan(globalIndexFor(1, 2));
  });

  it("round-trips global indices back to floor/chamber", () => {
    const pos = floorChamberFromGlobalIndex(globalIndexFor(3, 1));
    expect(pos).toEqual({ floor: 3, chamber: 1 });
  });

  it("assigns chamber types and boss metadata", () => {
    expect(chamberTypeFor(7, 0)).toBe("boss-gate");
    const info = chamberInfoForPosition(2, 1, 4);
    expect(info.floor).toBe(2);
    expect(info.chamberNumber).toBe(2);
    expect(info.isBoss).toBe(false);
  });
});
