import {
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
import { useState } from "react";
import { type Job } from "@prisma/client";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { TooltipComponent } from "~/components/tooltip";
import { DashboardHeader } from "~/components/dashboardHeader";

dayjs.extend(relativeTime);

const Schema: NextPage = () => {
  const {
    data: jobs,
    isLoading: loadingJobs,
    isError: errorLoadingJobs,
  } = api.jobs.getAllJobs.useQuery({});

  const jobContext = api.useContext().jobs;

  const [animationParent] = useAutoAnimate();

  const {
    mutate: deleteJobs,
    isLoading: isDeleting,
    isError: errorDeleting,
  } = api.jobs.deleteJob.useMutation({
    onSuccess: () => {
      console.log("success");
      void jobContext.invalidate();
    },
    onError: (error) => {
      console.log(error);
    },
  });

  const loading = loadingJobs;
  const errorLoading = errorLoadingJobs || errorDeleting;

  const [canDelete, setCanDelete] = useState(false);

  const ToggleCanDelete = () => {
    setCanDelete((prev) => !prev);
  };

  const [jobsToDelete, setJobsToDelete] = useState<Job[]>([]);

  // console.log(jobsToDelete);

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
                      deleteJobs(jobsToDelete);
                      setCanDelete(false);
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

          <div
            ref={animationParent}
            className={`w-full ${
              !loading && !errorLoading
                ? "grid grid-flow-row lg:grid-cols-2 2xl:grid-cols-3"
                : ""
            } gap-2 lg:grid-cols-2 2xl:grid-cols-3`}
          >
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
            {!loading && !errorLoading && jobs && jobs.length !== 0 && (
              <div>test</div>
            )}
          </div>
        </div>
      </main>
    </>
  );
};



export default Schema;
