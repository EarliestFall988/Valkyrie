import {
  CloudArrowUpIcon,
  PlusIcon,
  XMarkIcon,
  TrashIcon,
  ArrowDownCircleIcon,
  ArrowUpCircleIcon,
  IdentificationIcon,
  ArrowDownOnSquareIcon,
  ArrowUpOnSquareIcon,
} from "@heroicons/react/24/outline";
import {
  FC,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
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
import { ResultNode } from "~/nodes/resultNode";
import { VariableNode } from "~/nodes/variableNode";
import * as Dialog from "@radix-ui/react-dialog";
import { useAutoAnimate } from "@formkit/auto-animate/react";

const initialNodes: Node[] = [
  // {
  //   id: "1",
  //   data: { label: "Hello" },
  //   position: { x: 0, y: 0 },
  //   type: "input",
  // },
  // {
  //   id: "2",
  //   data: { label: "World" },
  //   position: { x: 100, y: 100 },
  // },
  // {
  //   id: "3",
  //   data: { label: "Hi Mom" },
  //   position: { x: 200, y: 200 },
  //   type: "output",
  // },
] as Node[];

const initialEdges: Edge[] = [
  // { id: "1-2", source: "1", target: "2", label: "to the", type: "smoothstep" },
  // { id: "2-3", source: "2", target: "3", type: "smoothstep" },
] as Edge[];

const panOnDrag = [1];

let id = 0;
const getId = () => `dndnode_${id++}`;

export const Flow = () => {
  const nodeTypes = useMemo(
    () => ({ variable: VariableNode, result: ResultNode }),
    []
  );

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

      let nodeType = "variable";
      let variableType = "text";

      if (type.startsWith("variable")) {
        nodeType = "variable";
        variableType = type.split("-")[1] ?? "text";
      }

      if (type.startsWith("result")) {
        nodeType = "result";
        variableType = type.split("-")[1] ?? "text";
      }

      const position = reactFlowInstance?.project({
        x: event.clientX - (reactFlowBounds?.left ?? 0),
        y: event.clientY - (reactFlowBounds?.top ?? 0),
      });

      if (nodeType === "variable") {
        const newNode = {
          id: getId(),
          type: nodeType,
          position: {
            x: position?.x ?? 0,
            y: position?.y ?? 0,
          },
          data: { label: `${type} node`, variableType },
        };

        setNodes((nds) => nds.concat(newNode));
      }

      if (nodeType === "result") {
        const newNode = {
          id: getId(),
          type: nodeType,
          position: {
            x: position?.x ?? 0,
            y: position?.y ?? 0,
          },
          data: { label: `${type} node`, variableType },
        };

        setNodes((nds) => nds.concat(newNode));
      }
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
          nodeTypes={nodeTypes}
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
  const onDragStart = (
    event: React.DragEvent<HTMLDivElement>,
    nodeType: string
  ) => {
    event.dataTransfer.setData("application/reactflow", nodeType);
    event.dataTransfer.effectAllowed = "move";
  };

  return (
    <div className="fixed right-0 top-20 z-10 flex h-[80vh] w-1/5 select-none flex-col gap-1 rounded-lg bg-neutral-700 p-2">
      <div className="rounded-b rounded-t border-x border-neutral-600">
        <p className="w-full rounded-t bg-neutral-600 text-center">Storage</p>
        <div className="flex flex-col">
          <div
            draggable={true}
            onDragStart={(event) => onDragStart(event, "variable-integer")}
            className="w-full border-b border-neutral-600 p-2 font-semibold"
          >
            123
          </div>
          <div
            draggable={true}
            onDragStart={(event) => onDragStart(event, "variable-decimal")}
            className="w-full border-b border-neutral-600 p-2 font-semibold"
          >
            1.2
          </div>
          <div
            draggable={true}
            onDragStart={(event) => onDragStart(event, "variable-text")}
            className="w-full border-b border-neutral-600 p-2 font-semibold"
          >
            Text
          </div>
          <div
            draggable={true}
            onDragStart={(event) => onDragStart(event, "variable-boolean")}
            className="w-full border-b border-neutral-600 p-2 font-semibold"
          >
            y/n
          </div>
        </div>
      </div>
      <div className="rounded-b rounded-t border-x border-neutral-600 ">
        <p className="w-full rounded-t bg-neutral-600 text-center">Output</p>
        <div
          draggable={true}
          onDragStart={(event) => onDragStart(event, "result-integer")}
          className="w-full border-b border-neutral-600 p-2 font-semibold"
        >
          123
        </div>
        <div
          draggable={true}
          onDragStart={(event) => onDragStart(event, "result-decimal")}
          className="w-full border-b border-neutral-600 p-2 font-semibold"
        >
          1.2
        </div>
        <div
          draggable={true}
          onDragStart={(event) => onDragStart(event, "result-text")}
          className="w-full border-b border-neutral-600 p-2 font-semibold"
        >
          Text
        </div>
        <div
          draggable={true}
          onDragStart={(event) => onDragStart(event, "result-boolean")}
          className="w-full border-b border-neutral-600 p-2 font-semibold"
        >
          y/n
        </div>
      </div>
      <div className="rounded-b rounded-t border-x border-neutral-600 ">
        <p className="w-full rounded-t bg-neutral-600 text-center">Transform</p>
        <div className="w-full  border-b border-neutral-600 p-1 font-semibold">
          <NewFunctionDialog>
            <div className="flex w-full items-center justify-start gap-2 rounded bg-gray-600 p-1 outline-none transition duration-100 hover:cursor-pointer hover:bg-gray-500 focus:bg-gray-500">
              <PlusIcon className="h-4 w-4" />
              <p>New Function</p>
            </div>
          </NewFunctionDialog>
        </div>
      </div>
    </div>
  );
};

type paramterType = {
  name: string;
  type: "text" | "integer" | "decimal" | "boolean";
  io: "input" | "output";
};

const NewFunctionDialog: FC<{ children: ReactNode }> = ({ children }) => {
  const [functionName, setFunctionName] = useState("");
  const [functionDetails, setFunctionDetails] = useState("");
  const [params, setParams] = useState<paramterType[]>([]);
  const [OutParams, setOutParams] = useState<paramterType[]>([]);

  const [animationParent] = useAutoAnimate();

  const newParameter = useCallback(() => {
    setParams((params) => [...params, { name: "", type: "text", io: "input" }]);
  }, []);

  const newOutParameter = useCallback(() => {
    setOutParams((params) => [
      ...params,
      { name: "", type: "text", io: "output" },
    ]);
  }, []);

  const deleteParameter = useCallback((id: number) => {
    setParams((params) => params.filter((p, index) => index !== id));
  }, []);

  const deleteOutParameter = useCallback((id: number) => {
    setOutParams((params) => params.filter((p, index) => index !== id));
  }, []);

  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>{children}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="data-[state=open]:animate-overlayShow fixed inset-0 top-0 z-30 backdrop-blur-lg md:bg-black/20" />
        <Dialog.Content className="data-[state=open]:animate-contentShow fixed left-[50%] top-[50%] z-30 max-h-[85vh] w-[90vw] max-w-[500px] translate-x-[-50%] translate-y-[-50%] rounded-[6px] border border-neutral-700 bg-black p-[25px] focus:outline-none">
          <div className="pb-5">
            <Dialog.Title className="flex select-none items-center justify-start gap-2 text-3xl font-semibold text-zinc-200">
              New Function
            </Dialog.Title>
            <Dialog.Description className="text-md select-none tracking-tight text-neutral-300">
              Create a new function here. Give it a name, and create parameters
              for it.{" "}
              <b>
                Be sure the name matches the function name in the code and that
                the parameter names also match.
              </b>
            </Dialog.Description>
          </div>
          <div className="border-b border-neutral-700 py-1">
            <div className="flex items-center gap-2 text-2xl font-semibold">
              <IdentificationIcon className="h-6 w-6 translate-y-[3px]" />
              <p>Identity</p>
            </div>
            <div className="p-1">
              <p className="font-lg font-semibold text-neutral-200">Name</p>
              <input
                type="text"
                className="w-full rounded bg-neutral-800 p-1 text-neutral-200 outline-none ring-2 ring-neutral-700 transition duration-100 hover:ring hover:ring-neutral-700 focus:ring-purple-700"
                value={functionName}
                onChange={(e) => {
                  setFunctionName(e.target.value);
                }}
                placeholder="Be sure to name the function exactly as it is in the code..."
                autoFocus
              />
            </div>
            <div className="p-1">
              <p className="font-lg font-semibold text-neutral-200">
                Description
              </p>
              <textarea
                className="w-full rounded bg-neutral-800 p-1 text-neutral-200 outline-none ring-2 ring-neutral-700 transition duration-100 hover:ring hover:ring-neutral-700 focus:ring-purple-700"
                value={functionDetails}
                onChange={(e) => {
                  setFunctionDetails(e.target.value);
                }}
                placeholder="Details to help you remember what this function does..."
              />
            </div>
          </div>
          <div className="max-h-[30vh] overflow-auto border-b border-neutral-700 py-1">
            <div className="flex items-center gap-2 text-2xl font-semibold">
              <ArrowDownOnSquareIcon className="h-6 w-6 translate-y-[3px]" />
              <p>Input Parameters</p>
            </div>
            <div ref={animationParent} className="p-1">
              {params.map((p, index) => (
                <Parameter
                  key={index}
                  paramId={index.toString()}
                  deleteParameter={deleteParameter}
                  name={p.name}
                  type={p.type}
                  io={p.io}
                />
              ))}
            </div>
            <button
              onClick={newParameter}
              className="flex w-full items-center justify-center gap-2 rounded bg-neutral-700 p-1"
            >
              <PlusIcon className="h-4 w-4" />
              <p>Add Parameter</p>
            </button>
          </div>
          <div className="max-h-[30vh] overflow-auto border-b border-neutral-700 py-1">
            <div className="flex items-center justify-start gap-2 text-2xl font-semibold">
              <ArrowUpOnSquareIcon className="h-6 w-6 translate-y-[3px]" />
              <p>Output Parameters</p>
            </div>
            <div ref={animationParent} className="p-1">
              {OutParams.map((p, index) => (
                <Parameter
                  key={index}
                  paramId={index.toString()}
                  deleteParameter={deleteOutParameter}
                  name={p.name}
                  type={p.type}
                  io={p.io}
                />
              ))}
            </div>
            <button
              onClick={newOutParameter}
              className="flex w-full items-center justify-center gap-2 rounded bg-neutral-700 p-1"
            >
              <PlusIcon className="h-4 w-4" />
              <p>Add Parameter</p>
            </button>
          </div>
          <div className="flex items-center justify-end gap-2 pt-5">
            <Dialog.Close asChild>
              <div className="flex w-32 items-center justify-center gap-2 rounded bg-neutral-700 p-2 font-semibold outline-none hover:bg-neutral-600 focus:bg-neutral-600">
                <XMarkIcon className="h-5 w-5" />
                <p>Cancel</p>
              </div>
            </Dialog.Close>
            <Dialog.Close asChild>
              <div className="flex w-32 items-center justify-center gap-2 rounded bg-purple-700 p-2 font-semibold outline-none hover:bg-purple-600 focus:bg-purple-600">
                <CloudArrowUpIcon className="h-5 w-5" />
                <p>Save</p>
              </div>
            </Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export const Parameter: FC<{
  name: string;
  paramId: string;
  type: string;
  io: string;
  deleteParameter: (e: number) => void;
}> = ({ name, type, io, paramId, deleteParameter }) => {
  const [parameterName, setParameterName] = useState("");
  const [parameterType, setParameterType] = useState<
    "text" | "integer" | "decimal" | "boolean"
  >("text");

  const [parameterIO, setParameterIO] = useState<"input" | "output">("input");

  useEffect(() => {
    setParameterName(name);
    setParameterType(type as "text" | "integer" | "decimal" | "boolean");
    setParameterIO(io as "input" | "output");
  }, [name, type, io]);

  const deleteParam = () => {
    deleteParameter(parseInt(paramId));
  };

  return (
    <div className="mb-2 flex flex-col gap-2">
      <div className="flex items-center justify-center gap-2">
        <div className="w-full pb-1">
          {/* <p className="font-lg font-semibold text-neutral-200">Parameter Name</p> */}
          <input
            type="text"
            className="w-full rounded bg-neutral-800 p-1 text-neutral-200 outline-none ring-2 ring-neutral-700 transition duration-100 hover:ring hover:ring-neutral-700 focus:ring-purple-700"
            value={parameterName}
            onChange={(e) => {
              setParameterName(e.target.value);
            }}
            placeholder="Parameter Name"
          />
        </div>

        <div className="w-1/2 pb-1">
          {/* <p className="font-lg font-semibold text-neutral-200">
            Parameter Type
          </p> */}
          <select
            value={parameterType}
            onChange={(e) => {
              setParameterType(
                e.target.value as "text" | "integer" | "decimal" | "boolean"
              );
            }}
            className="w-full rounded bg-neutral-800 p-1 text-neutral-200 outline-none ring-2 ring-neutral-700 transition duration-100 hover:ring hover:ring-neutral-700 focus:ring-purple-700"
          >
            <option value="text">Text</option>
            <option value="integer">Integer</option>
            <option value="decimal">Decimal</option>
            <option value="boolean">Boolean</option>
          </select>
        </div>

        <button
          onClick={deleteParam}
          className="rounded p-1 text-red-500 hover:bg-neutral-700 focus:bg-neutral-700"
        >
          <TrashIcon className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};
