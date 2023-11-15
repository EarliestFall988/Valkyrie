import {
  EllipsisVerticalIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  TrashIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { type NextPage } from "next";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import Head from "next/head";
import Link from "next/link";
import { api } from "~/utils/api";
import { Loading } from "~/components/loading";
import React, { type ReactNode, useState, useCallback, useEffect } from "react";
import type { APISchema } from "@prisma/client";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { TooltipComponent } from "~/components/tooltip";
import { DashboardHeader } from "~/components/dashboardHeader";

dayjs.extend(relativeTime);

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { useRouter } from "next/router";

const Schema: NextPage = () => {
  const {
    data: schemas,
    isLoading,
    isError,
  } = api.apiSchema.getAllApiSchema.useQuery({});

  const jobContext = api.useContext().jobs;

  const [animationParent] = useAutoAnimate();

  const {
    mutate: deleteSchemas,
    isLoading: isDeleting,
    isError: errorDeleting,
  } = api.apiSchema.deleteMultipleApiSchema.useMutation({
    onSuccess: () => {
      console.log("success");
      void jobContext.invalidate();
    },
    onError: (error) => {
      console.log(error);
    },
  });

  const loading = isLoading || isDeleting;
  const errorLoading = isError || errorDeleting;

  const [canDelete, setCanDelete] = useState(false);

  const ToggleCanDelete = () => {
    setCanDelete((prev) => !prev);
  };

  const [schemasToDelete, setSchemaToDelete] = useState<APISchema[]>([]);

  const SetSchemaToDelete = (schema: APISchema, canDelete: boolean) => {
    if (canDelete) {
      setSchemaToDelete((prev) => [...prev, schema]);
    } else {
      setSchemaToDelete((prev) => prev.filter((s) => s.id !== schema.id));
    }
  };

  const DeleteSelectedSchemas = () => {
    deleteSchemas({
      ids: schemasToDelete.map((s) => s.id),
    });
    setCanDelete(false);
  };

  return (
    <>
      <Head>
        <title>Schema - Valkyrie</title>
        <meta
          name="description"
          content="Pull data by building digital workers"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="min-h-[100vh] bg-gradient-to-bl from-black to-neutral-900 text-white">
        <DashboardHeader name={"Dashboard > Schema"} />
        <div className="h-[8vh]" />
        <div className="flex w-full flex-col gap-2 rounded-lg p-2 md:m-auto md:w-5/6 2xl:w-2/3">
          <div className="flex items-center justify-between gap-5">
            <h3 className="select-none text-3xl font-semibold">Schema</h3>
            <div className="flex items-center justify-center gap-2">
              <TooltipComponent side="bottom" content="Add a new instruction">
                <Link href="/schema/new">
                  <div className="flex select-none items-center justify-center gap-2 rounded border border-transparent p-2 transition duration-200 hover:cursor-pointer hover:border-blue-500 hover:text-blue-500">
                    <p>Add</p>
                    <PlusIcon className="h-6 w-6" />
                  </div>
                </Link>
              </TooltipComponent>
              <TooltipComponent side="bottom" content="Delete instructions">
                <button
                  onClick={() => {
                    if (!canDelete) {
                      ToggleCanDelete();
                    } else {
                      DeleteSelectedSchemas();
                    }
                  }}
                >
                  <div
                    className={`flex select-none items-center justify-center gap-2 rounded border border-transparent p-2 transition duration-200 ${
                      canDelete
                        ? "border-red-600 text-red-700 hover:border-red-500 hover:text-red-500"
                        : "hover:border-blue-500 hover:text-blue-500"
                    }`}
                  >
                    <p>Delete</p>
                    <TrashIcon className="h-6 w-6" />
                  </div>
                </button>
              </TooltipComponent>
              {canDelete && (
                <TooltipComponent side="bottom" content="Cancel deletion">
                  <button onClick={ToggleCanDelete}>
                    <div className="flex select-none items-center justify-center gap-2 rounded border border-transparent p-2 transition duration-200 hover:cursor-pointer hover:border-blue-500 hover:text-blue-500">
                      <XMarkIcon className="h-6 w-6" />
                    </div>
                  </button>
                </TooltipComponent>
              )}
            </div>
          </div>

          <div className={`w-full `}>
            {loading && !errorLoading && (
              <div className="flex h-full w-full items-center justify-center">
                <Loading />
              </div>
            )}
            {!loading && errorLoading && (
              <div className="flex h-[30vh] items-center justify-center gap-2">
                <p className="text-2xl font-semibold text-red-300">
                  Error Loading Instructions
                </p>
                <ExclamationTriangleIcon className="h-6 w-6 rotate-3 text-red-500" />
              </div>
            )}
            {!loading && !errorLoading && schemas && schemas.length !== 0 && (
              <div
                ref={animationParent}
                className="border-x border-t border-neutral-800"
              >
                {schemas.map((schema) => (
                  <SchemaObj
                    setCanDelete={canDelete}
                    key={schema.id}
                    schema={schema}
                    setSchemaToDelete={SetSchemaToDelete}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
};

export default Schema;

const SchemaObj: React.FC<{
  schema: APISchema;
  setCanDelete: boolean;
  setSchemaToDelete: (s: APISchema, d: boolean) => void;
}> = ({ schema, setCanDelete, setSchemaToDelete }) => {
  const [deleteSchema, setDeleteSchema] = useState<boolean>(false);

  const ctx = api.useContext().apiSchema;

  const { mutate, isLoading: deleting } =
    api.apiSchema.deleteApiSchema.useMutation({
      onSuccess: () => {
        console.log("success");
        void ctx.invalidate();
      },
      onError: (error) => {
        console.log(error);
      },
    });

  const onDeleteSchema = () => {
    mutate({
      id: schema.id,
    });
  };

  const { push } = useRouter();

  const GoToSchema = () => {
    if (deleting) return;

    void push(`/schema/${schema.id}`);
  };

  const setSchemaToDeleteWrapper = useCallback(() => {
    const canDelete = !deleteSchema;
    setSchemaToDelete(schema, canDelete);
    setDeleteSchema(canDelete);
  }, [schema, setSchemaToDelete, deleteSchema]);

  useEffect(() => {
    if (!setCanDelete) {
      setDeleteSchema(false);
    }
  }, [setCanDelete]);

  return (
    <div
      onClick={GoToSchema}
      className={`grid w-full ${
        deleting ? "grid-cols-1" : "grid-cols-3"
      } gap-2 border-b border-neutral-800 p-2 transition duration-200 hover:cursor-pointer hover:border-transparent hover:bg-neutral-800 `}
    >
      {deleting ? (
        <div className="flex items-center justify-center">
          <Loading />
        </div>
      ) : (
        <>
          <div>
            <h2 className="text-lg font-semibold">{schema.name}</h2>
            <h3 className="text-sm text-neutral-300">{schema.description}</h3>
          </div>
          <div className="flex flex-col items-center justify-center ">
            <p>{schema.schemaResult}</p>
            <p className="block text-sm text-neutral-400 md:hidden">
              {dayjs(schema.updatedAt).fromNow()}
            </p>
          </div>
          <div className="flex items-center justify-end gap-3 text-sm text-neutral-400">
            <p className="hidden md:block">
              {dayjs(schema.updatedAt).fromNow()}
            </p>
            {setCanDelete ? (
              <button
                onClick={setSchemaToDeleteWrapper}
                className="rounded transition duration-200 hover:scale-105 hover:bg-blue-500"
              >
                {deleteSchema ? (
                  <TrashIcon className="h-6 w-6 text-red-500" />
                ) : (
                  <TrashIcon className="h-6 w-6 text-neutral-300" />
                )}
              </button>
            ) : (
              <MenuDropDown name={schema.name} onDelete={onDeleteSchema}>
                <button className="rounded transition duration-200 hover:scale-105 hover:bg-blue-500">
                  <EllipsisVerticalIcon className="h-6 w-6" />
                </button>
              </MenuDropDown>
            )}
          </div>
        </>
      )}
    </div>
  );
};

const MenuDropDown: React.FC<{
  children: ReactNode;
  name: string;
  onDelete: () => void;
}> = ({ children, name, onDelete }) => {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>{children}</DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="data-[side=top]:animate-slideDownAndFade data-[side=right]:animate-slideLeftAndFade data-[side=bottom]:animate-slideUpAndFade data-[side=left]:animate-slideRightAndFade flex min-w-[220px] flex-col gap-2 rounded-lg border border-neutral-700 bg-black/30 p-[5px] shadow-[0px_10px_38px_-10px_rgba(22,_23,_24,_0.35),_0px_10px_20px_-15px_rgba(22,_23,_24,_0.2)] backdrop-blur will-change-[opacity,transform]"
          sideOffset={5}
        >
          <DropdownMenu.Item
            onClick={onDelete}
            className="flex items-center justify-start rounded-lg p-2 font-semibold text-white transition duration-100 hover:cursor-pointer hover:bg-blue-600"
          >
            <TrashIcon className="mr-2 inline-block h-5 w-5" />
            <p>Delete {name}</p>
          </DropdownMenu.Item>
          <DropdownMenu.Arrow className="fill-neutral-700" />
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};
