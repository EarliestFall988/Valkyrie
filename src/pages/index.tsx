import Head from "next/head";
import Link from "next/link";
import { ArrowRightIcon } from "@heroicons/react/24/outline";
import { UserButton, SignedIn, SignedOut } from "@clerk/clerk-react";

export default function Home() {
  // const hello = api.example.hello.useQuery({ text: "from tRPC" });

  // const { user } = useUser();

  return (
    <>
      <Head>
        <title>Valkyrie</title>
        <meta
          name="description"
          content="Pull data by building digital workers"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="min-h-screen bg-black">
        <div className="w-full border-b border-neutral-900 p-2 text-white">
          <UserButton afterSignOutUrl="/sign-in" />
        </div>
        <div className="flex h-[80vh] w-full ">
          <div className="m-auto flex w-1/2 flex-col items-start justify-center gap-7">
            <div className="flex flex-col gap-2 text-white">
              <div>
                <h1 className="inline-block bg-gradient-to-r from-purple-500 to-red-500 bg-clip-text text-[3em] font-bold text-transparent md:text-6xl">
                  Valkyrie
                </h1>
              </div>
              <h2 className="text-3xl font-semibold">
                Pull data by building digital workers
              </h2>
              <p className="text-xl">
                Valkyrie is a tool that allows you to build digital workers that
                can pull data from anywhere and send it anywhere.
              </p>
              <p className="text-xl">Valkyrie is currently in alpha.</p>
            </div>
            <SignedOut>
              <Link href="/sign-in">
                <div className="group relative">
                  <div className="absolute -inset-0.5 rounded-lg bg-gradient-to-r from-red-500 to-purple-600 opacity-75 blur transition duration-1000 group-hover:opacity-100 group-hover:duration-200"></div>
                  <div className="relative flex items-center gap-2 rounded-lg bg-black px-7 py-4 text-lg font-semibold leading-none">
                    <p className="text-gray-300 transition duration-200 group-hover:text-gray-100">
                      Sign in
                    </p>
                  </div>
                </div>
              </Link>
            </SignedOut>
            <SignedIn>
              <Link href="/dashboard">
                <div className="group relative">
                  <div className="absolute -inset-0.5 rounded-lg bg-gradient-to-r from-red-500 to-purple-600 opacity-75 blur transition duration-1000 group-hover:opacity-100 group-hover:duration-200"></div>
                  <div className="relative flex items-center gap-2 rounded-lg bg-black px-7 py-4 text-lg font-semibold leading-none">
                    <p className="text-gray-300 transition duration-200 group-hover:text-gray-100">
                      Go To Dashboard
                    </p>
                    <ArrowRightIcon className="h-6 w-6 text-gray-300 transition duration-200 group-hover:text-gray-100" />
                  </div>
                </div>
              </Link>
            </SignedIn>
          </div>
        </div>
      </main>
    </>
  );
}
