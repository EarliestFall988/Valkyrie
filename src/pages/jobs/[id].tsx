import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { type Job } from "@prisma/client";
import { type NextPage } from "next";
import { useRouter } from "next/router";

import "reactflow/dist/style.css";
import { LoadingSmall } from "~/components/loading";
import { api } from "~/utils/api";
import { Flow } from "~/components/flow";

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
    <div className="fixed top-0 z-20 w-full border-b border-neutral-700 bg-neutral-800 p-2">
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
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <p className="text-lg font-semibold">{job?.title}</p>
                <p className="text-lg text-gray-400">{job?.id}</p>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
