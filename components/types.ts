export type LeafData =
  | { kind: "demo-cover" }
  | { kind: "demo-page"; n: number }
  | { kind: "demo-back" }
  | { kind: "pdf"; index: number };
