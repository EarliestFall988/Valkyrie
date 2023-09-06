import {
  type OnNodesChange,
  type Edge,
  type Node,
  type OnEdgesChange,
  type OnConnect,
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  type NodeChange,
  type EdgeChange,
  type Connection,
} from "reactflow";
import { create } from "zustand";

interface ReactFlowInstanceState {
  nodes: Node[];
  edges: Edge[];
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  appendNode: (node: Node) => void;
}

const useFlowState = create<ReactFlowInstanceState>((set, get) => ({
  nodes: [] as Node[],
  edges: [] as Edge[],

  onNodesChange: (changes: NodeChange[]) => {
    set({
      nodes: applyNodeChanges(changes, get().nodes),
    });
  },
  onEdgesChange: (changes: EdgeChange[]) => {
    set({
      edges: applyEdgeChanges(changes, get().edges),
    });
  },
  onConnect: (connection: Connection) => {
    set({
      edges: addEdge(connection, get().edges),
    });
  },
  appendNode: (node: Node) => {
    set({
      nodes: [...get().nodes, node],
    });
  },
}));

export default useFlowState;
