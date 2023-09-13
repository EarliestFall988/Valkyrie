import {
  CloudArrowUpIcon,
  PlusIcon,
  XMarkIcon,
  TrashIcon,
  IdentificationIcon,
  ArrowDownOnSquareIcon,
  ArrowUpOnSquareIcon,
  CodeBracketIcon,
  CpuChipIcon,
} from "@heroicons/react/24/outline";
import {
  type FC,
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
  useMemo,
} from "react";
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
} from "reactflow";
import { ResultNode } from "~/nodes/resultNode";
import { VariableNode } from "~/nodes/variableNode";
import * as Dialog from "@radix-ui/react-dialog";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { api } from "~/utils/api";
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@radix-ui/react-icons";

import useFlowState from "./state";
import { shallow } from "zustand/shallow";
import { type CustomFunction, type Parameters, type Variables } from "@prisma/client";
import { CustomFunction as CustomFunctionNode } from "~/nodes/customFunctionNode";

const selector = (state: {
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

const getId = () => crypto.randomUUID();

const defaultEdgeOptions = {
  type: "smoothstep",
};

type nodeData = {
  id: string;
  nodeType: string;
  label: string;
};

export const Flow = (props: { id: string }) => {
  const nodeTypes = useMemo(
    () => ({
      variable: VariableNode,
      result: ResultNode,
      customFunction: CustomFunctionNode,
    }),
    []
  );

  const [variables, setVariables] = useState<Variables[]>([]);

  const setNewVariable = () => {
    setVariables((variables) => [
      ...variables,
      {
        id: getId(),
        name: "new variable (" + variables.length + ")",
        type: "text",
        jobId: props.id,
        description: "",
        required: true,
        default: "",
        updatedAt: new Date(),
        createdAt: new Date(),
      },
    ]);
  };

  const { data } = api.jobs.getJobById.useQuery({ id: props.id });

  useEffect(() => {
    if (data === undefined || data === null) return;
    if (variables.length > 0) return;

    setVariables(data?.variables ?? []);
  }, [data, variables]);

  const updateVar = useCallback((v: Variables) => {
    setVariables((variables) =>
      variables.map((variable) => {
        if (variable.id === v.id) {
          return v;
        }
        return variable;
      })
    );
  }, []);

  const reactFlowWrapper = useRef<HTMLDivElement | null>(null);
  const [reactFlowInstance, setReactFlowInstance] =
    useState<ReactFlowInstance | null>(null);

  const { nodes, edges, appendNode, onNodesChange, onEdgesChange, onConnect } =
    useFlowState(selector, shallow);

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

      if(data.nodeType === "customFunction")
      {
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
    console.log("flow loaded:", instance);
    setReactFlowInstance(instance);
  };

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
      <VariablesPanel
        setNewVar={setNewVariable}
        updateVar={updateVar}
        vars={variables}
      />
      <CustomFunctionSideBar id={props.id} />
    </ReactFlowProvider>
  );
};

const VariablesPanel: React.FC<{
  vars?: Variables[];
  setNewVar: () => void;
  updateVar: (v: Variables) => void;
}> = ({ vars, setNewVar, updateVar }) => {
  const [open, setOpen] = useState(true);

  const testVars = [] as Variables[];

  testVars.push({
    id: "1",
    name: "test",
    type: "text",
    jobId: "1",
    description: "test",
    required: true,
    default: "test",
    updatedAt: new Date(),
    createdAt: new Date(),
  });

  return (
    <div
      className={`fixed left-0 top-20 z-10 flex ${
        open ? "w-80" : "p-1"
      }   rounded-r border-y border-r border-neutral-700 bg-neutral-800 transition duration-100`}
    >
      {open && (
        <div className={` w-full `}>
          <button
            onClick={() => {
              setOpen(false);
            }}
            className="absolute left-1 top-1 rounded transition duration-200 hover:bg-neutral-500"
          >
            <ChevronLeftIcon className="h-6 w-6" />
          </button>
          <div className="flex flex-col">
            {(vars === undefined || vars.length === 0) && (
              <p className="w-full p-2 text-center  text-neutral-400">
                no variables yet...
              </p>
            )}
            {vars !== undefined && vars.length > 0 && (
              <>
                <div className="mt-8 max-h-[70vh] overflow-y-auto overflow-x-clip">
                  {vars?.map((v) => (
                    <VariableItem updateVar={updateVar} v={v} key={v.id} />
                  ))}
                </div>
              </>
            )}
          </div>
          <div className="p-2">
            <button
              onClick={setNewVar}
              className="focus:purple-600 flex w-full items-center justify-center rounded bg-neutral-600 p-1 text-neutral-300 transition duration-100 hover:bg-purple-600 hover:text-purple-300 focus:text-purple-300 "
            >
              <PlusIcon className="h-6 w-6" />
            </button>
          </div>
        </div>
      )}
      {!open && (
        <div>
          <button
            onClick={() => {
              setOpen(true);
            }}
            className="items-center justify-center p-1 text-neutral-200"
          >
            <CodeBracketIcon className="h-6 w-6" />
          </button>
        </div>
      )}
    </div>
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

const VariableItem: React.FC<{
  v: Variables;
  updateVar: (v: Variables) => void;
}> = ({ v, updateVar }) => {
  const [open, setOpen] = useState(false);

  const [animationParent] = useAutoAnimate();

  const [name, setName] = useState(v.name ?? "");
  const [description, setDescription] = useState(v.description ?? "");
  const [required, setRequired] = useState(v.required ?? false);
  const [type, setType] = useState(v.type ?? "text");

  useEffect(() => {
    const newVar = {
      ...v,
      name,
      description,
      required,
      type,
    };

    updateVar(newVar);
  }, [name, description, required, type, updateVar]);

  useMemo(() => {
    if (v === undefined) return;

    setName(v.name ?? "");
    setDescription(v.description ?? "");
    setRequired(v.required ?? false);
    setType(v.type ?? "text");
  }, [v]);

  const onDragStart = (event: React.DragEvent<HTMLDivElement>) => {
    const nodeData = JSON.stringify({
      id: v.id,
      nodeType: "variable",
      label: v.name,
      description: v.description,
      required: v.required,
      type: v.type,
    } as varMetaDataType);

    event.dataTransfer.setData("application/reactflow", nodeData);
    event.dataTransfer.effectAllowed = "move";
  };

  return (
    <div
      ref={animationParent}
      key={v.id}
      className="flex w-full flex-col items-start justify-center gap-1 p-2"
    >
      <button
        onClick={() => {
          setOpen(!open);
        }}
        className="w-full"
      >
        <div
          draggable={true}
          onDragStart={(event) => onDragStart(event)}
          className="flex w-full items-center justify-between rounded-2xl bg-neutral-600 p-1 px-3 pb-1 transition duration-300 hover:scale-105 hover:shadow-lg"
        >
          <div className="flex items-center justify-center gap-2">
            {v.type === "text" && <div className="rounded bg-red-500 p-1" />}
            {v.type === "integer" && (
              <div className="rounded bg-blue-500 p-1" />
            )}
            {v.type === "decimal" && (
              <div className="rounded bg-yellow-500 p-1" />
            )}
            {v.type === "boolean" && (
              <div className="rounded bg-green-500 p-1" />
            )}
            <p className="w-full truncate whitespace-nowrap">
              {name}{" "}
              <span className="text-sm text-neutral-400">
                {" "}
                • {v.type !== "boolean" ? v.type : "yes/no"}
              </span>
            </p>
          </div>
          <div>
            <ChevronDownIcon
              className={`h-5 w-5 ${
                open ? "rotate-180" : ""
              } transition duration-100`}
            />
          </div>
        </div>
      </button>
      {open && (
        <div className="flex w-full flex-col gap-2 rounded border border-neutral-600 p-2 px-3">
          <div>
            <p className="font-semibold">Name</p>
            <input
              onChange={(e) => {
                setName(e.target.value);
              }}
              type="text"
              className="w-full rounded bg-neutral-800 p-1 text-neutral-200 outline-none ring-2 ring-neutral-700 transition duration-100 hover:ring hover:ring-neutral-700 focus:ring-purple-700"
              value={name}
              placeholder="Be sure to name the function exactly as it is in the code..."
            />
          </div>
          <div>
            <p className="font-semibold">Description</p>
            <input
              onChange={(e) => {
                setDescription(e.target.value);
              }}
              type="text"
              className="w-full rounded bg-neutral-800 p-1 text-neutral-200 outline-none ring-2 ring-neutral-700 transition duration-100 hover:ring hover:ring-neutral-700 focus:ring-purple-700"
              value={description}
              placeholder="Be sure to name the function exactly as it is in the code..."
            />
          </div>
          <div>
            <p className="font-semibold">Required?</p>
            <select
              onChange={(e) => {
                setRequired(e.target.value === "true");
              }}
              className="w-full rounded bg-neutral-800 p-1 text-neutral-200 outline-none ring-2 ring-neutral-700 transition duration-100 hover:ring hover:ring-neutral-700 focus:ring-purple-700"
              value={required ? "true" : "false"}
              placeholder="Be sure to name the function exactly as it is in the code..."
            >
              <option value={"true"}>Required</option>
              <option value={"false"}>Optional</option>
            </select>
          </div>
          <div>
            <p className="font-semibold">Type</p>
            <select
              onChange={(e) => {
                setType(e.target.value);
              }}
              className="w-full rounded bg-neutral-800 p-1 text-neutral-200 outline-none ring-2 ring-neutral-700 transition duration-100 hover:ring hover:ring-neutral-700 focus:ring-purple-700"
              value={type}
              placeholder="Be sure to name the function exactly as it is in the code..."
            >
              <option value={"text"}>Text</option>
              <option value={"integer"}>Integer</option>
              <option value={"decimal"}>decimal</option>
              <option value={"boolean"}>yes/no</option>
            </select>
          </div>
          <div className="flex w-full flex-col gap-2 rounded border border-dashed border-red-900 p-2">
            <p className="font-semibold">Danger Zone</p>
            <button className="flex items-center justify-center gap-2 rounded bg-red-700 p-1 transition duration-100 hover:bg-red-600">
              <TrashIcon className="h-6 w-6" />
              <p className="font-semibold">Delete</p>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export type functionMetaData = nodeData & {
  parameters: parameterType[];
};

const CustomFunctionSideBar = (props: { id: string }) => {
  const onDragStart = (
    event: React.DragEvent<HTMLDivElement>,
    f: CustomFunction & {parameters: Parameters[] },
  ) => {

    const data = JSON.stringify({
      id: f.id,
      nodeType: "customFunction",
      label: f.name,
      description: f.description,
      parameters: f.parameters
    });


    event.dataTransfer.setData("application/reactflow", data);
    event.dataTransfer.effectAllowed = "move";
  };

  const { data: customFunctions } = api.functions.getFunctionsByJobId.useQuery({
    jobId: props.id,
  });

  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="fixed right-0 top-20 z-10 flex select-none flex-col gap-1 overflow-auto rounded-l border-y border-l border-neutral-700 bg-neutral-800 transition duration-100">
        <div className="flex items-center justify-end w-full">
          <button
            onClick={() => {
              setOpen(!open);
            }}
            className="p-2"
          >
            {!open && <CpuChipIcon className="h-6 w-6" />}
            {open && (
              <div>
                <ChevronRightIcon className="h-6 w-6" />
              </div>
            )}
          </button>
        </div>
        {open && (
          <div className="rounded-b rounded-t border-x border-neutral-600 ">
            <p className="w-full rounded-t bg-neutral-600 text-center">
              Functions
            </p>
            <div className="w-full  border-b border-neutral-600 p-1 font-semibold">
              <NewFunctionDialog jobId={props.id}>
                <div className="flex w-full items-center justify-start gap-2 rounded bg-gray-600 p-1 outline-none transition duration-100 hover:cursor-pointer hover:bg-gray-500 focus:bg-gray-500">
                  <PlusIcon className="h-4 w-4" />
                  <p>New Function</p>
                </div>
              </NewFunctionDialog>
            </div>
            {customFunctions?.map((f) => (
              <div
                key={f.id}
                draggable={true}
                onDragStart={(event) =>
                  onDragStart(event, f)
                }
                className="flex w-full items-center justify-between gap-2 border-b border-neutral-600 p-2"
              >
                <div className="flex items-center justify-center gap-2">
                  <CodeBracketIcon className="h-6 w-6" />
                  <div>
                    <p className="font-semibold">{f.name}</p>
                    <p>{f.description}</p>
                  </div>
                </div>
                <div className="">{f.parameters.length} param(s)</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

type parameterType = {
  name: string;
  type: "text" | "integer" | "decimal" | "boolean";
  io: "input" | "output";
};

const NewFunctionDialog: FC<{ children: ReactNode; jobId: string }> = ({
  children,
  jobId,
}) => {
  const [functionName, setFunctionName] = useState("");
  const [functionDetails, setFunctionDetails] = useState("");
  const [params, setParams] = useState<parameterType[]>([]);
  const [OutParams, setOutParams] = useState<parameterType[]>([]);

  const [animationParent] = useAutoAnimate();

  const newParameter = () => {
    setParams((params) => [...params, { name: "", type: "text", io: "input" }]);
  };

  const newOutParameter = () => {
    setOutParams((params) => [
      ...params,
      { name: "", type: "text", io: "output" },
    ]);
  };

  const deleteParameter = useCallback((id: number) => {
    setParams((params) => params.filter((p, index) => index !== id));
  }, []);

  const deleteOutParameter = useCallback((id: number) => {
    setOutParams((params) => params.filter((p, index) => index !== id));
  }, []);

  const context = api.useContext().functions;

  const { mutate } = api.functions.createFunction.useMutation({
    onSuccess: () => {
      console.log("Function Created");
      void context.invalidate();
    },
    onError: () => {
      console.log("Error Creating Function");
    },
  });

  const SaveFunction = useCallback(() => {
    if (jobId === undefined || jobId === null || jobId === "") {
      console.log("No Job ID");
      return;
    }

    const parameters = params.map((p) => ({
      name: p.name,
      type: p.type,
      io: p.io,
    }));

    parameters.push(
      ...OutParams.map((p) => ({
        name: p.name,
        type: p.type,
        io: p.io,
      }))
    );

    mutate({
      name: functionName,
      description: functionDetails,
      params: parameters.map((p) => ({
        name: p.name,
        type: p.type,
        io: p.io,
      })),
      jobId: jobId,
    });
  }, [functionDetails, functionName, jobId, mutate, params, OutParams]);

  const UpdateParameter = useCallback(
    (
      id: number,
      name: string,
      type: "text" | "integer" | "decimal" | "boolean",
      io: string
    ) => {
      console.log("updating parameter");

      if (io === "input" && id < params.length) {
        setParams((params) =>
          params.map((p, index) => {
            if (index === id) {
              return { name, type, io };
            }
            return p;
          })
        );
      }

      if (io === "output" && id < OutParams.length) {
        setOutParams((params) =>
          params.map((p, index) => {
            if (index === id) {
              return { name, type, io };
            }
            return p;
          })
        );
      }
    },
    [OutParams.length, params.length]
  );

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
                  textOut={(id, name, type, io) => {
                    UpdateParameter(id, name, type, io);
                  }}
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
                  textOut={(id, name, type, io) => {
                    UpdateParameter(id, name, type, io);
                  }}
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
              <button
                onClick={() => {
                  SaveFunction();
                }}
                className="flex w-32 items-center justify-center gap-2 rounded bg-purple-700 p-2 font-semibold outline-none hover:bg-purple-600 focus:bg-purple-600"
              >
                <CloudArrowUpIcon className="h-5 w-5" />
                <p>Save</p>
              </button>
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
  textOut: (
    id: number,
    name: string,
    type: "text" | "integer" | "decimal" | "boolean",
    io: string
  ) => void;
  deleteParameter: (e: number) => void;
}> = ({ name, type, io, paramId, deleteParameter, textOut }) => {
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

  useEffect(() => {
    textOut(parseInt(paramId), parameterName, parameterType, parameterIO);
  }, [paramId, parameterName, parameterType, parameterIO, textOut]);

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
