import { useAutoAnimate } from "@formkit/auto-animate/react";
import { type NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { BackButtonComponent } from "~/components/backButton";
import { LoadingSmall } from "~/components/loading";
import { api } from "~/utils/api";

const NewVariableType: NextPage = () => {
  const [name, setName] = useState("");
  const [nameError, setNameError] = useState("");
  const [description, setDescription] = useState("");
  const [saveError, setSaveError] = useState("");

  const { query, back } = useRouter();

  const { id } = query as { id?: string };

  const title = "New Variable Type";

  const context = api.useContext();

  const [animationParent] = useAutoAnimate();

  const { data } = api.variableTypes.getVariableTypeByNameAndJobId.useQuery({
    jobId: id ?? "",
    key: name,
  });

  useEffect(() => {
    if (data) {
      setNameError("A variable type with that name already exists.");
    } else {
      setNameError("");
    }
  }, [data]);

  const { mutate, isLoading: isCreating } =
    api.variableTypes.createNewVariableType.useMutation({
      onSuccess: () => {
        void context.invalidate();
        void toast.success("Successfully created variable type.");
        back();
      },
      onError: (error) => {
        if (error.message) toast.error(error.message);
        else toast.error("An error occurred while creating the variable type.");

        setSaveError("An error occurred while creating the variable type.");
      },
    });

  const submit = useCallback(() => {
    console.log({ name, description });

    if (name == "") {
      setNameError("Name cannot be empty");
      return;
    }

    if (nameError) return;
    if (!id || !name || id == null || name == null) return;

    mutate({
      jobId: id ?? "",
      key: name,
      description,
    });
  }, [name, description, mutate, id, nameError]);

  return (
    <>
      <Head>
        <title>{title} | Valkyrie</title>
      </Head>
      <main className="min-h-[100vh] bg-neutral-900">
        <div className="fixed top-0 flex h-10 w-full items-center gap-2 border-b border-neutral-700 bg-neutral-800 p-2">
          <BackButtonComponent fallbackRoute="/dashboard" />
          <h1 className="text-lg font-semibold">{title}</h1>
        </div>
        <div className="h-14"></div>
        {id && (
          <>
            <div
              ref={animationParent}
              className="h-full w-full px-1 lg:m-auto lg:w-1/2"
            >
              <div className="">
                <p className="py-1 text-lg font-semibold">Name</p>
                <input
                  type="text"
                  className={`w-full rounded  bg-neutral-700 p-1 text-lg font-normal ${
                    nameError
                      ? "border-b-2 border-red-500"
                      : "border-b border-transparent"
                  } text-white outline-none ring-1 ring-neutral-600 transition duration-200 hover:ring-2 hover:ring-blue-500 focus:ring-blue-500`}
                  placeholder="What is the name of the variable type?"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              {nameError && (
                <p className="px-1 pb-3 pt-1 text-red-500">{nameError}</p>
              )}
              <div className="pb-5">
                <p className="py-1 text-lg font-semibold">Description</p>
                <textarea
                  className="w-full rounded border-none bg-neutral-700 p-1 text-lg font-normal text-white outline-none ring-1 ring-neutral-600 transition duration-200 hover:ring-2 hover:ring-blue-500 focus:ring-blue-500"
                  placeholder="Search..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <button
                onClick={submit}
                className="w-full rounded bg-blue-600 p-1 outline-none transition duration-200 hover:bg-blue-500 focus:ring-2 focus:ring-blue-500"
              >
                {isCreating && <LoadingSmall />}
                {!isCreating && <p className="text-lg font-semibold">Create</p>}
              </button>
              {saveError && (
                <p className="px-1 pb-3 pt-1 text-red-500">{saveError}</p>
              )}
            </div>
          </>
        )}
      </main>
    </>
  );
};

export default NewVariableType;
