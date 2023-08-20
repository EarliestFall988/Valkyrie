import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { type Job } from "@prisma/client";
import { type NextPage } from "next";
import { useRouter } from "next/router";

import "reactflow/dist/style.css";
import { LoadingSmall } from "~/components/loading";
import { api } from "~/utils/api";
import { Flow } from "~/components/flow";
import { BackButtonComponent } from "~/components/backButton";

const JobPage: NextPage = () => {
  const router = useRouter();

  const { id } = router.query;

  let jobId = "";

  if (typeof id === "string") {
    jobId = id;
  }

  const {
    data: job,
    isLoading,
    isError,
  } = api.jobs.getJobById.useQuery({
    id: jobId,
  });

  if (typeof id !== "string") return null;

  return (
    <div className="h-[100vh] w-full">
      <Ribbon job={job} errorLoading={isError} loading={isLoading} />
      <KeyBindings />
      <Flow />
    </div>
  );
};

export default JobPage;

const Ribbon: React.FC<{
  job: Job | null | undefined;
  errorLoading: boolean;
  loading: boolean;
}> = ({ job, errorLoading, loading }) => {
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
