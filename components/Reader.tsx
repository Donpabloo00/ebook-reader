"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import HTMLFlipBook from "react-pageflip";
import { BookPage } from "./BookPage";
import type { LeafData } from "./types";
import { DEMO_PAGES_COUNT } from "./DemoBook";

/* ---------- tipuri minime pentru PDF.js (import dinamic, doar client) ---------- */

type PdfPageApi = {
  getViewport(params: { scale: number }): { width: number; height: number };
  render(params: {
    canvasContext: CanvasRenderingContext2D;
    viewport: { width: number; height: number };
  }): { promise: Promise<void> };
};

type PdfDocApi = {
  numPages: number;
  getPage(pageNumber: number): Promise<PdfPageApi>;
  destroy(): Promise<void>;
};

type PdfModule = {
  GlobalWorkerOptions: { workerSrc: string };
  getDocument(src: { data: ArrayBuffer }): { promise: Promise<PdfDocApi> };
};

type FlipApi = {
  pageFlip(): {
    flipNext(corner?: "top" | "bottom"): void;
    flipPrev(corner?: "top" | "bottom"): void;
  };
};

const DEMO_LEAVES: LeafData[] = [
  { kind: "demo-cover" },
  ...Array.from(
    { length: DEMO_PAGES_COUNT },
    (_, i): LeafData => ({ kind: "demo-page", n: i }),
  ),
  { kind: "demo-back" },
];

