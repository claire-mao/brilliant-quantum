"use client";

import { Suspense, useEffect } from "react";
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
      <NavBar variant="dark" />
      <Suspense
        fallback={
          <div className="flex flex-1 items-center justify-center p-8 text-sm text-slate-400">
            Loading the tower…
          </div>
        }
      >
        <TowerArena />
      </Suspense>
    </RouteGuard>
  );
}
