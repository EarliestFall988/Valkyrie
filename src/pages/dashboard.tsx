import { PlusIcon } from "@heroicons/react/24/outline";
import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { Glow } from "~/components/glow";
import { UserButton } from "@clerk/clerk-react";

const Dashboard: NextPage = () => {
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
        <div className="fixed flex w-full items-center justify-between gap-4 border-b border-neutral-900 bg-black/70 p-2 backdrop-blur ">
          <h1 className="text-lg">Dashboard</h1>
          <div className="flex items-center justify-center gap-4">
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
        <div className="h-[8vh]" />
        <div className="flex w-full flex-col gap-2 rounded-lg p-2 md:m-auto md:w-1/2">
          <div className="flex items-center justify-start gap-5 p-2">
            <Link href="/jobs/new">
              <Glow>
                <div className="p-2">
                  <PlusIcon className="h-6 w-6" />
                </div>
              </Glow>
            </Link>
            <h3 className="text-3xl font-semibold">Your Jobs</h3>
          </div>
          <div className="grid w-full grid-flow-row grid-cols-2 gap-2 md:grid-cols-3">
            <div className="h-56 rounded-lg border border-neutral-900 p-4 transition duration-200 hover:border-neutral-800">
              <p className="text-2xl font-semibold">Name</p>
              <p className="text-neutral-400">Description</p>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default Dashboard;
