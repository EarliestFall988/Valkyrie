import {
  BugAntIcon,
  ChevronDoubleDownIcon,
  ChevronDoubleUpIcon,
  DocumentTextIcon,
  PlusSmallIcon,
} from "@heroicons/react/24/outline";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import React, { useCallback, useState } from "react";
import { BackButtonComponent } from "~/components/backButton";

import { api } from "~/utils/api";
// import * as Dialog from "@radix-ui/react-dialog";
import { Loading, LoadingSmall } from "~/components/loading";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { type InstructionSetSchemaVersion } from "@prisma/client";
import { TrashIcon } from "@radix-ui/react-icons";
import { TooltipComponent } from "~/components/tooltip";

const VersionsPage: NextPage = () => {
  const { query } = useRouter();
  let { id } = query as { id: string };

  if (id === null) id = "";

  const versionCtx = api.useContext().schemaVersioning;

  const [animationParent] = useAutoAnimate();

  const [name, setName] = useState("");
  const [productionBuild, setProductionBuild] = useState("false");

  const { mutate: newVersionMutation, isLoading: isCreating } =
    api.schemaVersioning.createNewVersion.useMutation({
      onSuccess: () => {
        console.log("success");
        void versionCtx.invalidate();

        setName("");
        setProductionBuild("false");
      },
      onError: () => {
        console.log("error");
      },
    });

  const createNewVersion = useCallback(
    (name: string, description: string, productionBuild: string) => {
      if (id === null || id === undefined) return;

      if (isCreating) return;

      const prod = productionBuild === "true" ? true : false;

      newVersionMutation({
        jobId: id,
        name,
        description,
        productionBuild: prod,
      });
    },
    [id, newVersionMutation, isCreating]
  );

  const { data: versions, isLoading } =
    api.schemaVersioning.getVersionsByJobId.useQuery({
      jobId: id,
    });

  return (
    <div className="min-h-[100vh] w-screen bg-neutral-900">
      <div className="flex h-10 items-center gap-2 border-b border-neutral-700 bg-neutral-800 p-2">
        <BackButtonComponent fallbackRoute="/dashboard" />
        <h1 className="text-lg font-semibold">Versions</h1>
      </div>
      <div className="flex min-h-[80vh] w-full items-start justify-center p-2">
        <div className="w-96 rounded-2xl border border-neutral-600 p-5 lg:w-2/3 2xl:w-1/2">
          <div className="flex items-center justify-end gap-2 p-5">
            <div className="flex w-1/2 flex-col items-start">
              <p className="full text-lg font-semibold">New Version</p>
              <div className="flex w-full items-center justify-end gap-2">
                <input
                  type="text"
                  className="w-full rounded bg-neutral-800 p-1 text-neutral-200 outline-none ring-2 ring-neutral-700 transition duration-100 hover:ring hover:ring-neutral-700 focus:ring-purple-700"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                  }}
                  placeholder="version name"
                  autoFocus
                />
                <select
                  value={productionBuild}
                  onChange={(e) => {
                    setProductionBuild(e.target.value);
                  }}
                  className="w-full rounded bg-neutral-800 p-1 text-neutral-200 outline-none ring-2 ring-neutral-700 transition duration-100 hover:ring hover:ring-neutral-700 focus:ring-purple-700"
                >
                  <option value="false">Development</option>
                  <option value="true">Production</option>
                </select>
                <button
                  onClick={() => {
                    createNewVersion(name, "", productionBuild);
                  }}
                  className={`flex items-center justify-center gap-1 rounded ${
                    isCreating
                      ? ""
                      : "bg-neutral-800 hover:bg-purple-700 focus:bg-purple-700"
                  }  p-1 text-neutral-200 outline-none transition duration-200 `}
                >
                  {!isCreating && (
                    <>
                      <PlusSmallIcon className="h-6 w-6 translate-y-[0.5px]" />
                      {/* <p className="pr-1 font-mono font-semibold">New Version</p> */}
                    </>
                  )}
                  {isCreating && <LoadingSmall />}
                </button>
              </div>
            </div>
          </div>
          <div className="w-full" ref={animationParent}>
            {isLoading ? (
              <div className="flex h-[20vh] w-full items-center justify-center">
                <Loading />
              </div>
            ) : (
              <div>
                {versions?.map((version) => {
                  return <VersionItem key={version.id} version={version} />;
                })}
                {versions?.length === 0 && (
                  <div className="flex h-[20vh] w-full items-center justify-center">
                    <p className="text-lg font-semibold text-neutral-400">
                      No Versions Yet
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const VersionItem: React.FC<{ version: InstructionSetSchemaVersion }> = ({
  version,
}) => {
  const context = api.useContext().schemaVersioning;

  const { mutate: deleteVersion, isLoading: isDeleting } =
    api.schemaVersioning.deleteVersions.useMutation({
      onSuccess() {
        console.log("success");
        void context.invalidate();
      },
    });

  const DeleteVersion = () => {
    if (isDeleting) return;

    const result = confirm("Are you sure you want to delete this version?");

    if (result) {
      const versions = [{ id: version.id }];
      deleteVersion(versions);
    }
  };

  const { mutate: updateVersion, isLoading: isUpdating } =
    api.schemaVersioning.updateVersion.useMutation({
      onSuccess() {
        console.log("success");
        void context.invalidate();
      },
      onError() {
        console.log("error");
      },
    });

  const SetProduction = (prod: boolean) => {
    if (isUpdating) return;

    let message = "Promote to Production?";

    if (!prod) {
      message = "Demote from Production?";
    }

    const result = confirm(message);

    if (result) {
      updateVersion({
        id: version.id,
        productionBuild: prod,
        description: version.description,
        name: version.name,
      });
    }
  };

  return (
    <div
      key={version.id}
      className="flex items-center justify-between gap-2 border-b border-neutral-700 py-2"
    >
      {!isDeleting && !isUpdating && (
        <>
          <div className="flex items-start gap-2">
            {version.productionBuild && (
              <DocumentTextIcon className="h-5 w-5 translate-y-2" />
            )}
            {!version.productionBuild && (
              <BugAntIcon className="h-5 w-5 translate-y-2" />
            )}
            <div>
              <p className="text-lg font-semibold">{version.name}</p>
              <p className="text-neutral-400">{version.description}</p>
              <p
                className={` text-xs ${
                  version.productionBuild
                    ? "font-semibold text-green-500"
                    : "text-yellow-500"
                }`}
              >
                {version.productionBuild ? "Production" : "Development"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {/* <p
              className={` ${
                version.productionBuild
                  ? "font-semibold text-green-500"
                  : "text-yellow-500"
              }`}
            >
              {version.productionBuild ? "Production" : "Development"}
            </p> */}
            {!version.productionBuild && (
              <TooltipComponent
                side="bottom"
                content="Promote To Production"
                description="Promote this version to be the latest release."
              >
                <button
                  onClick={() => {
                    SetProduction(true);
                  }}
                >
                  <ChevronDoubleUpIcon className="h-5 w-5 text-neutral-200" />
                </button>
              </TooltipComponent>
            )}
            {version.productionBuild && (
              <TooltipComponent
                side="bottom"
                content="Demote From Production"
                description="This version will be demoted from a production release for developer access only."
              >
                <button
                  onClick={() => {
                    SetProduction(false);
                  }}
                >
                  <ChevronDoubleDownIcon className="h-5 w-5 text-neutral-200" />
                </button>
              </TooltipComponent>
            )}
            <TooltipComponent side="bottom" content="Delete Forever">
              <button onClick={DeleteVersion}>
                <TrashIcon className="h-5 w-5 text-red-500" />
              </button>
            </TooltipComponent>
          </div>
        </>
      )}
      {isDeleting ||
        (isUpdating && (
          <div className="flex w-full items-center justify-center gap-2">
            <LoadingSmall />
          </div>
        ))}
    </div>
  );
};

// const NewVersionDialog: React.FC<{
//   children: ReactNode;
//   onSave: (name: string, description: string, prodctionBuild: string) => void;
// }> = ({ children, onSave }) => {
//   const [name, setName] = useState("new version");
//   const [description, setDescription] = useState("");
//   const [productionBuild, setProductionBuild] = useState("false");

//   const createNewVersion = useCallback(
//     () => onSave(name, description, productionBuild),
//     [name, description, productionBuild, onSave]
//   );

//   return (
//     <Dialog.Root>
//       <Dialog.Trigger asChild>{children}</Dialog.Trigger>
//       <Dialog.Portal>
//         <Dialog.Overlay className="data-[state=open]:animate-overlayShow fixed inset-0 top-0 z-30 backdrop-blur-lg md:bg-black/20" />
//         <Dialog.Content className="data-[state=open]:animate-contentShow fixed left-[50%] top-[50%] z-30 max-h-[85vh] w-[90vw] max-w-[500px] translate-x-[-50%] translate-y-[-50%] rounded-[6px] border border-neutral-700 bg-black p-[25px] focus:outline-none">
//           <div className="border-b border-neutral-700 py-1">
//             <div className="flex items-center gap-2 text-2xl font-semibold">
//               <p>New Version</p>
//             </div>
//             <div className="p-1">
//               <p className="font-lg font-semibold text-neutral-200">Name</p>
//               <input
//                 type="text"
//                 className="w-full rounded bg-neutral-800 p-1 text-neutral-200 outline-none ring-2 ring-neutral-700 transition duration-100 hover:ring hover:ring-neutral-700 focus:ring-purple-700"
//                 value={name}
//                 onChange={(e) => {
//                   setName(e.target.value);
//                 }}
//                 placeholder=""
//                 autoFocus
//               />
//             </div>
//             <div className="p-1">
//               <p className="font-lg font-semibold text-neutral-200">
//                 Description
//               </p>
//               <textarea
//                 className="w-full rounded bg-neutral-800 p-1 text-neutral-200 outline-none ring-2 ring-neutral-700 transition duration-100 hover:ring hover:ring-neutral-700 focus:ring-purple-700"
//                 value={description}
//                 onChange={(e) => {
//                   setDescription(e.target.value);
//                 }}
//                 placeholder=""
//               />
//             </div>
//           </div>
//           <div className="p-1">
//             <p className="font-lg font-semibold text-neutral-200">
//               Promote To Production
//             </p>
//             <select
//               onChange={(e) => {
//                 setProductionBuild(e.target.value);
//               }}
//               className="w-full rounded bg-neutral-800 p-1 text-neutral-200 outline-none ring-2 ring-neutral-700 transition duration-100 hover:ring hover:ring-neutral-700 focus:ring-purple-700"
//             >
//               <option value="false">No</option>
//               <option value="true">Yes</option>
//             </select>
//           </div>
//           <div className="flex items-center justify-end gap-2 pt-5">
//             <Dialog.Close asChild>
//               <div className="flex w-32 items-center justify-center gap-2 rounded bg-neutral-700 p-2 font-semibold outline-none hover:bg-neutral-600 focus:bg-neutral-600">
//                 <XMarkIcon className="h-5 w-5" />
//                 <p>Cancel</p>
//               </div>
//             </Dialog.Close>

//             <button
//               onClick={() => {
//                 createNewVersion();
//               }}
//               className="flex w-32 items-center justify-center gap-2 rounded bg-purple-700 p-2 font-semibold outline-none hover:bg-purple-600 focus:bg-purple-600"
//             >
//               <CloudArrowUpIcon className="h-5 w-5" />
//               <p>Save</p>
//             </button>
//           </div>
//         </Dialog.Content>
//       </Dialog.Portal>
//     </Dialog.Root>
//   );
// };

export default VersionsPage;
