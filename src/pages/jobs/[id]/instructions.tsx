import {
  ArchiveBoxArrowDownIcon,
  ArrowDownOnSquareIcon,
  ArrowPathIcon,
  ArrowUpOnSquareIcon,
  CloudArrowUpIcon,
  CodeBracketIcon,
  CpuChipIcon,
  ExclamationTriangleIcon,
  IdentificationIcon,
  SignalIcon,
  VariableIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

// import * as Switch from "@radix-ui/react-switch";

import {
  type CustomFunction,
  type Variables,
  type Job,
  type Parameters,
  VariableType,
} from "@prisma/client";
import { type NextPage } from "next";
import { useRouter } from "next/router";

import "reactflow/dist/style.css";
import { LoadingSmall } from "~/components/loading";
import { api } from "~/utils/api";
import { Flow, getId, selector, type varMetaDataType } from "~/flow/flow";
import { BackButtonComponent } from "~/components/backButton";
import {
  type FC,
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import Link from "next/link";
import { TooltipComponent } from "~/components/tooltip";
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusIcon,
  TrashIcon,
} from "@radix-ui/react-icons";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import * as Dialog from "@radix-ui/react-dialog";
import useFlowState from "~/flow/state";
import { shallow } from "zustand/shallow";
import Head from "next/head";
import { useUser } from "@clerk/nextjs";

// import * as Popover from "@radix-ui/react-popover";

const JobPage: NextPage = () => {
  const router = useRouter();

  const { id } = router.query;

  let jobId = "";

  if (typeof id === "string") {
    jobId = id;
  }

  // const [customFunctions, setCustomFunctions] = useState<CustomFunction[]>([]);
  const [variables, setVariables] = useState<Variables[]>([]);
  const [instructionSetLoaded, setInstructionSetLoaded] = useState(false);

  const { user } = useUser();

  const {
    data: job,
    isLoading,
    isError,
  } = api.jobs.getJobById.useQuery({
    id: jobId,
  });

  const { nodes, edges } = useFlowState(selector, shallow);

  const { mutate: updateJob, isLoading: saving } =
    api.jobs.updateJob.useMutation({
      onSuccess: () => {
        console.log("success");
      },
      onError: (error) => {
        console.log("err", error);
      },
    });

  const varCtx = api.useContext().variables;

  const { mutate: upsertVariables, isLoading: savingVariables } =
    api.variables.upsertVariables.useMutation({
      onSuccess: () => {
        console.log("success");
      },
      onError: (error) => {
        console.log("err", error);
      },
    });

  const { mutate: deleteVariable, isLoading: deletingVariable } =
    api.variables.deleteVariable.useMutation({
      onSuccess: () => {
        console.log("success");

        void varCtx.invalidate();
      },
      onError: (error) => {
        console.log("err", error);
      },
    });

  useMemo(() => {
    // console.log(job);

    if (job === undefined || job === null) return;

    if (instructionSetLoaded) return;

    // console.log("job", job);

    // console.log("job data", job.data);

    // const reactflowinstance = job.data;

    // if (!reactflowinstance) return;

    // console.log("job data", reactflowinstance);

    // setCustomFunctions(job.customFunctions);
    setVariables(job.variables);
    setInstructionSetLoaded(true);
  }, [job, instructionSetLoaded]);

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

  const setNewVariable = () => {
    if (id != undefined && id != null && typeof id === "string") {
      setVariables((variables) => [
        ...variables,
        {
          id: getId(),
          name: "new variable (" + variables.length + ")",
          type: "text",
          jobId: id,
          description: "",
          required: true,
          default: "",
          updatedAt: new Date(),
          createdAt: new Date(),
          value: "",
          authorId: user?.id ?? "",
          typeId: "",
        },
      ]);
    }
  };

  const saveInstructions = useCallback(() => {
    if (job === null || job === undefined) return;

    upsertVariables(
      variables.map((variable) => {
        return {
          id: variable.id,
          name: variable.name,
          type: variable.type,
          jobId: variable.jobId,
          required: variable.required,
          value: variable.value ?? "",
        };
      })
    );

    const newData = {
      nodes,
      edges,
    };

    const final = JSON.stringify(newData);

    console.log(final);

    updateJob({
      id: jobId,
      title: job.title,
      description: job.description ?? undefined,
      jobData: final,
    });
  }, [edges, jobId, job, nodes, updateJob, upsertVariables, variables]);

  const DeleteVariable = useCallback(
    (id: string) => {
      setVariables(variables.filter((v) => v.id !== id));

      deleteVariable({
        id: id,
      });
    },
    [deleteVariable, variables]
  );

  if (typeof id !== "string") return null;

  return (
    <>
      <Head>
        <title>{`${
          job
            ? " Editing '" + job.title + "' Instruction Set - "
            : !instructionSetLoaded
            ? "Loading Instruction Set - "
            : ""
        } Valkyrie`}</title>
        <meta
          name="description"
          content="Pull data by building digital workers"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="h-[100vh] w-full">
        <Ribbon
          save={saveInstructions}
          job={job}
          errorLoading={isError}
          loading={isLoading}
          saving={saving || savingVariables || deletingVariable}
        />
        <KeyBindings />
        <Flow
          id={id}
          loadingData={!instructionSetLoaded}
          flowData={job?.data ?? ""}
        />
        <VariablesPanel
          setNewVar={setNewVariable}
          updateVar={updateVar}
          vars={variables}
          deleteVar={(id) => {
            DeleteVariable(id);
          }}
          loadingVars={!instructionSetLoaded}
        />
        <CustomFunctionSideBar id={id} />
      </div>
    </>
  );
};

export default JobPage;

const Ribbon: React.FC<{
  job: Job | null | undefined;
  errorLoading: boolean;
  loading: boolean;
  save: () => void;
  saving: boolean;
}> = ({ job, errorLoading, loading, save, saving }) => {
  return (
    <div className="fixed top-0 z-20 flex w-full gap-2 border-b border-neutral-700 bg-neutral-800/50 p-2 backdrop-blur-lg">
      <BackButtonComponent fallbackRoute="/dashboard" forceReload />
      <div className="flex w-full items-center justify-center">
        {loading ? (
          <div className="flex items-center justify-center">
            <LoadingSmall />
          </div>
        ) : errorLoading ? (
          <div className="flex items-center justify-center gap-2">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
            <p className="text-red-500">Error Loading</p>
          </div>
        ) : (
          <>
            {!job && (
              <div className="flex items-center justify-center gap-2">
                <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
                <p className="text-red-500">Could not find the instructions</p>
              </div>
            )}
            {job && (
              <div className="flex w-full select-none items-center justify-between gap-2">
                <div className="flex items-start gap-2">
                  <p className="text-lg font-semibold">{job?.title}</p>
                </div>
                <div className="flex items-center justify-center gap-2">
                  {/* <SettingsPopover>
                    <button className="rounded bg-transparent p-1 transition duration-100 hover:scale-105 hover:bg-neutral-800 focus:bg-neutral-800">
                      <Cog8ToothIcon className="h-6 w-6" />
                    </button>
                  </SettingsPopover> */}
                  <div className="mx-1 h-6 border-l border-neutral-600"></div>
                  <TooltipComponent
                    content="Manage Variable Types"
                    description="Manage the types of variables that can be used in this instruction set. (e.g. float, string, phone number, person ...)"
                    side="top"
                  >
                    <Link
                      href={`/jobs/${job.id}/variable-types`}
                      className="flex rounded bg-transparent p-1 transition duration-100 hover:scale-105 hover:bg-neutral-800 focus:bg-neutral-800"
                    >
                      <VariableIcon className="h-6 w-6" />
                    </Link>
                  </TooltipComponent>
                  <TooltipComponent
                    content="Version History"
                    description="Create versions, tag versions for production releases, and view past versions of this instruction set."
                    side="top"
                  >
                    <Link
                      href={`/jobs/${job.id}/versions`}
                      className="rounded bg-transparent p-1 transition duration-100 hover:scale-105 hover:bg-neutral-800 focus:bg-neutral-800"
                    >
                      <ArchiveBoxArrowDownIcon className="h-6 w-6" />
                    </Link>
                  </TooltipComponent>
                  <TooltipComponent
                    content="Connect"
                    description="Get the id to connect this instruction set to a device."
                    side="top"
                  >
                    <Link
                      href={`/jobs/${job.id}/connection`}
                      className="rounded bg-transparent p-1 transition duration-100 hover:scale-105 hover:bg-neutral-800 focus:bg-neutral-800"
                    >
                      <SignalIcon className="h-6 w-6" />
                    </Link>
                  </TooltipComponent>
                  <TooltipComponent
                    content="Save Changes"
                    description="Save changes to the cloud and push changes the connected device."
                    side="top"
                  >
                    <button
                      onClick={() => {
                        if (!saving) save();
                      }}
                      className={`flex gap-1  ${
                        saving
                          ? "rounded-full bg-blue-600"
                          : "rounded bg-transparent hover:scale-105 hover:bg-neutral-800 focus:bg-neutral-800"
                      }  p-1 transition duration-200 `}
                    >
                      {saving ? (
                        <ArrowPathIcon className="h-6 w-6 animate-spin" />
                      ) : (
                        <CloudArrowUpIcon className="h-6 w-6" />
                      )}
                    </button>
                  </TooltipComponent>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

const KeyBindings = () => {
  return (
    <div className="fixed bottom-0 z-20 flex w-full select-none items-center justify-center gap-4 p-2 text-sm">
      <p className="rounded bg-neutral-900 p-1">Left Mouse Button: Select</p>
      <p className="rounded bg-neutral-900 p-1">
        CTRL (or CMD on Mac) + Scroll Wheel: Select
      </p>
      <p className="rounded bg-neutral-900 p-1">Middle Mouse Button: Pan</p>
    </div>
  );
};

// const SettingsPopover: React.FC<{ children: ReactNode }> = ({ children }) => {
//   const [showGrid, setShowGrid] = useState<"on" | "off">("on");

//   return (
//     <Popover.Root>
//       {/* <Popover.Anchor /> */}
//       <TooltipComponent content="Quick Settings" side="top">
//         <Popover.Trigger asChild>{children}</Popover.Trigger>
//       </TooltipComponent>
//       <Popover.Portal>
//         <Popover.Content className="z-20 w-72 animate-popover rounded-lg border border-neutral-400 bg-black/60 p-3 backdrop-blur">
//           <div className="flex gap-2">
//             <p className="font-mono font-medium tracking-tight">Show Grid</p>
//             <Switch.Root
//               value={showGrid}
//               className="relative h-[25px] w-[42px] cursor-default rounded-full bg-neutral-800 outline-none data-[state=checked]:bg-blue-500"
//             >
//               <Switch.Thumb
//                 onClick={() => {
//                   setShowGrid(showGrid === "on" ? "off" : "on");
//                 }}
//                 className="block h-[21px] w-[21px] translate-x-0.5 rounded-full bg-white transition-transform duration-100 will-change-transform data-[state=checked]:translate-x-[19px]"
//               />
//             </Switch.Root>
//           </div>

//           <Popover.Close />
//           <Popover.Arrow className="fill-neutral-400" />
//         </Popover.Content>
//       </Popover.Portal>
//     </Popover.Root>
//   );
// };

const VariablesPanel: React.FC<{
  vars: Variables[];
  setNewVar: () => void;
  updateVar: (v: Variables) => void;
  deleteVar: (id: string) => void;
  loadingVars: boolean;
}> = ({ vars, setNewVar, updateVar, deleteVar, loadingVars }) => {
  const [open, setOpen] = useState(true);

  const [animationParent] = useAutoAnimate();

  // console.log("vars", vars);

  // const testVars = [] as Variables[];

  // testVars.push({
  //   id: "1",
  //   name: "test",
  //   type: "text",
  //   jobId: "1",
  //   description: "test",
  //   required: true,
  //   default: "test",
  //   updatedAt: new Date(),
  //   createdAt: new Date(),
  // });

  return (
    <div
      ref={animationParent}
      className={`fixed left-0 top-20 z-10 flex ${
        open ? "w-80" : "p-1"
      }   rounded-r border-y border-b border-r border-neutral-700 bg-neutral-800/50 backdrop-blur-lg transition duration-100`}
    >
      {open && !loadingVars && (
        <div className={` w-full `}>
          <button
            onClick={() => {
              setOpen(false);
            }}
            className="absolute left-1 top-1 rounded transition duration-200 hover:bg-neutral-500 "
          >
            <ChevronLeftIcon className="h-6 w-6" />
          </button>
          <div className="p-1 pt-10">
            <button onClick={setNewVar} className="w-full font-semibold">
              <div className="flex w-full items-center justify-start gap-2 rounded border border-neutral-600 p-1 outline-none transition duration-100 hover:cursor-pointer hover:bg-blue-600 focus:bg-blue-600">
                <PlusIcon className="h-4 w-4" />
                <p>New Variable</p>
              </div>
            </button>
          </div>
          <div className="flex flex-col">
            {(vars === undefined || vars.length === 0) && (
              <p className="w-full p-2 text-center  text-neutral-400">
                no variables yet...
              </p>
            )}
            {vars !== undefined && vars.length > 0 && (
              <>
                <div className="max-h-[70vh] overflow-y-auto overflow-x-clip">
                  {vars?.map((v) => (
                    <VariableItem
                      updateVar={updateVar}
                      deleteVar={(id) => {
                        deleteVar(id);
                      }}
                      v={v}
                      key={v.id}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}
      {open && loadingVars && (
        <div className="flex h-[2em] w-full items-center justify-center gap-2">
          <button
            onClick={() => {
              setOpen(false);
            }}
            className="absolute left-1 top-1 rounded transition duration-200 hover:bg-neutral-500 "
          >
            <ChevronLeftIcon className="h-6 w-6" />
          </button>
          <ArrowPathIcon className="h-4 w-4 animate-spin" />
          <div className="animate-pulse font-mono text-sm">
            Loading Variables...
          </div>
        </div>
      )}

      {!open && (
        <div>
          <TooltipComponent
            content="Variables"
            description="Define and drag/drop variables from this panel here."
            side="right"
          >
            <button
              onClick={() => {
                setOpen(true);
              }}
              className="items-center justify-center p-1 text-neutral-200"
            >
              <VariableIcon className="h-6 w-6" />
            </button>
          </TooltipComponent>
        </div>
      )}
    </div>
  );
};

const VariableItem: React.FC<{
  v: Variables;
  updateVar: (v: Variables) => void;
  deleteVar: (id: string) => void;
}> = ({ v, updateVar, deleteVar }) => {
  const [open, setOpen] = useState(false);

  const [animationParent] = useAutoAnimate();

  const [name, setName] = useState(v.name ?? "");
  const [description, setDescription] = useState(v.description ?? "");
  const [required, setRequired] = useState(v.required ?? false);
  const [type, setType] = useState(v.type ?? "select one...");
  const [selectedVariableType, setSelectedVariableType] =
    useState<VariableType | null>();
  const [value, setValue] = useState(v.value ?? "");

  const { data: variableTypes, isLoading } =
    api.variableTypes.getAllVariableTypesByJob.useQuery({
      jobId: v.jobId,
    });

  useEffect(() => {
    const newVar = {
      ...v,
      name,
      description,
      required,
      type,
      value,
    };

    updateVar(newVar);
  }, [name, description, required, type, v, updateVar, value]);

  const selectType = useCallback(
    (type: string) => {
      if (!type || type === "") {
        setType("");
        setSelectedVariableType(null);
      }

      setType(type);

      const variableType = variableTypes?.find((x) => x.typeName === type);
      setSelectedVariableType(variableType);
    },
    [variableTypes]
  );

  useMemo(() => {
    if (v === undefined) return;

    setName(v.name ?? "");
    setDescription(v.description ?? "");
    setRequired(v.required ?? false);
    setType(v.type ?? "");

    const variableType = variableTypes?.find((x) => x.typeName === type);
    setSelectedVariableType(variableType);

    const value = v.value ?? "";

    if (v.type === "text" || v.type === "string") setValue(value);

    if (
      v.type?.toLowerCase() === "decimal" ||
      v.type?.toLowerCase() === "integer" ||
      v.type?.toLowerCase() === "number"
    ) {
      const num = parseFloat(value);

      if (isNaN(num)) setValue("0");
      else setValue(num.toString());
    }

    if (v.type.toLowerCase() === "boolean") {
      if (!value || value === "") setValue("false");
      setValue(v.value ?? "false");
    }
  }, [v]);

  const onDragStart = (event: React.DragEvent<HTMLDivElement>) => {
    const nodeData = JSON.stringify({
      id: v.id,
      nodeType: "variable",
      label: v.name,
      required: v.required,
      type: v.type,
      value: v.value,
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
            <div
              className="rounded p-1"
              style={{
                backgroundColor: selectedVariableType?.colorHex ?? "#000000",
              }}
            />
            <p className="font-semibold">{name}</p>
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
              className="w-full rounded bg-neutral-800 p-1 text-neutral-200 outline-none ring-2 ring-neutral-700 transition duration-100 hover:ring hover:ring-neutral-700 focus:ring-blue-700"
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
              className="w-full rounded bg-neutral-800 p-1 text-neutral-200 outline-none ring-2 ring-neutral-700 transition duration-100 hover:ring hover:ring-neutral-700 focus:ring-blue-700"
              value={description}
              placeholder=""
            />
          </div>
          <div>
            <p className="font-semibold">Value</p>
            <input
              onChange={(e) => {
                setValue(e.target.value);
              }}
              type="text"
              className="w-full rounded bg-neutral-800 p-1 text-neutral-200 outline-none ring-2 ring-neutral-700 transition duration-100 hover:ring hover:ring-neutral-700 focus:ring-blue-700"
              value={value}
              placeholder=""
            />
          </div>
          <div>
            <p className="font-semibold">Required?</p>
            <select
              onChange={(e) => {
                setRequired(e.target.value === "true");
              }}
              className="w-full rounded bg-neutral-800 p-1 text-neutral-200 outline-none ring-2 ring-neutral-700 transition duration-100 hover:ring hover:ring-neutral-700 focus:ring-blue-700"
              value={required ? "true" : "false"}
              placeholder="Be sure to name the function exactly as it is in the code..."
            >
              <option value={"true"}>Required</option>
              <option value={"false"}>Optional</option>
            </select>
          </div>
          <div>
            <p className="font-semibold">Type</p>
            {!isLoading && (
              <select
                onChange={(e) => {
                  selectType(e.target.value);
                }}
                className="w-full rounded bg-neutral-800 p-1 text-neutral-200 outline-none ring-2 ring-neutral-700 transition duration-100 hover:ring hover:ring-neutral-700 focus:ring-blue-700"
                value={type}
                placeholder="Be sure to name the function exactly as it is in the code..."
              >
                <option value={""} className="font-mono">
                  Select a type
                </option>
                {variableTypes?.map((vt) => (
                  <option key={vt.id} value={vt.typeName}>
                    {vt.typeName}
                  </option>
                ))}
              </select>
            )}
            {isLoading && <p>Loading ...</p>}
          </div>
          <div className="flex w-full flex-col gap-2 rounded border border-dashed border-red-900 p-2">
            <p className="font-semibold">Danger Zone</p>
            <button
              onClick={() => {
                deleteVar(v.id);
              }}
              className="flex items-center justify-center gap-2 rounded bg-red-700 p-1 transition duration-100 hover:bg-red-600"
            >
              <TrashIcon className="h-6 w-6" />
              <p className="font-semibold">Delete</p>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const CustomFunctionSideBar = (props: { id: string }) => {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: customFunctions } =
    api.functions.searchFunctionsFromJobId.useQuery({
      jobId: props.id,
      search: searchTerm,
    });

  const [open, setOpen] = useState(false);

  const [animationParent] = useAutoAnimate();

  return (
    <>
      <div className="fixed right-0 top-20 z-10 flex select-none flex-col gap-1 rounded-l border-y border-b border-l border-neutral-700 bg-neutral-800/50 backdrop-blur-lg transition duration-100">
        <div ref={animationParent}>
          <div className="flex items-center justify-end">
            <TooltipComponent
              content="Functions"
              description="Define and drag/drop from this panel here."
              side="left"
            >
              <button
                onClick={() => {
                  setOpen(!open);
                }}
                className="p-2"
              >
                {!open && <CpuChipIcon className="h-6 w-6" />}
                {open && <ChevronRightIcon className="h-6 w-6" />}
              </button>
            </TooltipComponent>
          </div>
          {open && (
            <div className="min-w-[25em]">
              <div className="flex w-full flex-col gap-1 font-semibold">
                <div className="flex max-h-[70vh] flex-col gap-2 overflow-y-auto overflow-x-hidden p-2">
                  <div>
                    <div className="flex gap-2">
                      <input
                        className="w-full rounded bg-neutral-700 p-1 font-mono font-normal outline-none ring-1 ring-neutral-600 hover:ring hover:ring-blue-500 focus:ring-blue-500"
                        type="text"
                        placeholder="search..."
                        value={searchTerm}
                        onChange={(e) => {
                          setSearchTerm(e.target.value);
                        }}
                      />
                      <NewFunctionDialog jobId={props.id}>
                        <div className="flex items-center justify-start gap-2 rounded border border-neutral-600 p-1 outline-none transition duration-100 hover:cursor-pointer hover:bg-blue-600 focus:bg-blue-600">
                          <p>New</p>
                          <PlusIcon className="h-4 w-4" />
                        </div>
                      </NewFunctionDialog>
                    </div>
                  </div>
                  {customFunctions !== undefined &&
                    customFunctions?.length > 0 &&
                    customFunctions?.map((f) => (
                      <FunctionItem key={f.id} func={f} />
                    ))}
                  {customFunctions?.length === 0 && (
                    <>
                      <div className="px-2">
                        <NewFunctionDialog jobId={props.id}>
                          <div className="flex w-full items-center justify-start gap-2 rounded border border-neutral-600 p-1 outline-none transition duration-100 hover:cursor-pointer hover:bg-blue-600 focus:bg-blue-600">
                            <PlusIcon className="h-4 w-4" />
                            <p>New Function</p>
                          </div>
                        </NewFunctionDialog>
                      </div>
                      <div className="flex w-full items-center justify-center gap-2 p-1">
                        <p className="text-neutral-300">No Functions Yet</p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export const CamelCaseToNormal = (str: string) => {
  let i = 0;

  for (i = str.length - 1; i >= 0; i--) {
    if (str[i] == str[i]?.toUpperCase()) {
      const newString = str.substring(0, i) + " " + str.substring(i);
      str = newString;
    }
  }

  return str;
};

const FunctionItem: React.FC<{
  func: CustomFunction & { parameters: Parameters[] };
}> = ({ func }) => {
  const onDragStart = (
    event: React.DragEvent<HTMLDivElement>,
    f: CustomFunction & { parameters: Parameters[] }
  ) => {
    if (deleting) return;

    const data = JSON.stringify({
      id: f.id,
      nodeType: "customFunction",
      label: f.name,
      description: f.description,
      parameters: f.parameters,
    });

    event.dataTransfer.setData("application/reactflow", data);
    event.dataTransfer.effectAllowed = "move";
  };

  const ctx = api.useContext();

  const [animationParent] = useAutoAnimate();

  const { mutate: deleteFunction, isLoading: deleting } =
    api.functions.deleteFunction.useMutation({
      onSuccess: () => {
        console.log("Function Deleted");
        void ctx.invalidate();
      },
      onError: () => {
        console.log("Error Deleting Function");
      },
    });

  const deleteForever = () => {
    const result = confirm(
      "Are you sure you want to delete this function forever? This change cannot be reverted."
    );

    if (result) {
      deleteFunction({
        id: func.id,
      });
    }
  };

  const fixName = (name: string) => {
    const conversionResult = CamelCaseToNormal(name);

    if (conversionResult.length > 20) {
      return conversionResult.substring(0, 20) + "...";
    }

    return conversionResult;
  };

  return (
    <div
      ref={animationParent}
      draggable={true}
      onDragStart={(event) => onDragStart(event, func)}
      className="flex w-full items-center justify-between rounded-lg border border-transparent bg-neutral-700 p-3 transition duration-300 hover:scale-105 hover:cursor-pointer hover:border-neutral-400 hover:bg-neutral-600 hover:shadow-lg"
    >
      {!deleting && (
        <>
          <div className="flex items-center justify-center gap-2">
            <CodeBracketIcon className="h-6 w-6" />
            <div>
              <div className="flex flex-wrap items-center justify-start gap-1">
                <p className="font-semibold">{fixName(func.name)}</p>
                <p className="text-sm text-neutral-400">•</p>
                <p className="text-sm font-normal text-neutral-400">
                  {func.parameters.length}{" "}
                  {func.parameters.length == 1 ? "param" : "params"}
                </p>
              </div>
              {func.description && (
                <p className="font-xs font-normal text-neutral-400">
                  {func.description}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={deleteForever}
            className="text-neutral-200 transition duration-100 hover:text-red-500"
          >
            <TrashIcon className="h-6 w-6" />
          </button>
        </>
      )}
      {deleting && (
        <div className="flex items-center justify-center gap-2">
          <LoadingSmall />
        </div>
      )}
    </div>
  );
};

export type ParameterType = {
  name: string;
  type: "text" | "integer" | "decimal" | "boolean";
  io: "input" | "output";
  id: string;
};

const NewFunctionDialog: FC<{ children: ReactNode; jobId: string }> = ({
  children,
  jobId,
}) => {
  const [functionName, setFunctionName] = useState("");
  const [functionDetails, setFunctionDetails] = useState("");
  const [inParams, setInParams] = useState<ParameterType[]>([]);
  const [OutParams, setOutParams] = useState<ParameterType[]>([]);

  const [animationParent] = useAutoAnimate();

  const newInParam = () => {
    const id = getId();

    setInParams((params) => [
      ...params,
      { name: "", type: "text", io: "input", id },
    ]);
  };

  const newOutParameter = () => {
    const id = getId();

    setOutParams((params) => [
      ...params,
      { name: "", type: "text", io: "output", id },
    ]);
  };

  const deleteInParameter = useCallback((id: string) => {
    setInParams((params) => params.filter((p) => p.id !== id));
  }, []);

  const deleteOutParameter = useCallback((id: string) => {
    setOutParams((params) => params.filter((p) => p.id !== id));
  }, []);

  const context = api.useContext();

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

    const parameters = inParams.map((p) => ({
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
  }, [functionDetails, functionName, jobId, mutate, inParams, OutParams]);

  const UpdateParameter = useCallback(
    (
      id: string,
      name: string,
      type: "text" | "integer" | "decimal" | "boolean",
      io: string
    ) => {
      console.log("updating parameter");

      if (io === "input") {
        setInParams((params) =>
          params.map((p) => {
            if (p.id === id) {
              return { name, type, io, id: p.id } as ParameterType;
            }
            return p;
          })
        );
      }

      if (io === "output") {
        setOutParams((params) =>
          params.map((p) => {
            if (p.id === id) {
              return { name, type, io, id: p.id } as ParameterType;
            }
            return p;
          })
        );
      }
    },
    [setInParams, setOutParams]
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
                className="w-full rounded bg-neutral-800 p-1 text-neutral-200 outline-none ring-2 ring-neutral-700 transition duration-100 hover:ring hover:ring-neutral-700 focus:ring-blue-700"
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
                className="w-full rounded bg-neutral-800 p-1 text-neutral-200 outline-none ring-2 ring-neutral-700 transition duration-100 hover:ring hover:ring-neutral-700 focus:ring-blue-700"
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
              {inParams.map((p) => (
                <Parameter
                  key={p.id}
                  deleteParameter={() => deleteInParameter(p.id)}
                  name={p.name}
                  type={p.type}
                  io={p.io}
                  id={p.id}
                  textOut={(id, name, type, io) => {
                    UpdateParameter(p.id, name, type, io);
                  }}
                />
              ))}
            </div>
            <button
              onClick={newInParam}
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
              {OutParams.map((p) => (
                <Parameter
                  key={p.id}
                  deleteParameter={() => deleteOutParameter(p.id)}
                  name={p.name}
                  type={p.type}
                  io={p.io}
                  id={p.id}
                  textOut={(id, name, type, io) => {
                    UpdateParameter(p.id, name, type, io);
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
              <div className="flex w-32 cursor-pointer items-center justify-center gap-2 rounded bg-neutral-700 p-2 font-semibold outline-none hover:bg-neutral-600 focus:bg-neutral-600">
                <XMarkIcon className="h-5 w-5" />
                <p>Cancel</p>
              </div>
            </Dialog.Close>
            <Dialog.Close asChild>
              <button
                onClick={() => {
                  SaveFunction();
                }}
                className="flex w-32 items-center justify-center gap-2 rounded bg-blue-700 p-2 font-semibold outline-none hover:bg-blue-600 focus:bg-blue-600"
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
  type: string;
  io: string;
  id: string;
  textOut: (
    id: string,
    name: string,
    type: "text" | "integer" | "decimal" | "boolean",
    io: string
  ) => void;
  deleteParameter: (e: string) => void;
}> = ({ name, type, io, deleteParameter, textOut, id }) => {
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
    deleteParameter(id);
  };

  useEffect(() => {
    textOut(id, parameterName, parameterType, parameterIO);
  }, [parameterName, parameterType, parameterIO, textOut, id]);

  return (
    <div className="mb-2 flex flex-col gap-2">
      <div className="flex items-center justify-center gap-2">
        <div className="w-full pb-1">
          {/* <p className="font-lg font-semibold text-neutral-200">Parameter Name</p> */}
          <input
            type="text"
            className="w-full rounded bg-neutral-800 p-1 text-neutral-200 outline-none ring-2 ring-neutral-700 transition duration-100 hover:ring hover:ring-neutral-700 focus:ring-blue-700"
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
            className="w-full rounded bg-neutral-800 p-1 text-neutral-200 outline-none ring-2 ring-neutral-700 transition duration-100 hover:ring hover:ring-neutral-700 focus:ring-blue-700"
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
