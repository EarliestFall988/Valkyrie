import { useAutoAnimate } from "@formkit/auto-animate/react";
import {
  ArrowsUpDownIcon,
  CloudIcon,
  CodeBracketIcon,
  CommandLineIcon,
  Square2StackIcon,
} from "@heroicons/react/24/outline";
import { ArrowLeftIcon, CheckIcon } from "@radix-ui/react-icons";
import { type NextPage } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { TooltipComponent } from "~/components/tooltip";

const Connection: NextPage = () => {
  const router = useRouter();

  const { id } = router.query as { id: string };

  const [code, setCode] = useState("");
  const [status, setStatus] = useState("searching");
  const [copied, setCopied] = useState(false);

  const generatedCode = () => {
    const unique = new Date().valueOf();
    return unique
      .toString()
      .substring(unique.toString().length - 6, unique.toString().length);
  };

  const copyCodeToClipboard = () => {
    void navigator.clipboard.writeText(code);
    setCopied(true);
  };

  const [animationParent] = useAutoAnimate();

  useEffect(() => {
    if (code !== "") return;

    const nextCode = generatedCode();
    setCode(nextCode);
  }, [code]);

  const goBack = () => {
    if (history.length >= 1) router.back();
    else void router.push("/dashboard");
  };

  return (
    <main className="min-h-[100vh] w-full bg-gradient-to-tr from-neutral-900 to-black">
      <div className="flex items-center justify-between p-2">
        <div className="flex items-center justify-center gap-2">
          <button onClick={goBack}>
            <ArrowLeftIcon className="h-8 w-8 text-neutral-400 hover:text-white" />
          </button>
          <h1 className="select-none text-lg font-semibold">
            Connect To Your Device
          </h1>
        </div>
      </div>
      <div className="flex flex-col gap-4 items-center justify-center w-full min-h-[90vh]">
        <p className="text-3xl">3 Main Ways to Use Valkyrie</p>
        <div className="grid w-full grid-rows-3 gap-2 lg:grid-cols-3 px-1 sm:px-10">
          <div className="rounded-2xl border border-neutral-700 bg-neutral-900 ">
            <div className="p-5">
              <div className="flex w-full select-none items-center gap-1 text-lg text-neutral-200">
                <ArrowsUpDownIcon className="h-6 w-6 text-neutral-300 2xl:h-8 2xl:w-8" />
                Paste this id into a Client App
              </div>
              <div className="flex w-full gap-3 py-2">
                <h3 className="text-lg text-neutral-300 2xl:text-2xl">{id}</h3>
                <TooltipComponent
                  content="copy pin"
                  side="right"
                  delayDuration={0}
                >
                  <button onClick={copyCodeToClipboard}>
                    <div ref={animationParent}>
                      {!copied && (
                        <Square2StackIcon className="h-4 w-4 text-neutral-300 transition duration-200 hover:scale-105 hover:text-blue-400 2xl:h-8 2xl:w-8" />
                      )}
                      {copied && (
                        <div className="flex flex-col items-center justify-center text-green-500 transition duration-200 hover:text-blue-400">
                          <CheckIcon className="h-8 w-8" />
                        </div>
                      )}
                    </div>
                  </button>
                </TooltipComponent>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-2 rounded-2xl border border-neutral-700 bg-neutral-900 p-4">
            <div className="flex w-full select-none items-center gap-1 text-lg text-neutral-200">
              <CommandLineIcon className="h-6 w-6 text-neutral-300 2xl:h-8 2xl:w-8" />
              Deploy a server (Docker)
            </div>
            <div className="flex">
              <Link
                className="w-full rounded bg-blue-700 px-2 py-1 text-center text-white transition duration-200 hover:bg-blue-600"
                href="https://github.com/EarliestFall988/Valkyrie-ASPNET-Server"
              >
                <p>Get Server</p>
              </Link>
            </div>
            <div className="flex gap-2">
              <TooltipComponent
                content="A link to your server here."
                side="bottom"
                delayDuration={0}
              >
                <input
                  type="text"
                  className="w-full rounded bg-neutral-700 px-2 outline-none ring-0 ring-blue-500 transition duration-200 hover:bg-neutral-600 hover:ring-2 hover:ring-neutral-500 focus:ring-1"
                  placeholder="https://some-server.fly.dev"
                />
              </TooltipComponent>
              <TooltipComponent
                content="Connect to your deployed server, verify connection, and sync all available functions."
                side="bottom"
              >
                <button className="rounded bg-blue-700 px-2 py-1 text-white transition duration-200 hover:bg-blue-600">
                  Sync
                </button>
              </TooltipComponent>
            </div>
          </div>
          <div className="flex flex-col gap-2 rounded-2xl border border-neutral-700 bg-neutral-900 p-4">
            <div className="flex w-full select-none items-center gap-1 text-lg text-neutral-200">
              <CloudIcon className="h-6 w-6 text-neutral-300 2xl:h-8 2xl:w-8" />
              Trigger An Azure Serverless Function (HTTPs)
            </div>
            <div className="flex gap-2">
              <TooltipComponent
                content="A link to your server here."
                side="bottom"
                delayDuration={0}
              >
                <input
                  type="text"
                  className="w-full rounded bg-neutral-700 px-2 outline-none ring-0 ring-blue-500 transition duration-200 hover:bg-neutral-600 hover:ring-2 hover:ring-neutral-500 focus:ring-1"
                  placeholder="https://some-server.fly.dev"
                />
              </TooltipComponent>
              <TooltipComponent
                content="Connect to your deployed server, verify connection, and sync all available functions."
                side="bottom"
              >
                <button className="w-1/4 rounded bg-blue-700 px-2 py-1 text-white transition duration-200 hover:bg-blue-600">
                  Test Trigger
                </button>
              </TooltipComponent>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Connection;
