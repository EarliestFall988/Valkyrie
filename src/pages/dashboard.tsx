import {
  ArchiveBoxArrowDownIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  QueueListIcon,
  SignalIcon,
  TrashIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { type NextPage } from "next";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import Head from "next/head";
import Link from "next/link";
import { UserButton } from "@clerk/clerk-react";
import { api } from "~/utils/api";
import { Loading } from "~/components/loading";
import { useState } from "react";
import { type Job } from "@prisma/client";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { LightningBoltIcon, Share1Icon } from "@radix-ui/react-icons";
import { TooltipComponent } from "~/components/tooltip";
import Image from "next/image";
import { DashboardHeader } from "~/components/dashboardHeader";

dayjs.extend(relativeTime);

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

  // console.log(jobsToDelete);

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
      <main className="min-h-[100vh] bg-gradient-to-bl from-black to-neutral-900 text-white">
        <DashboardHeader name={"Dashboard > Instructions"} />
        <div className="h-[8vh]" />
        <div className="flex w-full flex-col gap-2 rounded-lg p-2 md:m-auto md:w-5/6 2xl:w-2/3">
          <div className="flex items-center justify-between gap-5">
            <h3 className="select-none text-3xl font-semibold">Instructions</h3>
            <div className="flex items-center justify-center gap-2">
              <TooltipComponent side="bottom" content="Add a new instruction">
                <Link href="/jobs/new">
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
              <>
                {jobs?.map((job) => (
                  <JobCard
                    key={job.id}
                    showDeletion={canDelete}
                    job={job}
                    user={job.user}
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

type UserType = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string | undefined;
  profilePicture: string;
} | null;

const JobCard: React.FC<{
  job: Job;
  user?: UserType;
  showDeletion: boolean;
  addJobToDelete: (id: string) => void;
  removeJobToDelete: (id: string) => void;
  isDeleting: boolean;
}> = ({
  job,
  user,
  showDeletion,
  addJobToDelete,
  removeJobToDelete,
  isDeleting,
}) => {
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

  const [animationParent] = useAutoAnimate();

  const { data, isLoading } = api.functions.getFunctionCountFromJobId.useQuery({
    jobId: job.id,
  });

  const { data: versionCount, isLoading: loadingVersionCount } =
    api.schemaVersioning.getCountByJobsId.useQuery({
      jobId: job.id,
    });

  return (
    <Link
      href={`/jobs/${job.id}/instructions`}
      ref={animationParent}
      className="flex select-none items-start justify-between rounded-lg border-2 border-transparent bg-neutral-900 p-3 transition duration-200 hover:border-blue-900"
    >
      {(isDeleting && markedForDeletion) || isLoading || loadingVersionCount ? (
        <div className="flex h-full w-full items-center justify-center">
          <Loading />
        </div>
      ) : (
        <>
          <div className="flex w-full flex-col items-start justify-start gap-2">
            <div className="flex w-full flex-1 items-start justify-start border-b border-neutral-800">
              <div className="h-12 w-12 translate-y-1">
                {user?.profilePicture ? (
                  <Image
                    src={user?.profilePicture}
                    width={50}
                    height={50}
                    alt={`${user?.firstName}'s profile picture`}
                    className="h-10 w-10 rounded-full"
                  />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500 text-white">
                    <p className="text-2xl">
                      {user?.firstName?.charAt(0).toUpperCase()}
                      {user?.lastName?.charAt(0).toUpperCase()}
                    </p>
                  </div>
                )}
              </div>
              <div className="flex w-full flex-col items-start justify-start gap-2 pl-1">
                <div className="flex items-center justify-center gap-2 ">
                  <p className="text-2xl font-semibold">{job.title}</p>
                </div>
                <div className="text-md -mt-2 flex w-full items-center justify-start gap-2 pb-1 text-neutral-400">
                  <p>
                    {user?.firstName} {user?.lastName}{" "}
                  </p>
                  <p>{dayjs(job.updatedAt).fromNow()} </p>
                  <TooltipComponent
                    side="bottom"
                    content="Number of functions created in this instruction set"
                  >
                    <div className="flex items-center gap-1">
                      <LightningBoltIcon className="h-3 w-3" /> {data}
                    </div>
                  </TooltipComponent>
                </div>
              </div>
            </div>
            <div className="flex w-full">
              <div className="h-12 w-12"></div>
              {job.description ? (
                <p className="w-full font-mono text-sm text-neutral-400">
                  {job.description}
                </p>
              ) : (
                <div className="flex h-[3em] w-full font-mono text-sm italic text-neutral-500">
                  (No Description Provided)
                </div>
              )}
            </div>
            <div className="flex flex-1">
              <div className="h-12 w-12"></div>
              <div className="flex w-full items-center justify-start gap-2">
                <TooltipComponent
                  side="bottom"
                  content="Connection"
                  description="Get a connection code to connect your state machine over the internet."
                >
                  <Link
                    href={`jobs/${job.id}/connection`}
                    className=" flex gap-2  rounded-lg p-2 transition duration-200 hover:scale-105 hover:bg-neutral-800"
                  >
                    <SignalIcon className="h-6 w-6" />
                  </Link>
                </TooltipComponent>
                <TooltipComponent
                  side="bottom"
                  content="Version History"
                  description="Create versions, tag versions for production releases, and view past versions of this instruction set."
                >
                  <Link
                    href={`jobs/${job.id}/versions`}
                    className="flex gap-1 rounded-lg p-2 transition duration-200 hover:scale-105 hover:bg-neutral-800"
                  >
                    <ArchiveBoxArrowDownIcon className="h-6 w-6" />
                    <p>{versionCount}</p>
                  </Link>
                </TooltipComponent>
                <TooltipComponent
                  side="bottom"
                  content="Share"
                  description="Share an instruction set with your friends and colleagues."
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();

                      void navigator.share({
                        title: "Valkyrie",
                        text: `Check out this instruction set: ${job.title}`,
                        url: `${window.location.origin}/jobs/${job.id}/instructions`,
                      });
                    }}
                    className=" flex gap-2  rounded-lg p-2 transition duration-200 hover:scale-105 hover:bg-neutral-800"
                  >
                    <Share1Icon className="h-6 w-6" />
                  </button>
                </TooltipComponent>
              </div>
            </div>
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
                    : "text-neutral-500 hover:text-neutral-300"
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
