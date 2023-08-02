import { ArrowLeftIcon, PlusIcon } from "@heroicons/react/24/outline";
import { type NextPage } from "next";
import { useRouter } from "next/router";
import { Glow } from "~/components/glow";

const NewJob: NextPage = () => {
  const { back, push } = useRouter();

  const goBack = () => {
    if (window.history.length > 1) {
      back();
      return;
    }
    void push("/");
  };

  return (
    <main>
      <div className="fixed top-0 flex w-full items-center justify-start gap-2 border border-neutral-800 bg-black/70 p-2 backdrop-blur">
        <button
          onClick={(e) => {
            e.preventDefault();
            goBack();
          }}
          className="rounded p-1 hover:bg-neutral-900"
        >
          <ArrowLeftIcon className="h-6 w-6" />
        </button>
        <h1 className="text-lg font-semibold">New Job</h1>
      </div>
      <div className="h-20" />
      <div className="m-0 w-full md:m-auto md:w-1/2">
        <div className="flex flex-col items-start justify-start gap-2 py-2">
          <h2 className="text-lg">Name</h2>
          <input
            type="text"
            className="w-full rounded-lg bg-neutral-800 p-1 px-2 placeholder:text-neutral-300"
            placeholder="name"
          />
        </div>
        <div className="flex flex-col items-start justify-start gap-2 py-2">
          <h2 className="text-lg">Description</h2>
          <textarea
            className="h-20 w-full rounded-lg bg-neutral-800 p-2 placeholder:text-neutral-300"
            placeholder="description"
          />
        </div>
        <div className="h-20" />
        <div className=" py-2">
          <div className="flex w-full items-center justify-center gap-2 p-2 text-center text-lg font-semibold ">
            <Glow>
              <div className="flex items-center gap-2 px-7 py-2 group-hover:cursor-pointer">
                <p>Create</p>
                <PlusIcon className="h-6 w-6" />
              </div>
            </Glow>
          </div>
        </div>
      </div>
    </main>
  );
};

export default NewJob;
