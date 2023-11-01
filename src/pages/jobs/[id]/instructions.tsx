import {
  ArrowPathIcon,
  CloudArrowUpIcon,
  CodeBracketIcon,
  ExclamationTriangleIcon,
  SignalIcon,
} from "@heroicons/react/24/outline";
import { type CustomFunction, type Variables, type Job } from "@prisma/client";
import { type NextPage } from "next";
import { useRouter } from "next/router";

import "reactflow/dist/style.css";
import { LoadingSmall } from "~/components/loading";
import { api } from "~/utils/api";
import { Flow, getId, varMetaDataType } from "~/flow/flow";
import { BackButtonComponent } from "~/components/backButton";
import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { TooltipComponent } from "~/components/tooltip";
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  PlusIcon,
  TrashIcon,
} from "@radix-ui/react-icons";
import { useAutoAnimate } from "@formkit/auto-animate/react";

const JobPage: NextPage = () => {
  const router = useRouter();

  const { id } = router.query;

  let jobId = "";

  if (typeof id === "string") {
    jobId = id;
  }

  const [customFunctions, setCustomFunctions] = useState<CustomFunction[]>([]);
  const [variables, setVariables] = useState<Variables[]>([]);
  const [instructionSetLoaded, setInstructionSetLoaded] = useState(false);

  const {
    data: job,
    isLoading,
    isError,
  } = api.jobs.getJobById.useQuery({
    id: jobId,
  });

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

    // const reactflowinstance = job.data;

    // if (!reactflowinstance) return;

    // console.log("job data", reactflowinstance);

    setCustomFunctions(job.customFunctions);
    setVariables(job.variables);
    setInstructionSetLoaded(true);
  }, [job]);

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
        },
      ]);
    }
  };

  if (typeof id !== "string") return null;

  const saveInstructions = () => {
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

    updateJob({
      id: jobId,
      title: job.title,
      description: job.description ?? undefined,
      jobData: job.data,
    });
  };

  const DeleteVariable = (id: string) => {
    setVariables(variables.filter((v) => v.id !== id));

    deleteVariable({
      id: id,
    });
  };

  return (
    <div className="h-[100vh] w-full">
      <Ribbon
        save={saveInstructions}
        job={job}
        errorLoading={isError}
        loading={isLoading}
        saving={saving || savingVariables || deletingVariable}
      />
      <KeyBindings />
      <Flow id={id} loadingData={!instructionSetLoaded} />
      <VariablesPanel
        setNewVar={setNewVariable}
        updateVar={updateVar}
        vars={variables}
        deleteVar={(id) => {
          DeleteVariable(id);
        }}
        loadingVars={!instructionSetLoaded}
      />
    </div>
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
    <div className="fixed top-0 z-20 flex w-full gap-2 border-b border-neutral-700 bg-neutral-800 p-2">
      <BackButtonComponent fallbackRoute="/dashboard" />
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
                <p className="text-red-500">Could not find the Bot</p>
              </div>
            )}
            {job && (
              <div className="flex w-full select-none items-center justify-between gap-2">
                <div className="flex items-start gap-2">
                  <p className="text-lg font-semibold">{job?.title}</p>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <TooltipComponent
                    content="Connect"
                    description="Connect to a compatible device over the internet."
                    side="top"
                  >
                    <Link
                      href={`/jobs/${job.id}/connection`}
                      className="rounded bg-neutral-700 p-1 transition duration-100 hover:scale-105 hover:bg-neutral-600 focus:bg-neutral-600"
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
                      className={`flex gap-1 rounded ${
                        saving
                          ? ""
                          : "bg-neutral-700 hover:scale-105 hover:bg-neutral-600 focus:bg-neutral-600"
                      }  p-1 transition duration-100 `}
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
      }   rounded-r border-y border-r border-neutral-700 bg-neutral-800 transition duration-100`}
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
      {open && loadingVars && (
        <div className="flex h-[2em] gap-2 w-full items-center justify-center">
          <button
            onClick={() => {
              setOpen(false);
            }}
            className="absolute left-1 top-1 rounded transition duration-200 hover:bg-neutral-500 "
          >
            <ChevronLeftIcon className="h-6 w-6" />
          </button>
          <ArrowPathIcon className="h-4 w-4 animate-spin" />
          <div className="font-mono text-sm animate-pulse">Loading Variables...</div>
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
              <CodeBracketIcon className="h-6 w-6" />
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
  }, [name, description, required, type, v, updateVar]);

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
