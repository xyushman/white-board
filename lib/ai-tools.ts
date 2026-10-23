export type AiTool = {
  id: string;
  name: string;
  description: string;
  color: string;
  bg: string;
  prompt: string;
};

export const AI_TOOLS: AiTool[] = [
  {
    id: "diagram",
    name: "Diagram",
    description: "Turn a concept into a clean diagram",
    color: "#60a5fa",
    bg: "#1e3a8a33",
    prompt:
      "Create a clear, well-labeled concept diagram. Use shapes for entities and arrows for relationships. Keep labels short.",
  },
  {
    id: "flowchart",
    name: "Flowchart",
    description: "Step-by-step process with decisions",
    color: "#34d399",
    bg: "#064e3b33",
    prompt:
      "Create a flowchart. Use diamonds for decision points, rectangles for steps, and arrows showing flow direction. Include Yes/No labels on decision branches.",
  },
  {
    id: "architecture",
    name: "Architecture",
    description: "Systems and component architecture",
    color: "#c084fc",
    bg: "#4c1d9533",
    prompt:
      "Create a software architecture diagram. Group related components, show data flow between services with labeled arrows, and respect a layered layout (clients, services, data).",
  },
  {
    id: "web-mockup",
    name: "Web mockup",
    description: "Desktop / web UI wireframe",
    color: "#f472b6",
    bg: "#83184333",
    prompt:
      "Create a low-fidelity desktop web wireframe mockup. Include a header/nav, hero or main content region, and representative UI blocks with short placeholder labels.",
  },
  {
    id: "mobile-mockup",
    name: "Mobile mockup",
    description: "Mobile app screen wireframe",
    color: "#fbbf24",
    bg: "#78350f33",
    prompt:
      "Create a low-fidelity mobile app screen wireframe. Use a tall phone frame with a status bar, content area, and bottom navigation. Keep labels short.",
  },
  {
    id: "mindmap",
    name: "Mind map",
    description: "Branching ideas from a central topic",
    color: "#22d3ee",
    bg: "#164e6333",
    prompt:
      "Create a mind map radiating from a central node. Use one central topic and branching sub-topics with connecting lines.",
  },
];

export const CANVAS_RULES = `You are an expert diagram generator that outputs Excalidraw-compatible scenes.

Canvas generation rules:
- The scene width should be roughly 1200-1400 pixels, height around 800 pixels.
- Do NOT exceed 25 nodes total. Prefer fewer, clearer nodes.
- Every node must have unique id, x, y, width, height, and a short label.
- Nodes must not overlap; leave at least 40px of horizontal and vertical spacing.
- Use the provided x/y as the TOP-LEFT of the node's bounding box.
- Arrows must reference existing node ids in fromId/toId.
- Keep labels under 4 words each.
- Only output the requested JSON structure.`;

export type DiagramNode = {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  shape?: "rectangle" | "ellipse" | "diamond";
};

export type DiagramConnection = {
  fromId: string;
  toId: string;
  label?: string;
};

export type DiagramResult = {
  title: string;
  width: number;
  height: number;
  nodes: DiagramNode[];
  connections: DiagramConnection[];
};

export const RESPONSE_SCHEMA = {
  type: "object",
  properties: {
    title: { type: "string" },
    width: { type: "number" },
    height: { type: "number" },
    nodes: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: { type: "string" },
          x: { type: "number" },
          y: { type: "number" },
          width: { type: "number" },
          height: { type: "number" },
          label: { type: "string" },
          shape: {
            type: "string",
            enum: ["rectangle", "ellipse", "diamond"],
          },
        },
        required: ["id", "x", "y", "width", "height", "label"],
      },
    },
    connections: {
      type: "array",
      items: {
        type: "object",
        properties: {
          fromId: { type: "string" },
          toId: { type: "string" },
          label: { type: "string" },
        },
        required: ["fromId", "toId"],
      },
    },
  },
  required: ["title", "width", "height", "nodes", "connections"],
} as const;
