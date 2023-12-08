import { CubeIcon, ListBulletIcon, PlusIcon } from "@radix-ui/react-icons";
import { type NextPage } from "next";
import Head from "next/head";
import React, { type ReactNode, useState, useEffect, useCallback } from "react";
import * as Popover from "@radix-ui/react-popover";
import { TooltipComponent } from "~/components/tooltip";
import { BackButtonComponent } from "~/components/backButton";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { getId } from "~/flow/flow";

import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

const ComplexTypePage: NextPage = () => {
  return (
    <>
      <Head>
        <title>New ComplexType | Valkyrie</title>
      </Head>
      <main className="min-h-[100vh] bg-neutral-900">
        <div className="fixed top-0 flex h-10 w-full items-center gap-2 border-b border-neutral-700 bg-neutral-800 p-2">
          <BackButtonComponent fallbackRoute="/dashboard" />
          <h1 className="text-lg font-semibold">Create New Complex Type</h1>
        </div>
        <div className="h-14" />
        <div className="flex items-start justify-center">
          <div className="w-full lg:w-1/2">
            <NewComplexTypeDialog />
          </div>
        </div>
      </main>
    </>
  );
};

export default ComplexTypePage;

const NewComplexTypeDialog: React.FC = ({}) => {
  const SaveType = () => {
    console.log("save");
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">New Complex Type</h1>
        {/* <Dialog.Close asChild>
            <button className="rounded p-2 text-neutral-300 transition duration-200 hover:border-neutral-100 hover:text-neutral-100">
              <XMarkIcon className="h-5 w-5" />
            </button>
          </Dialog.Close> */}
      </div>

      <div>
        <p className="pt-5 text-lg font-semibold">Name</p>
        <input
          type="text"
          placeholder="Name"
          className="w-full rounded border-none bg-neutral-700 p-1 text-lg font-normal text-white outline-none ring-1 ring-neutral-600 transition duration-200 hover:ring-2 hover:ring-blue-500 focus:ring-blue-500"
        />
      </div>
      <div>
        <p className="pt-5 text-lg font-semibold">Description</p>
        <textarea
          placeholder="Description"
          className="w-full rounded border-none bg-neutral-700 p-1 text-lg font-normal text-white outline-none ring-1 ring-neutral-600 transition duration-200 hover:ring-2 hover:ring-blue-500 focus:ring-blue-500"
        />
      </div>

      <p className="pt-5 text-lg font-semibold">Type</p>
      <TypeEditor />

      {/* <div className="flex items-center justify-end gap-2 pt-5">
          <Dialog.Close asChild>
            <div className="flex w-32 cursor-pointer items-center justify-center gap-2 rounded bg-neutral-700 p-2 font-semibold outline-none hover:bg-neutral-600 focus:bg-neutral-600">
              <XMarkIcon className="h-5 w-5" />
              <p>Cancel</p>
            </div>
          </Dialog.Close>
          <Dialog.Close asChild>
            <button
              onClick={() => {
                SaveType();
              }}
              className="flex w-32 items-center justify-center gap-2 rounded bg-blue-700 p-2 font-semibold outline-none hover:bg-blue-600 focus:bg-blue-600"
            >
              <CloudArrowUpIcon className="h-5 w-5" />
              <p>Save</p>
            </button>
          </Dialog.Close>
        </div> */}
    </>
  );
};

type ComplexType = Primitive | ObjType | ListType;
type PrimitiveType = "text" | "number" | "int" | "boolean";

type Primitive = {
  id: string;
  name: string;
  primType: PrimitiveType;
};

type ObjType = {
  id: string;
  name: string;
  fields: string[];
  remove: (id: string) => void;
};

type ListType = {
  id: string;
  name: string;
  type: string | null;
  remove: (id: string) => void;
};

const isList = (input: ComplexType): input is ListType => {
  return (input as ListType).type !== undefined;
};

const isObj = (input: ComplexType): input is ObjType => {
  return (input as ObjType).fields !== undefined;
};

const isPrim = (input: ComplexType): input is Primitive => {
  return (input as Primitive).primType !== undefined;
};

interface ComplexTypeStore {
  data: ComplexType[];
  append: (c: ComplexType[]) => void;
}

const useStore = create<ComplexTypeStore>()((set) => ({
  data: [],
  append: (c) => set((state) => ({ data: [...state.data, ...c] })),
}));

