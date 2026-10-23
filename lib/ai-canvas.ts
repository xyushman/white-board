"use client";

import type { ExcalidrawElement } from "@excalidraw/excalidraw/element/types";
import type { DiagramResult, DiagramNode } from "@/lib/ai-tools";

type AnyElement = Record<string, unknown>;

const rand = () => Math.floor(Math.random() * 0xffffffff);

function baseElement(
  type: string,
  x: number,
  y: number,
  width: number,
  height: number,
): AnyElement {
  return {
    id: crypto.randomUUID(),
    type,
    x,
    y,
    width,
    height,
    angle: 0,
    strokeColor: "#e5e7eb",
    backgroundColor: "transparent",
    fillStyle: "solid",
    strokeWidth: 2,
    strokeStyle: "solid",
    roughness: 1,
    opacity: 100,
    groupIds: [],
    frameId: null,
    roundness: type === "rectangle" ? { type: 3 } : null,
    seed: rand(),
    version: 1,
    versionNonce: rand(),
    isDeleted: false,
    boundElements: null,
    updated: Date.now(),
    link: null,
    locked: false,
  };
}

function makeText(
  containerId: string,
  node: DiagramNode,
  fontSize = 16,
): AnyElement {
  return {
    id: crypto.randomUUID(),
    type: "text",
    x: node.x + 8,
    y: node.y + node.height / 2 - fontSize / 2,
    width: Math.max(node.width - 16, 20),
    height: fontSize * 1.25,
    angle: 0,
    strokeColor: "#f4f4f5",
    backgroundColor: "transparent",
    fillStyle: "solid",
    strokeWidth: 1,
    strokeStyle: "solid",
    roughness: 1,
    opacity: 100,
    groupIds: [],
    frameId: null,
    roundness: null,
    seed: rand(),
    version: 1,
    versionNonce: rand(),
    isDeleted: false,
    boundElements: null,
    updated: Date.now(),
    link: null,
    locked: false,
    text: node.label,
    fontSize,
    fontFamily: 1,
    textAlign: "center",
    verticalAlign: "middle",
    containerId,
    originalText: node.label,
    lineHeight: 1.25,
    baseline: fontSize,
  };
}

function makeNode(node: DiagramNode): AnyElement[] {
  const type =
    node.shape === "ellipse"
      ? "ellipse"
      : node.shape === "diamond"
        ? "diamond"
        : "rectangle";
  const container = baseElement(type, node.x, node.y, node.width, node.height);
  const text = makeText(container.id as string, node);
  container.boundElements = [{ id: text.id, type: "text" }];
  return [container, text];
}

function makeArrow(
  from: DiagramNode,
  to: DiagramNode,
  label?: string,
): AnyElement[] {
  const start = { x: from.x + from.width / 2, y: from.y + from.height / 2 };
  const end = { x: to.x + to.width / 2, y: to.y + to.height / 2 };
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const len = Math.max(Math.hypot(dx, dy), 1);
  const ux = dx / len;
  const uy = dy / len;

  const sx = start.x + ux * (from.width / 2);
  const sy = start.y + uy * (from.height / 2);
  const ex = end.x - ux * (to.width / 2);
  const ey = end.y - uy * (to.height / 2);

  const arrow: AnyElement = {
    ...baseElement("arrow", sx, sy, Math.abs(ex - sx), Math.abs(ey - sy)),
    strokeColor: "#71717a",
    strokeWidth: 2,
    roundness: { type: 2 },
    points: [
      [0, 0],
      [ex - sx, ey - sy],
    ],
    lastCommittedPoint: null,
    startBinding: { elementId: from.id, focus: 0, gap: 8 },
    endBinding: { elementId: to.id, focus: 0, gap: 8 },
    startArrowhead: null,
    endArrowhead: "arrow",
    elbowed: false,
  };

  const elements: AnyElement[] = [arrow];

  if (label) {
    elements.push({
      id: crypto.randomUUID(),
      type: "text",
      x: (sx + ex) / 2 - 30,
      y: (sy + ey) / 2 - 10,
      width: 60,
      height: 20,
      angle: 0,
      strokeColor: "#a1a1aa",
      backgroundColor: "transparent",
      fillStyle: "solid",
      strokeWidth: 1,
      strokeStyle: "solid",
      roughness: 1,
      opacity: 100,
      groupIds: [],
      frameId: null,
      roundness: null,
      seed: rand(),
      version: 1,
      versionNonce: rand(),
      isDeleted: false,
      boundElements: null,
      updated: Date.now(),
      link: null,
      locked: false,
      text: label,
      fontSize: 13,
      fontFamily: 1,
      textAlign: "center",
      verticalAlign: "middle",
      containerId: null,
      originalText: label,
      lineHeight: 1.25,
      baseline: 13,
    });
  }

  return elements;
}

