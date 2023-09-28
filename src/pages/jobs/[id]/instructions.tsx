import {
  CloudArrowUpIcon,
  ExclamationTriangleIcon,
  SignalIcon,
} from "@heroicons/react/24/outline";
import { type CustomFunction, type Variables, type Job } from "@prisma/client";
import { type NextPage } from "next";
import { useRouter } from "next/router";

import "reactflow/dist/style.css";
import { LoadingSmall } from "~/components/loading";
import { api } from "~/utils/api";
import { Flow } from "~/flow/flow";
import { BackButtonComponent } from "~/components/backButton";
import { useMemo, useState } from "react";
import Link from "next/link";

const JobPage: NextPage = () => {
  const router = useRouter();

  const { id } = router.query;

  let jobId = "";

  if (typeof id === "string") {
    jobId = id;
  }

  const [customFunctions, setCustomFunctions] = useState<CustomFunction[]>([]);
  const [variables, setVariables] = useState<Variables[]>([]);
  const [jobHasLoaded, setJobHasLoaded] = useState(false);

  const {
    data: job,
    isLoading,
    isError,
  } = api.jobs.getJobById.useQuery({
    id: jobId,
  });

  const { mutate: updateJob } = api.jobs.updateJob.useMutation({
    onSuccess: () => {
      console.log("success");
    },
    onError: (error) => {
      console.log("err", error);
    },
  });

  useMemo(() => {
    if (job === undefined || job === null) return;

    if (jobHasLoaded) return;

    const reactflowinstance = job.data;

    if (!reactflowinstance) return;

    console.log("job data", reactflowinstance);

    setCustomFunctions(job.customFunctions);
    setVariables(job.variables);
    setJobHasLoaded(true);
  }, [job, jobHasLoaded]);

  if (typeof id !== "string") return null;

  const saveBot = () => {
    if (job === null || job === undefined) return;

    updateJob({
      id: jobId,
      title: job.title,
      description: job.description ?? undefined,
      jobData: job.data,
    });
  };

  return (
    <div className="h-[100vh] w-full">
      <Ribbon
        save={saveBot}
        job={job}
        errorLoading={isError}
        loading={isLoading}
      />
      <KeyBindings />
      <Flow id={id} />
    </div>
  );
};

export default JobPage;

const Ribbon: React.FC<{
  job: Job | null | undefined;
  errorLoading: boolean;
  loading: boolean;
  save: () => void;
}> = ({ job, errorLoading, loading, save }) => {
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
                  <Link
                  href={`/jobs/${job.id}/connection`}
                    className="rounded bg-neutral-700 p-1 transition duration-100 hover:scale-105 hover:bg-purple-600 focus:bg-purple-500"
                  >
                    <SignalIcon className="h-6 w-6" />
                  </Link>
                  <button
                    onClick={save}
                    className="rounded bg-neutral-700 p-1 transition duration-100 hover:scale-105 hover:bg-purple-600 focus:bg-purple-500"
                  >
                    <CloudArrowUpIcon className="h-6 w-6" />
                  </button>
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
