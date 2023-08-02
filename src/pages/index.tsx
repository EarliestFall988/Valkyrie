import Head from "next/head";
import Link from "next/link";
import { api } from "~/utils/api";
import { ArrowRightIcon } from "@heroicons/react/24/outline";

export default function Home() {
  const hello = api.example.hello.useQuery({ text: "from tRPC" });

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
      <main className="flex min-h-screen items-center justify-center bg-black">
        <Link href="/dashboard">
          <div className="group relative">
            <div className="absolute -inset-0.5 rounded-lg bg-gradient-to-r from-red-500 to-purple-600 opacity-75 blur transition duration-1000 group-hover:opacity-100 group-hover:duration-200"></div>
            <div className="relative flex items-center gap-2 rounded-lg bg-black px-7 py-4 text-lg font-semibold leading-none">
              <p className="text-gray-300 transition duration-200 group-hover:text-gray-100">
                Go to Dashboard
              </p>
              <ArrowRightIcon className="h-6 w-6 text-gray-300 transition duration-200 group-hover:text-gray-100" />
            </div>
          </div>
        </Link>
      </main>
    </>
  );
}
