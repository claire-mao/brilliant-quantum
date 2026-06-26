"use client";

import RouteGuard from "@/components/RouteGuard";
import NavBar from "@/components/NavBar";
import TowerArena from "@/components/tower/TowerArena";

export default function TowerPage() {
  return (
    <RouteGuard>
      <NavBar />
      <TowerArena />
    </RouteGuard>
  );
}
