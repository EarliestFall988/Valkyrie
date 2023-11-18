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
      <div className="flex min-h-[90vh] w-full flex-col items-center justify-center gap-4">
        <p className="select-none text-3xl">3 Main Ways to Use Valkyrie</p>
        <div className="grid w-full grid-rows-3 gap-2 px-1 sm:px-10 lg:grid-cols-3">
          <ClientAppCodeContainer id={id} />
          <DeployServerContainer />
          <TriggerFunctionContainer />
        </div>
      </div>
    </main>
  );
};

export default Connection;

const ClientAppCodeContainer: React.FC<{ id: string }> = ({ id }) => {
  // const [status, setStatus] = useState("searching");
  const [copied, setCopied] = useState(false);

  const [code, setCode] = useState("");

  const generatedCode = () => {
    const unique = new Date().valueOf();
    return unique
      .toString()
      .substring(unique.toString().length - 6, unique.toString().length);
  };

  useEffect(() => {
    if (code !== "") return;

    const nextCode = generatedCode();
    setCode(nextCode);
  }, [code]);

  const copyCodeToClipboard = () => {
    void navigator.clipboard.writeText(code);
    setCopied(true);
  };

  const [animationParent] = useAutoAnimate();

  return (
    <div className="rounded-2xl border border-neutral-700 bg-neutral-900 ">
      <div className="p-5">
        <div className="flex w-full select-none items-center gap-1 text-lg text-neutral-200">
          <ArrowsUpDownIcon className="h-6 w-6 text-neutral-300 2xl:h-8 2xl:w-8" />
          Paste this id into a Client App
        </div>
        <div className="flex w-full gap-3 py-2">
          <h3 className="text-lg text-neutral-300 2xl:text-2xl">{id}</h3>
          <TooltipComponent content="copy pin" side="right" delayDuration={0}>
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
  );
};

const DeployServerContainer = () => {
  const [uri, setUri] = useState("");
  const [serverResponse, setServerResponse] = useState("");

  const checkConnection = () => {
    if (uri === "") return console.log("no uri");

    fetch(`/api/v1/server-connect`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        uri: uri,
      },
    })
      .then((res) => res.json())
      .then((res) => {
        const data = res as { content: string };

        console.log(data);
        setServerResponse(data.content);

        alert("Server Responded: " + data.content);
      })
      .catch((err) => console.log(err));
  };

  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-neutral-700 bg-neutral-900 p-4">
      <div className="flex w-full select-none items-center gap-1 text-lg text-neutral-200">
        <CommandLineIcon className="h-6 w-6 text-neutral-300 2xl:h-8 2xl:w-8" />
        Deploy a server (Docker)
      </div>
      <div className="flex">
        <Link
          className="w-full rounded bg-blue-700 px-2 py-1 text-center text-white transition duration-200 hover:bg-blue-600"
          href="https://github.com/EarliestFall988/Valkyrie-ASPNET-Server"
          target="_blank"
        >
          <p className="select-none">Get Server</p>
        </Link>
      </div>
      <div className="flex gap-2">
        <TooltipComponent
          content="Add the base url to your server here."
          side="bottom"
          delayDuration={0}
        >
          <input
            type="text"
            value={uri}
            onChange={(e) => setUri(e.target.value)}
            className="w-full rounded bg-neutral-700 px-2 outline-none ring-0 ring-blue-500 transition duration-200 hover:bg-neutral-600 hover:ring-2 hover:ring-neutral-500 focus:ring-1"
            placeholder="https://some-server.fly.dev"
          />
        </TooltipComponent>
        <TooltipComponent
          description="Connect to your deployed server, verify connection, and sync all available functions."
          content="Sync Valkyrie with your server."
          side="bottom"
        >
          <button
            onClick={checkConnection}
            className="select-none rounded bg-blue-700 px-2 py-1 text-white transition duration-200 hover:bg-blue-600"
          >
            Sync
          </button>
        </TooltipComponent>
      </div>
    </div>
  );
};

const TriggerFunctionContainer = () => {
  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-neutral-700 bg-neutral-900 p-4">
      <div className="flex w-full select-none items-center gap-1 text-lg text-neutral-200">
        <CloudIcon className="h-6 w-6 text-neutral-300 2xl:h-8 2xl:w-8" />
        Trigger An Azure Serverless Function (HTTPs)
      </div>
      <div className="flex gap-2">
        <TooltipComponent
          content="Put the url to your function trigger here."
          side="bottom"
          delayDuration={0}
        >
          <input
            type="text"
            className="w-full rounded bg-neutral-700 px-2 outline-none ring-0 ring-blue-500 transition duration-200 hover:bg-neutral-600 hover:ring-2 hover:ring-neutral-500 focus:ring-1"
            placeholder="https://sometrigger.azurewebsites.net/"
          />
        </TooltipComponent>
        <TooltipComponent
          content="What kind of method is your function expecting?"
          side="bottom"
          delayDuration={0}
        >
          <input
            type="text"
            className="w-full rounded bg-neutral-700 px-2 outline-none ring-0 ring-blue-500 transition duration-200 hover:bg-neutral-600 hover:ring-2 hover:ring-neutral-500 focus:ring-1"
            placeholder="GET"
          />
        </TooltipComponent>
      </div>
      <TooltipComponent
        description="Valkyrie will fire a simple GET request to see if the function is available."
        content="Trigger the function."
        side="bottom"
      >
        <button className="w-1/4 rounded bg-blue-700 px-2 py-1 text-white transition duration-200 hover:bg-blue-600">
          Test Trigger
        </button>
      </TooltipComponent>
    </div>
  );
};
