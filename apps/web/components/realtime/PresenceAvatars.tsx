"use client";

import React from "react";

interface PresenceUser {
  userId: string;
  name: string;
  email: string;
  image?: string;
}

interface PresenceAvatarsProps {
  presenceList: PresenceUser[];
  maxToShow?: number;
}

export function PresenceAvatars({ presenceList, maxToShow = 4 }: PresenceAvatarsProps) {
  // Filter out duplicates (in case user has multiple tabs open)
  const uniqueUsers = presenceList.reduce<PresenceUser[]>((acc, current) => {
    const x = acc.find((item) => item.userId === current.userId);
    if (!x) {
      return acc.concat([current]);
    } else {
      return acc;
    }
  }, []);

  const visibleUsers = uniqueUsers.slice(0, maxToShow);
  const remainingCount = uniqueUsers.length - maxToShow;

  if (uniqueUsers.length === 0) return null;

  return (
    <div className="flex items-center gap-2">
      <div className="flex -space-x-2 overflow-hidden">
        {visibleUsers.map((pUser) => {
          const initials = pUser.name
            ? pUser.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
            : pUser.email.slice(0, 2).toUpperCase();

          return (
            <div
              key={pUser.userId}
              className="group relative inline-block cursor-pointer"
            >
              {pUser.image ? (
                <img
                  className="inline-block h-8 w-8 rounded-full ring-2 ring-emerald-500 bg-zinc-800 object-cover"
                  src={pUser.image}
                  alt={pUser.name}
                />
              ) : (
                <div className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-zinc-700 ring-2 ring-emerald-500 text-xs font-semibold text-white">
                  {initials}
                </div>
              )}
              {/* Premium hover tooltip */}
              <div className="absolute bottom-full left-1/2 z-50 mb-2 -translate-x-1/2 scale-90 opacity-0 pointer-events-none rounded-md bg-zinc-950/90 border border-white/10 px-2.5 py-1.5 text-xs text-zinc-100 shadow-xl transition-all group-hover:scale-100 group-hover:opacity-100 whitespace-nowrap">
                <p className="font-semibold text-zinc-200">{pUser.name}</p>
                <p className="text-[10px] text-zinc-400">{pUser.email}</p>
              </div>
            </div>
          );
        })}

        {remainingCount > 0 && (
          <div className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-zinc-800 ring-2 ring-emerald-500 text-xs font-bold text-zinc-300">
            +{remainingCount}
          </div>
        )}
      </div>
      <span className="text-xs text-zinc-400 font-medium hidden md:inline">
        {uniqueUsers.length === 1 ? "1 editor online" : `${uniqueUsers.length} editors online`}
      </span>
    </div>
  );
}
