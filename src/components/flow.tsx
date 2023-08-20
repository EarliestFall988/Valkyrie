import { useCallback, useState } from "react";
import {
  type Edge,
  type Node,
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  ReactFlow,
  Background,
  BackgroundVariant,
  Controls,
  SelectionMode,
} from "reactflow";

const initialNodes: Node[] = [
  {
    id: "1",
    data: { label: "Hello" },
    position: { x: 0, y: 0 },
    type: "input",
  },
  {
    id: "2",
    data: { label: "World" },
    position: { x: 100, y: 100 },
  },
  {
    id: "3",
    data: { label: "Hi Mom" },
    position: { x: 200, y: 200 },
    type: "output",
  },
];

const initialEdges: Edge[] = [
  { id: "1-2", source: "1", target: "2", label: "to the", type: "smoothstep" },
  { id: "2-3", source: "2", target: "3", type: "smoothstep" },
];

const panOnDrag = [1, 2];

export const Flow = () => {
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);

  const onNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    [setNodes]
  );
  const onEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    [setEdges]
  );

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  return (
    <div style={{ height: "100%" }}>
      <ReactFlow
        nodes={nodes}
        onNodesChange={onNodesChange}
        edges={edges}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        panOnScroll
        selectionOnDrag
        panOnDrag={panOnDrag}
        selectionMode={SelectionMode.Partial}
      >
        <Background
          id="1"
          gap={10}
          color="#111"
          variant={BackgroundVariant.Lines}
        />
        <Background
          id="2"
          gap={100}
          offset={1}
          color="#222"
          variant={BackgroundVariant.Lines}
        />
        <Controls />
      </ReactFlow>
    </div>
  );
};
