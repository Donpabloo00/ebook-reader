"use client";

import React from "react";
import type { LeafData } from "./types";
import { DemoBack, DemoContent, DemoCover } from "./DemoBook";

export interface BookPageProps {
  data: LeafData;
  spine: "l" | "r" | "both";
  images: (string | null)[];
}

const BookPage = React.forwardRef<HTMLDivElement, BookPageProps>(function BookPage(
  { data, spine, images },
  ref,
) {
  const spineClass = spine === "l" ? "spine-l" : spine === "r" ? "spine-r" : "spine-both";
  const hard = data.kind === "demo-cover" || data.kind === "demo-back";

  return (
    <div
      ref={ref}
      data-density={hard ? "hard" : undefined}
      className={`page-paper relative h-full w-full overflow-hidden ${spineClass}`}
      style={{ containerType: "inline-size" }}
    >
      {data.kind === "demo-cover" && <DemoCover />}
      {data.kind === "demo-back" && <DemoBack />}
      {data.kind === "demo-page" && <DemoContent n={data.n} />}
      {data.kind === "pdf" &&
        (images[data.index] ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={images[data.index] as string}
            alt={`Pagina ${data.index + 1}`}
            draggable={false}
            className="h-full w-full select-none object-contain"
          />
        ) : (
          <div className="grid h-full w-full place-items-center text-[#a08c66]">
            <div className="text-center" style={{ fontSize: "3cqw" }}>
              <span
                className="mx-auto mb-[2cqw] block animate-spin rounded-full border-2 border-[#b08640] border-t-transparent"
                style={{ width: "7cqw", height: "7cqw" }}
              />
              Se randează pagina…
            </div>
          </div>
        ))}
    </div>
  );
});

export { BookPage };
