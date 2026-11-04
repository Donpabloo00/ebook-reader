"use client";

import dynamic from "next/dynamic";

const Reader = dynamic(() => import("@/components/Reader"), {
  ssr: false,
  loading: () => (
    <div className="grid h-dvh place-items-center bg-[#f6f1e6]">
      <div className="flex items-center gap-3 text-[#8a6d3f]">
        <span className="h-5 w-5 animate-spin rounded-full border-2 border-[#b08640] border-t-transparent" />
        <span className="text-sm">Se deschide cartea…</span>
      </div>
    </div>
  ),
});

export default function Home() {
  return <Reader />;
}
