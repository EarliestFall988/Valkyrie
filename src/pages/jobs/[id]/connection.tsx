import { useAutoAnimate } from "@formkit/auto-animate/react";
import {
  ArrowsUpDownIcon,
  CloudIcon,
  CommandLineIcon,
  Square2StackIcon,
} from "@heroicons/react/24/outline";
import {
  ArrowLeftIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  GitHubLogoIcon,
} from "@radix-ui/react-icons";
import { type NextPage } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState, useCallback } from "react";
import { TooltipComponent } from "~/components/tooltip";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { LoadingSmall } from "~/components/loading";
import { api } from "~/utils/api";

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
        <div className="grid w-full grid-rows-3 gap-4 px-1 transition duration-200 sm:px-10 lg:w-[80%] 2xl:w-[60%]">
          <ClientAppCodeContainer id={id} />
          <DeployServerContainer id={id} />
          <TriggerFunctionContainer />
        </div>
      </div>
      <ToastContainer />
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
          Paste this Id into Your Valkyrie App or Service
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

const DeployServerContainer: React.FC<{ id: string }> = ({ id }) => {
  const [uri, setUri] = useState("");
  const [key, setKey] = useState("");
  const [serverResponse, setServerResponse] = useState("");
  const [loading, setLoading] = useState(false);

  const { mutate: deleteAllFunctions, isLoading: deletingFunctions } =
    api.functions.deleteAllFunctionsByJobId.useMutation({
      onSuccess: () => {
        toast.success(
          "successfully deleted all functions from this instruction set"
        );
      },
      onError: () => {
        toast.error(
          "Something went wrong deleting all functions from this instruction set!"
        );
      },
    });

  const { mutate: deleteAllVariableTypes, isLoading: deletingVariableTypes } =
    api.variableTypes.deleteAllVariableTypesByJobId.useMutation({
      onSuccess: () => {
        toast.success(
          "successfully deleted all variable types from this instruction set"
        );
      },
      onError: () => {
        toast.error(
          "Something went wrong deleting all variable types from this instruction set!"
        );
      },
    });

  const checkConnection = useCallback(() => {
    if (uri === "") {
      toast("Please enter a valid URL.", {
        position: "bottom-left",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
        progressStyle: {
          background: "white",
        },
      });
      return;
    }

    setLoading(true);

    fetch(`/api/v1/server-connect`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        uri: uri,
        "x-api-key": key,
        "x-instruction-id": id ?? "",
      },
    })
      .then((res) => res.text())
      .then((res) => {
        const data = res;

        console.log(data);

        if (!data) {
          return setServerResponse("nada");
          loading && setLoading(false);
        }

        const result = JSON.parse(data) as { content: string };

        setServerResponse(result.content);
      })
      .catch((err) => {
        console.log(err);
        setServerResponse("Error: " + err);
        loading && setLoading(false);
      });
  }, [uri, key, loading, id]);

  useEffect(() => {
    if (serverResponse === "") return;
    toast("Server Response: " + serverResponse, {
      position: "bottom-left",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "dark",
      progressStyle: {
        background: "white",
      },
    });

    setLoading(false);
    setServerResponse("");
  }, [serverResponse]);

  const Reset = () => {
    const confirmationResult = confirm(
      "Deleting all functions and variable types cannot be reverted - proceed?"
    );

    if (!confirmationResult) return;

    deleteAllFunctions({
      jobId: id,
    });

    deleteAllVariableTypes({
      jobId: id,
    });
  };

  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-neutral-700 bg-neutral-900 p-4">
      <div className="flex w-full select-none items-center gap-1 text-lg text-neutral-200">
        <CommandLineIcon className="h-6 w-6 text-neutral-300 2xl:h-8 2xl:w-8" />
        Deploy a Server (Docker)
      </div>
      <div className="flex">
        <Link
          className="w-full rounded-lg bg-neutral-700 px-2 py-1 text-center text-white transition duration-200 hover:bg-neutral-600"
          href="https://github.com/EarliestFall988/Valkyrie-ASPNET-Server"
          target="_blank"
        >
          <div className="flex select-none items-center justify-center gap-2">
            <GitHubLogoIcon className="h-5 w-5" />
            <p>Download Server Code</p>
          </div>
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
            className="w-full rounded bg-neutral-700 p-2 outline-none ring-0 ring-blue-500 transition duration-200 hover:bg-neutral-600 hover:ring-2 hover:ring-neutral-500 focus:ring-1"
            placeholder="https://some-server.fly.dev"
          />
        </TooltipComponent>
        <TooltipComponent
          content="Add the api key to your server here."
          side="bottom"
          delayDuration={0}
        >
          <input
            type="text"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            className="w-full rounded bg-neutral-700 p-2 outline-none ring-0 ring-blue-500 transition duration-200 hover:bg-neutral-600 hover:ring-2 hover:ring-neutral-500 focus:ring-1"
            placeholder="api key"
            onKeyDown={(e) => {
              if (e.key === "Enter") checkConnection();
            }}
          />
        </TooltipComponent>
        <TooltipComponent
          description="Connect to your deployed server, verify connection, and download all available functions to this instruction set."
          content="Sync Valkyrie with your server."
          side="bottom"
        >
          <button
            onClick={checkConnection}
            className="select-none rounded-lg bg-blue-700 px-2 py-1 text-white outline-none transition duration-200 hover:bg-blue-600 focus:bg-blue-600"
          >
            {loading ? <LoadingSmall /> : <p>Sync</p>}
          </button>
        </TooltipComponent>
      </div>
      <div className="flex flex-col gap-2 rounded-2xl border-2 border-dotted border-red-600 p-3">
        <div className="flex items-center gap-1 font-semibold">
          <ExclamationTriangleIcon className="h-5 w-5 translate-y-[2px] text-red-600" />
          <p>Danger Zone</p>
        </div>
        <button
          onClick={Reset}
          className="rounded-lg bg-red-600 p-1 font-mono font-semibold transition duration-200 hover:bg-red-500"
        >
          {deletingFunctions || deletingVariableTypes ? (
            <LoadingSmall />
          ) : (
            <p>Delete All Functions and Variable Types Forever</p>
          )}
        </button>
      </div>
    </div>
  );
};

const TriggerFunctionContainer = () => {
  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-neutral-700 bg-neutral-900 p-4">
      <div className="flex w-full select-none items-center gap-1 text-lg text-neutral-200">
        <CloudIcon className="h-6 w-6 text-neutral-300 2xl:h-8 2xl:w-8" />
        Test a Serverless Azure Function or AWS Lambda
      </div>
      <div className="flex gap-2">
        <TooltipComponent
          content="Put the url to your function trigger here."
          side="bottom"
          delayDuration={0}
        >
          <input
            type="text"
            className="w-full rounded bg-neutral-700 p-2 outline-none ring-0 ring-blue-500 transition duration-200 hover:bg-neutral-600 hover:ring-2 hover:ring-neutral-500 focus:ring-1"
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
            className="w-full rounded bg-neutral-700 p-2 outline-none ring-0 ring-blue-500 transition duration-200 hover:bg-neutral-600 hover:ring-2 hover:ring-neutral-500 focus:ring-1"
            placeholder="GET"
          />
        </TooltipComponent>
      </div>
      <TooltipComponent
        description="Valkyrie will fire a simple request to see if the function is available."
        content="Trigger the function."
        side="bottom"
      >
        <button className="w-1/4 select-none rounded-lg bg-blue-700 p-2 text-white transition duration-200 hover:bg-blue-600">
          Test
        </button>
      </TooltipComponent>
    </div>
  );
};
