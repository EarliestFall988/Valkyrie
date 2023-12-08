import { PlusIcon } from "@radix-ui/react-icons";
import { type NextPage } from "next";
import Head from "next/head";
import { BackButtonComponent } from "~/components/backButton";

const ComplexTypePage: NextPage = () => {
  return (
    <>
      <Head>
        <title>Managing Complex Types | Valkyrie</title>
      </Head>
      <main className="min-h-[100vh] bg-neutral-900">
        <div className="fixed top-0 flex h-10 w-full items-center gap-2 border-b border-neutral-700 bg-neutral-800 p-2">
          <BackButtonComponent fallbackRoute="/dashboard" />
          <h1 className="text-lg font-semibold">Manage Complex Types</h1>
        </div>
        <div className="h-14"></div>
        <div className="h-full w-full lg:m-auto lg:w-1/2">
          <div className="flex items-center gap-2 pb-5">
            <input
              className="w-full rounded border-none bg-neutral-700 p-1 text-lg font-normal text-white outline-none ring-1 ring-neutral-600 transition duration-200 hover:ring-2 hover:ring-blue-500 focus:ring-blue-500"
              placeholder="Search..."
            />

            <button className="rounded border border-neutral-300 p-2 text-neutral-300 transition duration-200 hover:border-neutral-100 hover:text-neutral-100">
              <PlusIcon className="h-5 w-5" />
            </button>
          </div>
          <div className="rounded bg-neutral-700 p-2">test</div>
        </div>
      </main>
    </>
  );
};

export default ComplexTypePage;


