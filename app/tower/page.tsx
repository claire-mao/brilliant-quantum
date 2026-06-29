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
      <div className="flex min-h-0 flex-1 flex-col">
        <NavBar variant="dark" />
        <Suspense
          fallback={
            <div className="flex flex-1 items-center justify-center bg-[radial-gradient(120%_120%_at_50%_-10%,#0c1430_0%,#070a12_55%,#04060c_100%)] p-8 text-sm text-slate-400">
              Loading the tower…
            </div>
          }
        >
          <TowerArena />
        </Suspense>
      </div>
    </RouteGuard>
  );
}