const TypeEditor = () => {
  //   const [complexTypeResult, setComplexTypeResult] = useState<
  //     ComplexType[] | null
  //   >();

  const [data, append] = useStore((state) => [state.data, state.append]);

  const setFirstComplexTypeResult = useCallback(
    (c: ComplexType) => {
      append([c]);
    },
    [append]
  );

  return (
    <div className="flex h-60 items-start gap-2 overflow-auto rounded bg-black/50 p-4 pt-5">
      {data.length > 0 && data[0] ? (
        <SetNextComplexAsChild c={data[0].id} />
      ) : (
        <div className="flex items-center justify-center gap-1 rounded p-1 font-semibold outline-none">
          <NewComplexTypePopover AddNewType={setFirstComplexTypeResult} />
        </div>
      )}
    </div>
  );
};

const PrimitiveBubble: React.FC<{ prim: Primitive }> = ({ prim }) => {
  return (
    <div className="gap-1 rounded bg-neutral-800 p-1 font-semibold outline-none">
      <p>&apos;{prim.name}&apos;</p>
      <p className="text-sm text-neutral-200">({prim.primType})</p>
    </div>
  );
};

const SetNextComplexAsChild: React.FC<{ c: string }> = ({ c }) => {
  const [data, append] = useStore((state) => [state.data, state.append]);

  const result = data.find((item) => item.id === c);

  if (!result) {
    return <div>err</div>;
  }

  if (isPrim(result)) {
    return <PrimitiveBubble prim={result} />;
  } else if (isObj(result)) {
    return <ObjectBubble input={result} />;
  } else if (isList(result)) {
    return <ListObjectBubble input={result} />;
  }

  return <div>err</div>;
};

const ObjectBubble: React.FC<{ input: ObjType }> = ({ input }) => {
  const [animationParent] = useAutoAnimate();

  //   const [data, append, remove] = useStore((state) => [
  //     state.data,
  //     state.append,
  //     state.remove,
  //   ]);

  return (
    <div className="border border-dotted border-neutral-600 p-1 font-semibold outline-none">
      <p className="flex items-center gap-2 p-0 text-neutral-300 transition-all duration-200 hover:p-2">
        <CubeIcon className="h-5 w-5" />
        &apos;
        {input.name}&apos;
      </p>
      <div
        ref={animationParent}
        className="flex flex-row items-start justify-start gap-2"
      >
        <NewComplexTypePopover
          AddNewType={(e) => {
            // append([e]);
            console.log(e);
          }}
        />
        {input.fields.map((item, index) => (
          <SetNextComplexAsChild c={item} key={index} />
        ))}
      </div>
    </div>
  );
};

const ListObjectBubble: React.FC<{ input: ListType }> = ({ input }) => {
  const item = input.type;

  //   const [data, append, remove] = useStore((state) => [
  //     state.data,
  //     state.append,
  //     state.remove,
  //   ]);

  return (
    <div className="h-full rounded-lg border border-neutral-600 p-1 font-semibold outline-none">
      <p className="flex items-center gap-2 p-0 text-neutral-300 transition-all duration-200 hover:p-2">
        <ListBulletIcon className="h-5 w-5" />
        &apos;
        {input.name}&apos;
      </p>
      {item != null ? (
        <SetNextComplexAsChild c={item} />
      ) : (
        <NewComplexTypePopover
          AddNewType={(e) => {
            // append([e]);
            console.log(e);
          }}
        />
      )}
    </div>
  );
};

// const NewComplexTypePopover: FC<{
//   NewComplexType: (e: ComplexType) => void;
// }> = ({ NewComplexType }) => {
//   const [open, setOpen] = useState(false);

//   return <NewTypePopover></NewTypePopover>;
// };

