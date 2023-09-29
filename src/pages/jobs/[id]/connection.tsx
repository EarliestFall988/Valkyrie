import { useAutoAnimate } from "@formkit/auto-animate/react";
import { Square2StackIcon } from "@heroicons/react/24/outline";
import { ArrowLeftIcon, CheckIcon } from "@radix-ui/react-icons";
import { type NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

const Connection: NextPage = () => {
  const router = useRouter();

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
    <main className="min-h-[100vh] w-full">
      <div className="flex items-center justify-between p-2">
        <div className="flex items-center justify-center gap-2">
          <button onClick={goBack}>
            <ArrowLeftIcon className="h-8 w-8 text-neutral-400 hover:text-white" />
          </button>
          <h1 className="select-none text-lg font-semibold">Connection Code</h1>
        </div>
      </div>
      <div className="flex h-full w-full items-center justify-center p-10">
        <div className="rounded-md border border-neutral-700 bg-neutral-900 p-4 lg:w-1/2">
          <div className="p-5">
            <p className="w-full select-none text-center text-lg text-neutral-400">
              Paste this pin into your state machine
            </p>
            <div className="flex w-full items-center justify-center gap-3">
              <h3 className="font-mono text-4xl font-bold">{code}</h3>
              <button onClick={copyCodeToClipboard}>
                <div ref={animationParent}>
                  {!copied && (
                    <Square2StackIcon className="h-8 w-8 text-neutral-300 transition duration-200 hover:scale-105 hover:text-purple-400" />
                  )}
                  {copied && (
                    <div className="flex flex-col items-center justify-center text-green-500 transition duration-200 hover:text-purple-400">
                      <CheckIcon className="h-8 w-8" />
                    </div>
                  )}
                </div>
              </button>
            </div>
            <div className="m-auto my-6 w-1/2 border-t border-neutral-700" />
            {/* <div ref={animationParent} className="select-none">
              {status === "searching" && (
                <div className="flex w-full items-center justify-center gap-3 font-mono text-green-500">
                  <p className="animate-spin">{"¡"}</p>
                  <p>Searching</p>
                </div>
              )}
              {status === "connecting" && (
                <div className="flex w-full items-center justify-center gap-3 font-mono text-yellow-500">
                  <p className="animate-spin">{"~"}</p>
                  <p>Connecting</p>
                </div>
              )}
              {status === "error" && (
                <div className="flex w-full items-center justify-center gap-3 font-mono text-red-500">
                  <p>Error!</p>
                </div>
              )}
              {status === "connected" && (
                <div className="flex w-full items-center justify-center gap-3 font-mono text-blue-500">
                  <p>Connected!</p>
                </div>
              )}
            </div> */}
          </div>
        </div>
      </div>
    </main>
  );
};

export default Connection;
