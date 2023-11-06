import { PlusIcon } from "@heroicons/react/24/outline";
import { type NextPage } from "next";
import { useState } from "react";
import { BackButtonComponent } from "~/components/backButton";
import { Glow } from "~/components/glow";
import { api } from "~/utils/api";

const NewJob: NextPage = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const [fireBackButton, setFireBack] = useState(false);

  const { mutate } = api.jobs.createJob.useMutation({
    onSuccess: () => {
      console.log("success");
      setFireBack(true);
    },
  });

  const CreateJob = () => {
    mutate({
      title: name,
      description,
    });
  };

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
      <div className="m-0 w-full p-2 md:m-auto md:w-1/2">
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
        <div className="h-20" />
        <div className=" py-2">
          <div className="flex w-full items-center justify-center gap-2 p-2 text-center text-lg font-semibold ">
            <Glow>
              <button
                onClick={() => {
                  CreateJob();
                }}
                className="flex items-center gap-2 px-7 py-2 group-hover:cursor-pointer"
              >
                <p>Create</p>
                <PlusIcon className="h-6 w-6" />
              </button>
            </Glow>
          </div>
        </div>
      </div>
    </main>
  );
};

export default NewJob;