const NewComplexTypePopover: React.FC<{
  AddNewType: (c: ComplexType) => void;
}> = ({ AddNewType }) => {
  const [selectedType, setSelectedType] = useState<string>("variable");
  const [variableType, setVariableType] = useState<string>("text");
  const [name, setName] = useState<string>("NewVariable");

  const [animationParent] = useAutoAnimate();

  const SaveType = () => {
    if (selectedType === "variable") {
      if (variableType === "text") {
        AddNewType({
          id: getId(),
          name,
          primType: "text",
        });
      } else if (variableType === "boolean") {
        AddNewType({
          id: getId(),
          name,
          primType: "boolean",
        });
      } else if (variableType === "number") {
        AddNewType({
          id: getId(),
          name,
          primType: "number",
        });
      }
    } else if (selectedType === "list") {
      AddNewType({
        id: getId(),
        name: "NewList",
        type: null,
        remove(id) {
          console.log("remove", id);
        },
      });
    } else if (selectedType === "container") {
      AddNewType({
        id: getId(),
        name,
        fields: [],
        remove(id) {
          console.log("remove", id);
        },
      });
    }
  };

  return (
    <Popover.Root>
      {/* <Popover.Anchor /> */}
      <TooltipComponent content="Quick Settings" side="top">
        <Popover.Trigger asChild>
          <div className="flex items-center justify-center gap-2 rounded bg-transparent p-1 font-semibold outline-none transition duration-200 hover:bg-neutral-600 focus:bg-neutral-600">
            <PlusIcon className="h-6 w-6" />
          </div>
        </Popover.Trigger>
      </TooltipComponent>
      <Popover.Portal>
        <Popover.Content className="z-50 w-72 animate-popover rounded-lg border border-neutral-700 bg-neutral-900/50 p-3 backdrop-blur">
          <div ref={animationParent} className="flex flex-col gap-2">
            <p>Add New Type</p>
            <div>
              <TabButton
                roundedLeft
                name="variable"
                currentSelectedName={selectedType}
                onSelect={setSelectedType}
              >
                Variable
              </TabButton>
              <TabButton
                leftLine
                name="list"
                currentSelectedName={selectedType}
                onSelect={setSelectedType}
              >
                List
              </TabButton>
              <TabButton
                roundedRight
                leftLine
                name="container"
                currentSelectedName={selectedType}
                onSelect={setSelectedType}
              >
                Container
              </TabButton>
            </div>
            {selectedType === "variable" && (
              <div>
                <TabButton
                  roundedLeft
                  name="text"
                  currentSelectedName={variableType}
                  onSelect={setVariableType}
                >
                  Text
                </TabButton>
                <TabButton
                  leftLine
                  name="boolean"
                  currentSelectedName={variableType}
                  onSelect={setVariableType}
                >
                  Yes/No
                </TabButton>
                <TabButton
                  roundedRight
                  leftLine
                  name="number"
                  currentSelectedName={variableType}
                  onSelect={setVariableType}
                >
                  Number
                </TabButton>
              </div>
            )}
            <div className="p-1" />
            <p>Name</p>
            <input
              className="rounded bg-neutral-700 p-1 text-neutral-200 outline-none ring-1 ring-neutral-600 transition duration-200 hover:ring-2 focus:ring-blue-500"
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
              }}
            />
            <Popover.Close asChild>
              <button
                className="w-full rounded bg-blue-500 p-1"
                onClick={SaveType}
              >
                Add
              </button>
            </Popover.Close>
          </div>
          {/* <Popover.Close /> */}
          <Popover.Arrow className="fill-neutral-700" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
};

const TabButton: React.FC<{
  name: string;
  currentSelectedName: string;
  children: ReactNode;
  leftLine?: boolean;
  roundedLeft?: boolean;
  roundedRight?: boolean;
  onSelect: (result: string) => void;
}> = ({
  name,
  currentSelectedName,
  children,
  leftLine,
  roundedLeft,
  roundedRight,
  onSelect,
}) => {
  const [selected, setSelected] = useState(false);

  useEffect(() => {
    if (name === currentSelectedName) {
      setSelected(true);
    } else {
      setSelected(false);
    }
  }, [name, currentSelectedName]);

  return (
    <button
      onClick={() => {
        onSelect(name);
      }}
      className={` p-1 transition duration-200 ${
        selected ? "bg-blue-600" : "bg-neutral-700"
      } ${roundedLeft ? "rounded-l" : ""} ${roundedRight ? "rounded-r" : ""} ${
        leftLine ? "border-l border-neutral-600" : ""
      } `}
    >
      {children}
    </button>
  );
};

// const primTest = (name: string, type: PrimitiveType) => {
//     const prim: Primitive = {
//       name,
//       primType: type,
//     };

//     return prim;
//   };

//   const objTest = () => {
//     const obj: ObjType = {
//       name: "location",
//       data: [primTest("city name", "text"), primTest("degrees", "number")],
//     };

//     return obj;
//   };

//   const listTest = () => {
//     const list: ListType = {
//       name: "weather",
//       type: objTest(),
//     };

//     return list;
//   };
