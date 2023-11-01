import { ArrowPathIcon } from "@heroicons/react/24/outline";
import { useCallback, useRef, useState, useMemo, useEffect } from "react";
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Controls,
  SelectionMode,
  ReactFlowProvider,
  type ReactFlowInstance,
  type OnNodesChange,
  type OnEdgesChange,
  type OnConnect,
  type Edge,
  type Node,
  Connection,
} from "reactflow";
import { ResultNode } from "~/nodes/resultNode";
import { VariableNode } from "~/nodes/variableNode";

import useFlowState from "./state";
import { shallow } from "zustand/shallow";
import {} from "@prisma/client";
import { CustomFunction as CustomFunctionNode } from "~/nodes/customFunctionNode";
import type { parameterType } from "~/pages/jobs/[id]/instructions";

export const selector = (state: {
  nodes: Node[];
  edges: Edge[];
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  appendNode: (node: Node) => void;
}) => ({
  nodes: state.nodes,
  edges: state.edges,
  onNodesChange: state.onNodesChange,
  onEdgesChange: state.onEdgesChange,
  onConnect: state.onConnect,
  appendNode: state.appendNode,
});

// const initialNodes: Node[] = [
// ] as Node[];

// const initialEdges: Edge[] = [
//   // { id: "1-2", source: "1", target: "2", label: "to the", type: "smoothstep" },
//   // { id: "2-3", source: "2", target: "3", type: "smoothstep" },
// ] as Edge[];

const panOnDrag = [1];

export const getId = () => crypto.randomUUID();

const defaultEdgeOptions = {
  type: "smoothstep",
};

type nodeData = {
  id: string;
  nodeType: string;
  label: string;
};

export const Flow: React.FC<{
  id: string;
  loadingData: boolean;
  flowData: string;
}> = ({ id, loadingData, flowData }) => {
  const nodeTypes = useMemo(
    () => ({
      variable: VariableNode,
      result: ResultNode,
      customFunction: CustomFunctionNode,
    }),
    []
  );

  const { nodes, edges, appendNode, onNodesChange, onEdgesChange, onConnect } =
    useFlowState(selector, shallow);

  useEffect(() => {
    if (flowData === "" || flowData === null || flowData === undefined) return;

    const newData = JSON.parse(flowData) as { nodes: Node[]; edges: Edge[] };
    // console.log("react flow data result", newData);

    newData.nodes.forEach((node) => {
      appendNode(node);
    });

    const connection = newData.edges.map((e) => {
      return {
        source: e.source,
        target: e.target,
        sourceHandle: e.sourceHandle,
        targetHandle: e.targetHandle,
      } as Connection;
    });

    connection.forEach((conn) => {
      onConnect(conn);
    });
  }, [flowData, appendNode, onConnect]);

  const reactFlowWrapper = useRef<HTMLDivElement | null>(null);
  const [reactFlowInstance, setReactFlowInstance] =
    useState<ReactFlowInstance | null>(null);

  const onDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();

      const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect();
      const rawData = event.dataTransfer.getData("application/reactflow");

      // check if the dropped element is valid
      if (!rawData || typeof rawData !== "string") {
        return;
      }

      const data = JSON.parse(rawData) as nodeData;

      // console.log(data);

      const position = reactFlowInstance?.project({
        x: event.clientX - (reactFlowBounds?.left ?? 0),
        y: event.clientY - (reactFlowBounds?.top ?? 0),
      });

      if (data.nodeType === "variable") {
        const newNode = {
          id: getId(),
          type: data.nodeType,
          position: {
            x: position?.x ?? 0,
            y: position?.y ?? 0,
          },
          data: JSON.parse(rawData) as varMetaDataType,
        };

        // setNodes((nds) => nds.concat(newNode));
        appendNode(newNode);
      }

      if (data.nodeType === "customFunction") {
        const newNode = {
          id: getId(),
          type: data.nodeType,
          position: {
            x: position?.x ?? 0,
            y: position?.y ?? 0,
          },
          data: JSON.parse(rawData) as functionMetaData,
        };

        // setNodes((nds) => nds.concat(newNode));
        appendNode(newNode);
      }
    },
    [reactFlowInstance, appendNode]
  );

  const onInit = (instance: ReactFlowInstance) => {
    // console.log("flow loaded:", instance);
    setReactFlowInstance(instance);
  };

  if (loadingData) {
    return (
      <div className="flex h-screen w-screen items-center justify-center gap-2 font-mono text-2xl font-semibold text-purple-600">
        <ArrowPathIcon className="h-6 w-6 animate-spin" />
        Loading...
      </div>
    );
  }

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
          onInit={onInit}
          selectionMode={SelectionMode.Partial}
          fitView
          onDragOver={onDragOver}
          onDrop={onDrop}
          nodeTypes={nodeTypes}
          defaultEdgeOptions={defaultEdgeOptions}
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
    </ReactFlowProvider>
  );
};

export type varMetaDataType = {
  id: string;
  nodeType: string;
  label: string;
  description: string;
  required: boolean;
  type: string;
};

export type functionMetaData = nodeData & {
  parameters: parameterType[];
};
