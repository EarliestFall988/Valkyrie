import { useAutoAnimate } from "@formkit/auto-animate/react";
import { PlusIcon } from "@radix-ui/react-icons";
import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import { BackButtonComponent } from "~/components/backButton";
import { Loading } from "~/components/loading";
import { TooltipComponent } from "~/components/tooltip";
import { api } from "~/utils/api";

const VariableTypesList: NextPage = () => {
  const title = "Managing Variable Types";

  const [searchTerm, setSearchTerm] = useState("");

  const { query } = useRouter();

  const { id } = query as { id?: string };

  const [animationParent] = useAutoAnimate();

  const { data, isLoading, isError } =
    api.variableTypes.getAllVariableTypesByJob.useQuery({
      searchTerm: searchTerm,
      jobId: id ?? "",
    });

  return (
    <>
      <Head>
        <title>Managing Variable Types | Valkyrie</title>
      </Head>
      <main className="min-h-[100vh] bg-neutral-900">
        <div className="fixed top-0 flex h-10 w-full items-center gap-2 border-b border-neutral-700 bg-neutral-800 p-2">
          <BackButtonComponent fallbackRoute="/dashboard" />
          <h1 className="text-lg font-semibold">{title}</h1>
        </div>
        <div className="h-14"></div>
        <div className="flex h-full w-full flex-col">
          <div className="flex items-center gap-2 pb-5 md:m-auto md:w-2/3 2xl:w-1/2">
            <input
              className="w-full rounded border-none bg-neutral-700 p-1 text-lg font-normal text-white outline-none ring-1 ring-neutral-600 transition duration-200 hover:ring-2 hover:ring-blue-500 focus:ring-blue-500"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <TooltipComponent
              side="bottom"
              content="Create a new variable type"
              description="If you cannot find the type of variable (e.g. float, string, boolean...) that suits your needs, you can create one here by creating a new variable type."
            >
              <Link
                href={`/jobs/${id}/vartype/new`}
                className="rounded border border-neutral-300 p-2 text-neutral-300 transition duration-200 hover:border-neutral-100 hover:text-neutral-100"
              >
                <PlusIcon className="h-5 w-5" />
              </Link>
            </TooltipComponent>
          </div>
        </div>
        <div
          ref={animationParent}
          className={`flex h-full w-full flex-col ${
            data && data.length > 0 ? "border-t border-neutral-700" : ""
          } md:m-auto md:w-2/3 2xl:w-1/2`}
        >
          {isLoading && (
            <div className="flex h-[30vh] w-full items-center justify-center rounded">
              <Loading />
            </div>
          )}
          {isError && (
            <div className="flex h-[30vh] w-full items-center justify-center rounded">
              {
                " An error occurred while fetching the data. The service might be down or your computer is not connected to the internet :("
              }
            </div>
          )}
          {data && data.length > 0 && (
            <>
              {data.map((variableType) => (
                <Link
                  href={`/jobs/${id}/vartype/${variableType.id}`}
                  className="w-full border-x border-b border-neutral-700 p-2 transition duration-200 hover:bg-neutral-800"
                  key={variableType.id}
                >
                  <p className="text-lg font-semibold">
                    {variableType.typeName}
                  </p>
                  <p className="font-mono tracking-tight text-neutral-400">
                    {variableType.description}
                  </p>
                </Link>
              ))}
            </>
          )}
          {(!data || data.length < 1) && !isLoading && !isError && (
            <div className="rounded p-2 text-center text-lg font-semibold">
              No variable types found.
            </div>
          )}
        </div>
      </main>
    </>
  );
};

export default VariableTypesList;
