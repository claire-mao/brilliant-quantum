"use client";

import RouteGuard from "@/components/RouteGuard";
import NavBar from "@/components/NavBar";
import TowerDungeon from "@/components/tower/TowerDungeon";

export default function TowerPage() {
  return (
    <RouteGuard>
      <div className="relative isolate flex flex-1 flex-col bg-[#0b0a1f] text-slate-100">
        <NavBar variant="dark" />
        <TowerDungeon />
      </div>
    </RouteGuard>
  );
}
