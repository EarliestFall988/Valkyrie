import { useCallback, useRef, useState } from "react";
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
  ReactFlowProvider,
  type ReactFlowInstance,
  type NodeChange,
  type EdgeChange,
  type Connection,
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

const panOnDrag = [1];

let id = 0;
const getId = () => `dndnode_${id++}`;

export const Flow = () => {
  const reactFlowWrapper = useRef<HTMLDivElement | null>(null);
  const [reactFlowInstance, setReactFlowInstance] =
    useState<ReactFlowInstance | null>(null);

  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) =>
      setNodes((nds) => applyNodeChanges(changes, nds)),
    [setNodes]
  );
  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) =>
      setEdges((eds) => applyEdgeChanges(changes, eds)),
    [setEdges]
  );

  const onConnect = useCallback(
    (params: Edge | Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();

      const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect();
      const type = event.dataTransfer.getData("application/reactflow");

      // check if the dropped element is valid
      if (typeof type === "undefined" || !type) {
        return;
      }

      const position = reactFlowInstance?.project({
        x: event.clientX - (reactFlowBounds?.left ?? 0),
        y: event.clientY - (reactFlowBounds?.top ?? 0),
      });
      const newNode = {
        id: getId(),
        type,
        position: {
          x: position?.x ?? 0,
          y: position?.y ?? 0,
        },
        data: { label: `${type} node` },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance]
  );

  return (
    <ReactFlowProvider>
      <div ref={reactFlowWrapper} style={{ height: "100%" }}>
        <ReactFlow
          nodes={nodes}
          onNodesChange={onNodesChange}
          edges={edges}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          panOnScroll
          panOnDrag={panOnDrag}
          onInit={setReactFlowInstance}
          selectionMode={SelectionMode.Partial}
          fitView
          onDragOver={onDragOver}
          onDrop={onDrop}
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
      <SideBar />
    </ReactFlowProvider>
  );
};

const SideBar = () => {
  const onDragStart = (event: React.DragEvent<HTMLDivElement>, nodeType) => {
    event.dataTransfer.setData("application/reactflow", nodeType);
    event.dataTransfer.effectAllowed = "move";
  };

  return (
    <div className="fixed right-0 top-20 z-10 h-[80vh] w-1/5 rounded-lg bg-neutral-700 p-2">
      test
      <div
        draggable={true}
        onDragStart={(event) => onDragStart(event, "c-234")}
        className="w-full rounded bg-purple-700 p-2 font-semibold"
      >
        Drag Me
      </div>
    </div>
  );
};
