import {
  CpuChipIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  QueueListIcon,
  TrashIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { UserButton } from "@clerk/clerk-react";
import { api } from "~/utils/api";
import { Loading } from "~/components/loading";
import { useState } from "react";
import { type Job } from "@prisma/client";
import { useAutoAnimate } from "@formkit/auto-animate/react";

const Dashboard: NextPage = () => {
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

  const addJobToDelete = (id: string) => {
    const job = jobs?.find((job) => job.id === id);
    if (!job) return;
    setJobsToDelete((prev) => [...prev, job]);
  };

  const removeJobToDelete = (id: string) => {
    setJobsToDelete((prev) => prev.filter((job) => job.id !== id));
  };

  console.log(jobsToDelete);

  return (
    <>
      <Head>
        <title>Dashboard - Valkyrie</title>
        <meta
          name="description"
          content="Pull data by building digital workers"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="text-white">
        <div className="fixed flex w-full select-none items-center justify-between gap-4 border-b border-neutral-900 bg-black/70 p-2 backdrop-blur">
          <div className="flex items-center justify-center gap-2">
            <QueueListIcon className="h-6 w-6" />
            <h1 className="text-lg font-semibold">Dashboard</h1>
          </div>
          <div className="flex items-center justify-center gap-4">
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
        <div className="h-[8vh]" />
        <div className="flex w-full flex-col gap-2 rounded-lg p-2 md:m-auto md:w-1/2">
          <div className="flex items-center justify-between gap-5">
            <h3 className="select-none text-3xl font-semibold">Bots</h3>
            <div className="flex items-center justify-center gap-2">
              <Link href="/jobs/new">
                <div className="flex select-none items-center justify-center gap-2 rounded border border-transparent p-2 transition duration-200 hover:cursor-pointer hover:border-purple-500 hover:text-purple-500">
                  <p>Add</p>
                  <PlusIcon className="h-6 w-6" />
                </div>
              </Link>

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
                      : "hover:border-purple-500 hover:text-purple-500"
                  }`}
                >
                  <p>Delete</p>
                  <TrashIcon className="h-6 w-6" />
                </div>
              </button>
              {canDelete && (
                <button onClick={ToggleCanDelete}>
                  <div className="flex select-none items-center justify-center gap-2 rounded border border-transparent p-2 transition duration-200 hover:cursor-pointer hover:border-purple-500 hover:text-purple-500">
                    <XMarkIcon className="h-6 w-6" />
                  </div>
                </button>
              )}
            </div>
          </div>

          <div
            ref={animationParent}
            className={`w-full ${
              !loading && !errorLoading ? "grid grid-flow-row grid-cols-2" : ""
            } gap-2 md:grid-cols-3`}
          >
            {loading && !errorLoading && (
              <div className="flex h-full w-full items-center justify-center">
                <Loading />
              </div>
            )}
            {!loading && errorLoading && (
              <div className="flex h-[30vh] items-center justify-center gap-2">
                <p className="text-2xl font-semibold text-red-300">
                  Error Loading Jobs
                </p>
                <ExclamationTriangleIcon className="h-6 w-6 rotate-3 text-red-500" />
              </div>
            )}
            {!loading && !errorLoading && jobs && jobs.length !== 0 && (
              <>
                {jobs?.map((job) => (
                  <JobCard
                    key={job.id}
                    showDeletion={canDelete}
                    job={job}
                    addJobToDelete={addJobToDelete}
                    removeJobToDelete={removeJobToDelete}
                    isDeleting={isDeleting}
                  />
                ))}
              </>
            )}
          </div>
        </div>
      </main>
    </>
  );
};

const JobCard: React.FC<{
  job: Job;
  showDeletion: boolean;
  addJobToDelete: (id: string) => void;
  removeJobToDelete: (id: string) => void;
  isDeleting: boolean;
}> = ({ job, showDeletion, addJobToDelete, removeJobToDelete, isDeleting }) => {
  const [markedForDeletion, setMarkedForDeletion] = useState(false);

  const ToggleMarkedForDeletion = () => {
    if (markedForDeletion) {
      removeJobToDelete(job.id);
    }

    if (!markedForDeletion) {
      addJobToDelete(job.id);
    }

    setMarkedForDeletion((prev) => !prev);
  };

  return (
    <Link
      href={`/jobs/${job.id}`}
      className="flex h-56 select-none items-start justify-between rounded-lg border border-neutral-900 p-4 transition duration-200 hover:border-neutral-800"
    >
      {isDeleting && markedForDeletion ? (
        <div className="flex h-full w-full items-center justify-center">
          <Loading />
        </div>
      ) : (
        <>
          <div>
            <div className="flex items-center justify-center gap-2">
              <CpuChipIcon className="h-5 w-5 translate-y-[2px] text-amber-200" />
              <p className="text-2xl font-semibold">{job.title}</p>
            </div>
            <p className="text-neutral-400">{job.description}</p>
          </div>
          {showDeletion && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                ToggleMarkedForDeletion();
              }}
            >
              <TrashIcon
                className={`h-6 w-6 transition duration-200  ${
                  markedForDeletion
                    ? "hover:text-300 text-red-500"
                    : "text-neutral-700 hover:text-neutral-500"
                }`}
              />
            </button>
          )}
        </>
      )}
    </Link>
  );
};

export default Dashboard;
