"use client";

import { useEffect } from "react";
import RouteGuard from "@/components/RouteGuard";
import NavBar from "@/components/NavBar";
import TowerArena from "@/components/tower/TowerArena";
import { playSound, startBattleMusic, stopBattleMusic } from "@/lib/sound/sounds";

export default function TowerPage() {
  useEffect(() => {
    playSound("tower");
    startBattleMusic();
    return () => stopBattleMusic();
  }, []);

  return (
    <RouteGuard>
      <NavBar />
      <TowerArena />
    </RouteGuard>
  );
}
