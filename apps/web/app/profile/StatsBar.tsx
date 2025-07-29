"use client";

import React, { useEffect, useState } from "react";
import { checkinApi } from "@/lib/checkinApi";
import { Trophy, Coins } from "lucide-react";

export function StatsBar() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkinApi.stats().then((res) => setStats(res.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="w-full h-4 bg-gray-100 rounded-full animate-pulse" />;
  if (!stats) return null;

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center space-x-2">
          <Trophy className="h-5 w-5 text-yellow" />
          <span className="font-bold text-primary">Nível {stats.level}</span>
        </div>
        <div className="flex items-center space-x-2">
          <Coins className="h-5 w-5 text-green" />
          <span className="font-bold text-primary">{stats.coins} moedas</span>
        </div>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-4 relative">
        <div
          className="bg-blue h-4 rounded-full transition-all duration-500"
          style={{ width: `${Math.round(stats.progress * 100)}%` }}
        />
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-xs text-primary font-semibold">
          {stats.currentLevelXP} / {stats.xpForNextLevel} XP
        </span>
      </div>
    </div>
  );
} 