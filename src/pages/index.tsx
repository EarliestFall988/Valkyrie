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
      <main className="min-h-[95vh] bg-gradient-to-r from-transparent to-neutral-900">
        <h1 className="fixed left-0 top-0 -z-10 inline-block translate-x-[-300px] translate-y-[-200px] text-[40em] font-bold text-neutral-900">
          Valkyrie
        </h1>
        <div className="w-full border-b border-neutral-900 p-2 text-white">
          <UserButton afterSignOutUrl="/sign-in" />
        </div>
        <div className="flex h-[80vh] w-full ">
          <div className="m-auto flex w-2/3 flex-col items-start justify-center gap-7 ">
            <div className="flex flex-col gap-2 text-white">
              <div>
                <h1 className="inline-block bg-neutral-200 bg-clip-text text-[5em] font-bold text-transparent md:text-[8em]">
                  Valkyrie
                </h1>
              </div>
            </div>
            <div className="px-8">
              <SignedOut>
                <Link href="/sign-in">
                  <div className="group relative">
                    <div className="absolute -inset-0.5 rounded-lg bg-gradient-to-r from-blue-500 to-green-600 opacity-75 blur transition duration-1000 group-hover:opacity-100 group-hover:duration-200"></div>
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
                    <div className="absolute -inset-0.5 rounded-lg bg-gradient-to-r from-blue-500 to-green-600 opacity-75 blur transition duration-1000 group-hover:opacity-100 group-hover:duration-200"></div>
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
        </div>
      </main>
      <footer className="flex h-[10vh] w-full items-center justify-between  bg-neutral-200 p-3 font-mono font-semibold text-neutral-700">
        <div>
          <div className="text-lg">Copyright &copy; Taylor Howell 2023</div>
          <div className="text-sm font-normal text-neutral-500">
            Fall 2023 Capstone Project
          </div>
        </div>
      </footer>
    </>
  );
}