export default function Reader() {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const flipRef = useRef<React.ComponentRef<typeof HTMLFlipBook> | null>(null);

  const [leaves, setLeaves] = useState<LeafData[]>(DEMO_LEAVES);
  const [mode, setMode] = useState<"demo" | "pdf">("demo");
  const [pdf, setPdf] = useState<PdfDocApi | null>(null);
  const [pdfName, setPdfName] = useState<string | null>(null);
  const [images, setImages] = useState<(string | null)[]>([]);
  const [aspect, setAspect] = useState(0.7);
  const [size, setSize] = useState({ w: 400, h: 570 });
  const [leaf, setLeaf] = useState(0);
  const [bookStart, setBookStart] = useState(0);
  const [fs, setFs] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [hint, setHint] = useState(true);
  const [uploadTick, setUploadTick] = useState(0);
  const [flipping, setFlipping] = useState(false);

  const imagesRef = useRef<(string | null)[]>([]);
  const renderingRef = useRef<Set<number>>(new Set());
  const leafRef = useRef(0);
  const sizeRef = useRef(size);
  const pdfRef = useRef<PdfDocApi | null>(null);

  useEffect(() => {
    imagesRef.current = images;
  }, [images]);
  useEffect(() => {
    leafRef.current = leaf;
  }, [leaf]);
  useEffect(() => {
    sizeRef.current = size;
  }, [size]);

  useEffect(() => {
    const t = window.setTimeout(() => setHint(false), 8000);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    const onFs = () => setFs(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onFs);
    return () => document.removeEventListener("fullscreenchange", onFs);
  }, []);

  /* ---------- dimensiuni reactive (remontează cartea la resize) ---------- */
  useEffect(() => {
    let timer = 0;
    const compute = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const reserved = fs ? 88 : 150;
      const mobile = vw < 768;
      const maxW = mobile ? vw * 0.92 : (vw - 80) / 2;
      let h = Math.min(Math.max(vh - reserved, 320), 780);
      let w = h * aspect;
      if (w > maxW) {
        w = maxW;
        h = w / aspect;
      }
      const rw = Math.round(w);
      const rh = Math.round(h);
      if (sizeRef.current.w !== rw || sizeRef.current.h !== rh) {
        setBookStart(leafRef.current);
      }
      setSize({ w: rw, h: rh });
    };
    const onResize = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(compute, 120);
    };
    compute();
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      window.clearTimeout(timer);
    };
  }, [aspect, fs]);

  /* ---------- randarea paginilor PDF (PDF.js → canvas → imagine) ---------- */
  const renderOne = useCallback(async (doc: PdfDocApi, index: number) => {
    if (index < 0 || index >= doc.numPages) return;
    if (imagesRef.current[index] || renderingRef.current.has(index)) return;
    renderingRef.current.add(index);
    try {
      const page = await doc.getPage(index + 1);
      const base = page.getViewport({ scale: 1 });
      const targetH = Math.min(Math.max(sizeRef.current.h * 1.6, 720), 1500);
      const scale = targetH / base.height;
      const viewport = page.getViewport({ scale });
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.floor(viewport.width));
      canvas.height = Math.max(1, Math.floor(viewport.height));
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      await page.render({ canvasContext: ctx, viewport }).promise;
      const url = canvas.toDataURL("image/jpeg", 0.82);
      imagesRef.current[index] = url;
      setImages((prev) => {
        const next = prev.slice();
        next[index] = url;
        return next;
      });
    } catch (err) {
      console.error("Nu am putut randa pagina", index + 1, err);
    } finally {
      renderingRef.current.delete(index);
    }
  }, []);

  /* coadă de fundal: primele pagini urgent, restul ordonate după pagină curentă */
  useEffect(() => {
    if (mode !== "pdf" || !pdf) return;
    let cancelled = false;
    void (async () => {
      const warm = Math.min(4, pdf.numPages);
      const order = Array.from({ length: pdf.numPages }, (_, i) => i);
      order.sort((a, b) => {
        const ka = a < warm ? a : warm + Math.abs(a - leafRef.current);
        const kb = b < warm ? b : warm + Math.abs(b - leafRef.current);
        return ka - kb;
      });
      for (const i of order) {
        if (cancelled) return;
        await renderOne(pdf, i);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [mode, pdf, uploadTick, renderOne]);

  /* randează cu prioritate paginile din jurul paginii curente */
  useEffect(() => {
    if (mode !== "pdf" || !pdf) return;
    for (const i of [leaf - 1, leaf, leaf + 1, leaf + 2, leaf + 3]) {
      void renderOne(pdf, i);
    }
  }, [mode, pdf, leaf, renderOne]);

  /* ---------- import PDF ---------- */
  const loadPdf = useCallback(async (file: File) => {
    if (!file.type.includes("pdf") && !/\.pdf$/i.test(file.name)) {
      setError("Te rog alege un fișier PDF.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const pdfjs = (await import("pdfjs-dist")) as unknown as PdfModule;
      pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
      const data = await file.arrayBuffer();
      const doc = await pdfjs.getDocument({ data }).promise;
      const first = await doc.getPage(1);
      const vp = first.getViewport({ scale: 1 });
      const ratio = Math.min(Math.max(vp.width / vp.height, 0.45), 1.3);

      const old = pdfRef.current;
      pdfRef.current = doc;
      imagesRef.current = new Array<string | null>(doc.numPages).fill(null);
      renderingRef.current = new Set();
      setImages(imagesRef.current.slice());
      setPdf(doc);
      setPdfName(file.name.replace(/\.pdf$/i, ""));
      setAspect(ratio);
      setLeaves(
        Array.from({ length: doc.numPages }, (_, i): LeafData => ({ kind: "pdf", index: i })),
      );
      setMode("pdf");
      setLeaf(0);
      setBookStart(0);
      setUploadTick((t) => t + 1);
      if (old) {
        old.destroy().catch(() => undefined);
      }
    } catch (err) {
      console.error(err);
      setError("Nu am putut deschide acest PDF. Încearcă alt fișier.");
    } finally {
      setBusy(false);
    }
  }, []);

  const backToDemo = useCallback(() => {
    const old = pdfRef.current;
    pdfRef.current = null;
    if (old) {
      old.destroy().catch(() => undefined);
    }
    setPdf(null);
    setPdfName(null);
    setImages([]);
    imagesRef.current = [];
    setMode("demo");
    setLeaves(DEMO_LEAVES);
    setLeaf(0);
    setBookStart(0);
    setUploadTick((t) => t + 1);
    setError(null);
  }, []);

  /* ---------- ecran complet ---------- */
  const toggleFs = useCallback(async () => {
    const el = rootRef.current;
    if (!el) return;
    const anyEl = el as HTMLElement & { webkitRequestFullscreen?: () => Promise<void> | void };
    try {
      if (!document.fullscreenElement) {
        if (el.requestFullscreen) {
          await el.requestFullscreen();
        } else {
          await anyEl.webkitRequestFullscreen?.();
        }
      } else {
        await document.exitFullscreen();
      }
    } catch {
      /* refuzat sau nesuportat */
    }
  }, []);

  /* ---------- tastatură ---------- */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const api = flipRef.current as unknown as FlipApi | null;
      if (e.key === "ArrowRight") api?.pageFlip().flipNext();
      if (e.key === "ArrowLeft") api?.pageFlip().flipPrev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const flipApi = useCallback(
    (): FlipApi | null => flipRef.current as unknown as FlipApi | null,
    [],
  );

  /* Tranziție "lift & settle": sincronizată cu starea internă a răsfoirii.
     changeState emite „flipping" la începutul întoarcerii și „read" la final. */
  const flipTimer = useRef(0);
  const onFlipState = useCallback((e: { data: string }) => {
    window.clearTimeout(flipTimer.current);
    if (e.data === "flipping") {
      setFlipping(true);
      flipTimer.current = window.setTimeout(() => setFlipping(false), 1150);
    } else if (e.data === "read") {
      setFlipping(false);
    }
  }, []);
  useEffect(() => () => window.clearTimeout(flipTimer.current), []);

  const total = leaves.length;

  const pageLabel = useMemo(() => {
    if (mode === "demo") {
      if (leaf <= 0) return "Copertă";
      if (leaf >= total - 1) return "Coperta din spate";
      const a = leaf - (leaf % 2 === 0 ? 1 : 0);
      return `${a}–${a + 1} din ${DEMO_PAGES_COUNT}`;
    }
    const n = total;
    if (n === 0) return "—";
    if (leaf <= 0) return `1 din ${n}`;
    const a = leaf + (leaf % 2 === 1 ? 1 : 0);
    if (a > n) return `${n} din ${n}`;
    const b = Math.min(a + 1, n);
    return a === b ? `${a} din ${n}` : `${a}–${b} din ${n}`;
  }, [mode, leaf, total]);

  return (
    <div
      ref={rootRef}
      className="relative flex h-dvh flex-col overflow-hidden"
      style={{
        background:
          "radial-gradient(140% 120% at 50% 0%, #f9f4e8 0%, #f1e9d6 48%, #e6dac0 100%)",
      }}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={(e) => {
        if (e.currentTarget === e.target) setDragOver(false);
      }}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        const f = e.dataTransfer.files?.[0];
        if (f) void loadPdf(f);
      }}
    >
      <input
        ref={fileRef}
        type="file"
        accept="application/pdf,.pdf"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void loadPdf(f);
          e.target.value = "";
        }}
      />

      {/* Bara de sus */}
      <header className="z-20 flex h-14 shrink-0 items-center gap-3 border-b border-[#e3d8bf] bg-[#faf6ec]/80 px-3 backdrop-blur sm:px-5">
        <div className="flex shrink-0 items-center gap-2 text-[#6b5636]">
          <IconBook className="h-5 w-5" />
          <span className="font-book text-lg font-semibold tracking-wide">Folio</span>
          <span className="hidden text-xs text-[#a08c66] lg:inline">· eBook Reader 3D</span>
        </div>

        <div className="flex min-w-0 flex-1 justify-center">
          <div className="flex min-w-0 items-center gap-2 rounded-full border border-[#e3d8bf] bg-white/70 px-4 py-1.5 text-sm text-[#6b5636] shadow-sm">
            <span className="max-w-[9rem] truncate font-medium sm:max-w-[14rem]">
              {mode === "pdf" ? pdfName : "Vântul dintre Pagini"}
            </span>
            <span className="h-1 w-1 shrink-0 rounded-full bg-[#c9b98f]" />
            <span className="shrink-0 tabular-nums">{pageLabel}</span>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button
            onClick={() => fileRef.current?.click()}
            className="btn-tool h-9 px-3 text-sm"
            title="Importă un PDF (sau trage-l în fereastră)"
          >
            <IconUpload className="h-4 w-4" />
            <span className="hidden sm:inline">Importă PDF</span>
          </button>
          {mode === "pdf" && (
            <button onClick={backToDemo} className="btn-tool hidden h-9 px-3 text-sm md:block">
              Demo
            </button>
          )}
          <span className="mx-1 hidden h-6 w-px bg-[#e3d8bf] sm:block" />
          <button
            aria-label="Pagina precedentă"
            title="Pagina precedentă (←)"
            disabled={leaf === 0}
            onClick={() => flipApi()?.pageFlip().flipPrev()}
            className="btn-tool h-9 w-9"
          >
            <IconChevronLeft className="h-5 w-5" />
          </button>
          <button
            aria-label="Pagina următoare"
            title="Pagina următoare (→)"
            disabled={leaf >= total - 1}
            onClick={() => flipApi()?.pageFlip().flipNext()}
            className="btn-tool h-9 w-9"
          >
            <IconChevronRight className="h-5 w-5" />
          </button>
          <button
            aria-label="Ecran complet"
            title="Ecran complet (F)"
            onClick={() => void toggleFs()}
            className="btn-tool h-9 w-9"
          >
            {fs ? <IconShrink className="h-5 w-5" /> : <IconExpand className="h-5 w-5" />}
          </button>
        </div>
      </header>

      {/* Progres lectură */}
      <div className="z-20 h-[3px] shrink-0 bg-[#e7dcc3]">
        <div
          className="h-full bg-[#b08640] transition-all duration-300"
          style={{ width: `${total > 1 ? (leaf / (total - 1)) * 100 : 0}%` }}
        />
      </div>

      {/* Scena */}
      <main className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden px-4 py-6">
        <div className={`book-stage relative inline-block ${flipping ? "flipping" : ""}`}>
          <div className="book-shadow" />
          <HTMLFlipBook
            key={`${mode}-${total}-${size.w}x${size.h}-${uploadTick}`}
            ref={flipRef}
            width={size.w}
            height={size.h}
            size="fixed"
            minWidth={100}
            maxWidth={4000}
            minHeight={200}
            maxHeight={2200}
            startPage={bookStart}
            startZIndex={10}
            autoSize={false}
            showCover={true}
            usePortrait={true}
            drawShadow={true}
            showPageCorners={true}
            mobileScrollSupport={true}
            clickEventForward={true}
            useMouseEvents={true}
            disableFlipByClick={false}
            swipeDistance={20}
            flippingTime={950}
            maxShadowOpacity={0.85}
            className="book3d"
            style={{}}
            onChangeState={onFlipState}
            onFlip={(e) => setLeaf(e.data)}
          >
            {leaves.map((d, i) => (
              <BookPage
                key={i}
                data={d}
                spine={i === 0 || i === total - 1 ? "both" : i % 2 === 1 ? "r" : "l"}
                images={images}
              />
            ))}
          </HTMLFlipBook>
        </div>

        {hint && mode === "demo" && (
          <div className="hint-float pointer-events-none absolute bottom-4 left-1/2 z-20 rounded-full border border-[#e3d8bf] bg-white/80 px-4 py-1.5 text-xs text-[#7a6647] shadow-sm">
            💡 Trage de colțul paginii, dă clic sau swipe pentru a răsfoi
          </div>
        )}

        {error && (
          <div className="absolute bottom-4 left-1/2 z-30 flex -translate-x-1/2 items-center gap-2 rounded-full bg-red-900/90 px-4 py-1.5 text-xs text-red-50 shadow">
            {error}
            <button onClick={() => setError(null)} className="opacity-70 hover:opacity-100">
              ✕
            </button>
          </div>
        )}

        {dragOver && (
          <div className="absolute inset-3 z-30 flex items-center justify-center rounded-2xl border-2 border-dashed border-[#b08640] bg-[#faf6ec]/80 backdrop-blur-sm">
            <div className="text-center text-[#7a6647]">
              <IconUpload className="mx-auto mb-2 h-8 w-8" />
              <p className="text-sm font-medium">Renunță fișierul PDF pentru a-l deschide</p>
            </div>
          </div>
        )}

        {busy && (
          <div className="absolute inset-0 z-30 grid place-items-center bg-[#3d2f1e]/30 backdrop-blur-sm">
            <div className="flex items-center gap-3 rounded-full bg-white/90 px-5 py-3 shadow-lg">
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-[#b08640] border-t-transparent" />
              <span className="text-sm text-[#6b5636]">Se deschide cartea…</span>
            </div>
          </div>
        )}
      </main>

      <footer className="z-20 hidden shrink-0 items-center justify-center pb-3 text-xs text-[#a08c66] sm:flex">
        Folio demo · react-pageflip + PDF.js · ← / → pentru răsfoire
      </footer>
    </div>
  );
}

/* ---------- pictograme ---------- */

function SvgIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...props}
    />
  );
}