export function diagramToElements(
  diagram: DiagramResult,
  originX = 0,
  originY = 0,
): ExcalidrawElement[] {
  const offsetNodes = diagram.nodes.map((n) => ({
    ...n,
    x: n.x + originX,
    y: n.y + originY,
  }));
  const byId = new Map(offsetNodes.map((n) => [n.id, n]));

  const elements: AnyElement[] = [];
  for (const node of offsetNodes) elements.push(...makeNode(node));
  for (const conn of diagram.connections ?? []) {
    const from = byId.get(conn.fromId);
    const to = byId.get(conn.toId);
    if (from && to) elements.push(...makeArrow(from, to, conn.label));
  }

  return elements as unknown as ExcalidrawElement[];
}

export const PLACEHOLDER_IDS = {
  container: "ai-placeholder-container",
  title: "ai-placeholder-title",
  subtitle: "ai-placeholder-subtitle",
  s1: "ai-placeholder-s1",
  s2: "ai-placeholder-s2",
  s3: "ai-placeholder-s3",
};

export function buildPlaceholderElements(
  originX: number,
  originY: number,
): AnyElement[] {
  const width = 360;
  const height = 220;
  const container: AnyElement = {
    ...baseElement("rectangle", originX, originY, width, height),
    id: PLACEHOLDER_IDS.container,
    strokeColor: "#52525b",
    backgroundColor: "#18181b",
    strokeStyle: "dashed",
    roundness: { type: 3 },
  };

  const text = (
    id: string,
    label: string,
    x: number,
    y: number,
    fontSize: number,
    color: string,
  ): AnyElement => ({
    id,
    type: "text",
    x,
    y,
    width: width - 48,
    height: fontSize * 1.3,
    angle: 0,
    strokeColor: color,
    backgroundColor: "transparent",
    fillStyle: "solid",
    strokeWidth: 1,
    strokeStyle: "solid",
    roughness: 1,
    opacity: 100,
    groupIds: [],
    frameId: null,
    roundness: null,
    seed: rand(),
    version: 1,
    versionNonce: rand(),
    isDeleted: false,
    boundElements: null,
    updated: Date.now(),
    link: null,
    locked: false,
    text: label,
    fontSize,
    fontFamily: 1,
    textAlign: "left",
    verticalAlign: "top",
    containerId: null,
    originalText: label,
    lineHeight: 1.25,
    baseline: fontSize,
  });

  const skeleton = (id: string, y: number, w: number): AnyElement => ({
    ...baseElement("rectangle", originX + 24, y, w, 14),
    id,
    strokeColor: "transparent",
    backgroundColor: "#3f3f46",
    roundness: { type: 3 },
  });

  return [
    container,
    text(
      PLACEHOLDER_IDS.title,
      "Generating your diagram…",
      originX + 24,
      originY + 24,
      18,
      "#e4e4e7",
    ),
    text(
      PLACEHOLDER_IDS.subtitle,
      "AI is drafting the layout. This takes a few seconds.",
      originX + 24,
      originY + 52,
      13,
      "#a1a1aa",
    ),
    skeleton(PLACEHOLDER_IDS.s1, originY + 96, 250),
    skeleton(PLACEHOLDER_IDS.s2, originY + 124, 210),
    skeleton(PLACEHOLDER_IDS.s3, originY + 152, 270),
  ];
}

export function findEmptyCanvasPosition(
  elements: readonly AnyElement[],
): { x: number; y: number } {
  const live = elements.filter((el) => !el.isDeleted);
  if (live.length === 0) return { x: 100, y: 100 };

  let maxRight = -Infinity;
  let minTop = Infinity;
  for (const el of live) {
    const x = Number(el.x ?? 0);
    const y = Number(el.y ?? 0);
    const w = Number(el.width ?? 0);
    maxRight = Math.max(maxRight, x + w);
    minTop = Math.min(minTop, y);
  }
  return { x: maxRight + 150, y: minTop };
}
