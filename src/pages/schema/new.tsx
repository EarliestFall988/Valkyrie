import { useAutoAnimate } from "@formkit/auto-animate/react";
import { PlusIcon } from "@heroicons/react/24/outline";
import { ArrowDownIcon, QuestionMarkIcon } from "@radix-ui/react-icons";
import { type NextPage } from "next";
import { useEffect, useState } from "react";
import { BackButtonComponent } from "~/components/backButton";
import { Glow } from "~/components/glow";
import { LoadingSmall } from "~/components/loading";
import { TooltipComponent } from "~/components/tooltip";
import { api } from "~/utils/api";

const NewJob: NextPage = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [uri, setUri] = useState("");
  const [method, setMethod] = useState("");
  const [headers, setHeaders] = useState("");
  const [body, setBody] = useState("");
  const [schema, setSchema] = useState("");

  const [isAPI, setAPI] = useState(false);

  const [fireBackButton, setFireBack] = useState(false);

  const { mutate, isLoading: isCreating } =
    api.apiSchema.createAPISchema.useMutation({
      onSuccess: () => {
        console.log("success");
        setFireBack(true);
      },
    });

  const CreateSchema = () => {
    mutate({
      name,
      description,
      schemaResult: schema,
      body,
      headers,
      method,
      uri,
    });
  };

  const [animationParent] = useAutoAnimate();

  useEffect(() => {
    if (uri !== "" || method !== "" || headers !== "" || body !== "") {
      setAPI(true);
    }
  }, [uri, method, headers, body]);

  return (
    <main>
      <div className="fixed top-0 flex w-full items-center justify-start gap-2 border border-neutral-800 bg-black/70 p-2 backdrop-blur">
        <BackButtonComponent
          fallbackRoute="/dashboard"
          fireBack={fireBackButton}
        />
        <h1 className="text-lg font-semibold">New Job</h1>
      </div>
      <div className="h-20" />
      <div ref={animationParent} className="m-0 w-full p-2 md:m-auto md:w-1/2">
        <div className="flex flex-col items-start justify-start gap-2 py-2">
          <h2 className="text-lg">Name</h2>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded bg-neutral-800 p-1 px-3 outline-none ring-2 ring-neutral-700 transition duration-200 placeholder:text-neutral-500 hover:ring-2 hover:ring-blue-500 focus:ring-2 focus:ring-blue-400"
            placeholder="name"
          />
        </div>
        <div className="flex flex-col items-start justify-start gap-2 py-2">
          <h2 className="text-lg">Description</h2>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="h-20 w-full rounded bg-neutral-800 p-3 outline-none ring-2 ring-neutral-700 transition duration-200 placeholder:text-neutral-500 hover:ring-2 hover:ring-blue-500 focus:ring-2 focus:ring-blue-400"
            placeholder="description"
          />
        </div>
        <div className="h-10" />
        <div className="flex flex-col items-start justify-start gap-2 py-2">
          <div className="flex items-center gap-2">
            <h2 className="text-lg">Schema</h2>
            <TooltipComponent
              side="top"
              content="Schema Format Example"
              description="{name: string, date: string}[]"
            >
              <div className="rounded-full bg-blue-700 p-1">
                <QuestionMarkIcon className="h-4 w-4 text-neutral-200" />
              </div>
            </TooltipComponent>
          </div>
          <input
            type="text"
            value={schema}
            onChange={(e) => setSchema(e.target.value)}
            className="w-full rounded bg-neutral-800 p-1 px-3 outline-none ring-2 ring-neutral-700 transition duration-200 placeholder:text-neutral-500 hover:ring-2 hover:ring-blue-500 focus:ring-2 focus:ring-blue-400"
            placeholder="schema"
          />
        </div>
        <div className="h-10" />
        {uri === "" && method === "" && headers === "" && body === "" && (
          <TooltipComponent
            side="bottom"
            description="Fill in some REST request details so that your server can contact a specific API (if desired)"
            content="API details"
          >
            <button
              onClick={() => {
                setAPI((prev) => !prev);
              }}
              className="flex gap-2 rounded-full p-1 px-2 transition duration-100 hover:scale-105 hover:cursor-pointer hover:bg-blue-600"
            >
              <p>For Nerds</p>
              <ArrowDownIcon
                className={`h-6 w-6 ${
                  isAPI ? "rotate-180" : ""
                } transform transition duration-200`}
              />
            </button>
          </TooltipComponent>
        )}
        <div className="h-10" />
        {isAPI && (
          <>
            <div className="flex flex-col items-start justify-start gap-2 py-2">
              <h2 className="text-lg">URI</h2>
              <input
                type="text"
                value={uri}
                onChange={(e) => setUri(e.target.value)}
                className="w-full rounded bg-neutral-800 p-1 px-3 outline-none ring-2 ring-neutral-700 transition duration-200 placeholder:text-neutral-500 hover:ring-2 hover:ring-blue-500 focus:ring-2 focus:ring-blue-400"
                placeholder="https://example.com/api/endpoint"
              />
            </div>
            <div className="flex flex-col items-start justify-start gap-2 py-2">
              <h2 className="text-lg">Method</h2>
              <input
                type="text"
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                className="w-full rounded bg-neutral-800 p-1 px-3 outline-none ring-2 ring-neutral-700 transition duration-200 placeholder:text-neutral-500 hover:ring-2 hover:ring-blue-500 focus:ring-2 focus:ring-blue-400"
                placeholder="POST"
              />
            </div>
            <div className="flex flex-col items-start justify-start gap-2 py-2">
              <h2 className="text-lg">Headers</h2>
              <input
                type="text"
                value={headers}
                onChange={(e) => setHeaders(e.target.value)}
                className="w-full rounded bg-neutral-800 p-1 px-3 outline-none ring-2 ring-neutral-700 transition duration-200 placeholder:text-neutral-500 hover:ring-2 hover:ring-blue-500 focus:ring-2 focus:ring-blue-400"
                placeholder="Content-Type: application/json"
              />
            </div>
            <div className="flex flex-col items-start justify-start gap-2 py-2">
              <h2 className="text-lg">Body</h2>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="h-20 w-full rounded bg-neutral-800 p-3 outline-none ring-2 ring-neutral-700 transition duration-200 placeholder:text-neutral-500 hover:ring-2 hover:ring-blue-500 focus:ring-2 focus:ring-blue-400"
                placeholder="{}"
              />
            </div>
            <div className="h-20" />
          </>
        )}
        <div className=" py-2">
          <div className="flex w-full items-center justify-center gap-2 p-2 text-center text-lg font-semibold ">
            <Glow>
              <button
                ref={animationParent}
                onClick={CreateSchema}
                className="flex items-center gap-2 px-7 py-2 group-hover:cursor-pointer"
              >
                {!isCreating && (
                  <>
                    <p>Create</p>
                    <PlusIcon className="h-6 w-6" />
                  </>
                )}
                {isCreating && <LoadingSmall />}
              </button>
            </Glow>
          </div>
        </div>
      </div>
    </main>
  );
};

export default NewJob;