function IconBook(props: React.SVGProps<SVGSVGElement>) {
  return (
    <SvgIcon {...props}>
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </SvgIcon>
  );
}

function IconChevronLeft(props: React.SVGProps<SVGSVGElement>) {
  return (
    <SvgIcon {...props}>
      <path d="m15 18-6-6 6-6" />
    </SvgIcon>
  );
}

function IconChevronRight(props: React.SVGProps<SVGSVGElement>) {
  return (
    <SvgIcon {...props}>
      <path d="m9 18 6-6-6-6" />
    </SvgIcon>
  );
}

function IconUpload(props: React.SVGProps<SVGSVGElement>) {
  return (
    <SvgIcon {...props}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" x2="12" y1="3" y2="15" />
    </SvgIcon>
  );
}

function IconExpand(props: React.SVGProps<SVGSVGElement>) {
  return (
    <SvgIcon {...props}>
      <path d="M8 3H5a2 2 0 0 0-2 2v3" />
      <path d="M21 8V5a2 2 0 0 0-2-2h-3" />
      <path d="M3 16v3a2 2 0 0 0 2 2h3" />
      <path d="M16 21h3a2 2 0 0 0 2-2v-3" />
    </SvgIcon>
  );
}

function IconShrink(props: React.SVGProps<SVGSVGElement>) {
  return (
    <SvgIcon {...props}>
      <path d="M8 3v3a2 2 0 0 1-2 2H3" />
      <path d="M21 8h-3a2 2 0 0 1-2-2V3" />
      <path d="M3 16h3a2 2 0 0 1 2 2v3" />
      <path d="M16 21v-3a2 2 0 0 1 2-2h3" />
    </SvgIcon>
  );
}
