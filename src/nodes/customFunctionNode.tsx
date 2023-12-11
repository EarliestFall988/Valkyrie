import { Handle, Position } from "reactflow";
import { api } from "~/utils/api";
import { type functionMetaData } from "~/flow/flow";
import { TooltipTrigger } from "@radix-ui/react-tooltip";
import { TooltipComponent } from "~/components/tooltip";
import { CamelCaseToNormal } from "~/pages/jobs/[id]/instructions";
import { LoadingSmall } from "~/components/loading";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { SignalSlashIcon } from "@heroicons/react/24/outline";
import { useEffect, useMemo, useState } from "react";
import { type VariableType } from "@prisma/client";

// const handleStyle = {
//   top: 10,
//   background: "#fff",
//   border: 0,
//   borderRadius: 0,
// };

type nodeData = {
  data: functionMetaData;
};

export const CustomFunction = (props: nodeData) => {
  // console.log(props.data);

  const [varTypes, setVarTypes] = useState<VariableType[]>([]);

  const [animationParent] = useAutoAnimate();

  const { data, isLoading, isError } = api.functions.getFunctionById.useQuery({
    id: props.data.id,
  });

  const { data: varTypeData } =
    api.variableTypes.getAllVariableTypesByJob.useQuery({
      jobId: data?.jobId ?? "",
    });

  useMemo(() => {
    const varTypeDataResult = varTypeData ?? [];
    setVarTypes(varTypeDataResult);
  }, [varTypeData]);

  // if (isloading)
  //   return (
  //     <div className="flex h-48 w-80 items-center justify-center gap-2 rounded-lg border border-neutral-700 bg-neutral-900 p-2">
  //       {/* <LoadingSmall /> */}
  //     </div>
  //   );

  if (!isLoading && (data === undefined || data === null))
    return <div>err</div>;

  const parameters = data?.parameters ?? [];

  // console.log(parameters);

  const setParameterHandles = () => {
    let leftIndex = 1;
    let rightIndex = 1;

    const result = parameters.map((parameter) => {
      const leftTopLocation = leftIndex * 20 + 50;
      const leftWordLocation = 5 - leftIndex;

      const rightTopLocation = rightIndex * 20 + 50;
      const rightWordLocation = 5 - rightIndex;

      let backgroundColor = "#00000";

      const color = varTypes.find(
        (x) => x.typeName === parameter.type
      )?.colorHex;

      if (color) {
        backgroundColor = color;
      }

      // console.log(parameter);

      // if (parameter.type === "text") {
      //   backgroundColor = "red";
      // }

      // if (parameter.type === "integer") {
      //   backgroundColor = "blue";
      // }

      // if (parameter.type === "boolean") {
      //   backgroundColor = "green";
      // }

      // if (parameter.type === "decimal") {
      //   backgroundColor = "yellow";
      // }

      if (
        parameter.io.toLowerCase() === "input" ||
        parameter.io.toLowerCase() === "in" ||
        parameter.io.toLowerCase() === "ref"
      ) {
        // 👈 ref is for both input and ouput

        const paramInstanceId =
          props.data.parameters.find((x) => x.id === parameter.id)
            ?.instanceId ?? "";

        // console.log(paramInstanceId);

        const res = (
          <div key={parameter.id}>
            <Handle
              key={parameter.id}
              type="target"
              position={Position.Left}
              id={paramInstanceId}
              style={{
                top: leftTopLocation,
                border: "1px solid black",
                backgroundColor: backgroundColor,
              }}
            >
              <TooltipComponent content={parameter.type} side="left">
                <div className="pointer-events-none relative w-[150px] -translate-y-[45%]  translate-x-2 font-mono text-[10px] text-neutral-200">
                  {CamelCaseToNormal(parameter.name)} ({parameter.type})
                </div>
              </TooltipComponent>
            </Handle>
          </div>
        );
        leftIndex += 1;
        return res;
      }

      if (
        parameter.io.toLowerCase() === "output" ||
        parameter.io.toLowerCase() === "out" ||
        parameter.io.toLowerCase() === "ref"
      ) {
        const paramInstanceId =
          props.data.parameters.find((x) => x.id === parameter.id)
            ?.instanceId ?? "";

        const finalId = "pOut " + parameter.id + " " + paramInstanceId;
        // console.log(finalId);

        //👈 ref is for both input and output
        const res = (
          <div key={parameter.id}>
            <Handle
              key={parameter.id + "out"}
              type="source"
              position={Position.Right}
              id={finalId}
              style={{
                top: rightTopLocation,
                border: "1px solid black",
                backgroundColor: backgroundColor,
              }}
            >
              <TooltipComponent content={parameter.type} side="right">
                <div className="pointer-events-none relative w-[100px] -translate-x-[105px] -translate-y-[45%]  text-right font-mono text-[10px] text-neutral-200">
                  {CamelCaseToNormal(parameter.name)} ({parameter.type})
                </div>
              </TooltipComponent>
            </Handle>
          </div>
        );

        rightIndex += 1;
        return res;
      }
    });

    return result;
  };

  const loading = isLoading;
  const error = isError;

  return (
    <>
      {/* <Handle type="target" position={Position.Left} /> */}

      <div
        ref={animationParent}
        className={`flex  ${
          loading
            ? "h-20 w-80 border border-transparent"
            : "h-48 w-80 border border-neutral-600"
        } items-start justify-center gap-2 rounded-lg bg-neutral-800 p-2 transition-all delay-300`}
      >
        {error && (
          <div className="flex h-full w-full animate-pulse items-center justify-center gap-2 text-red-500/50">
            <SignalSlashIcon className="h-5 w-5" />
            <p className="font-semibold">Error</p>
          </div>
        )}

        {loading ? (
          <div className="flex h-full w-full animate-pulse items-center justify-center">
            <LoadingSmall />
          </div>
        ) : (
          <>
            {!error && (
              <>
                <div className="w-3/4">
                  <div>
                    <p className="text-lg font-semibold">
                      {CamelCaseToNormal(data?.name ?? "")}
                    </p>
                    <p className="w-full truncate whitespace-nowrap text-xs">
                      {data?.description ?? ""}
                    </p>
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </div>
      {!loading && !error && (
        <>
          {setParameterHandles()}
          {/* <div className="top-[9.25em] fixed right-2 text-xs">{"-1"}</div>
            <Handle
              type="source"
              position={Position.Right}
              id="a"
              style={{
                top: 120
              }}
            />
      <div className="top-[11em] fixed right-2 text-xs">{"-1"}</div>
            <Handle
              type="source"
              position={Position.Right}
              id="a"
              style={{
                top: 140
              }}
            />
      <div className="top-[12.5em] fixed right-2 text-xs">{"-1"}</div>
            <Handle
              type="source"
              position={Position.Right}
              id="a"
              style={{
                top: 160
              }}
            /> */}
          <LeftControlFlowHandles />
          <RightControlFlowHandles />
        </>
      )}
    </>
  );
};

const RightControlFlowHandles = () => {
  return (
    <>
      <div className="fixed right-2 top-0 text-xs">{"-1"}</div>
      <Handle
        type="source"
        position={Position.Right}
        id="t-1"
        style={{
          top: 9,
          background: "#fff",
          border: 0,
          borderRadius: 0,
        }}
      />
      <div className="fixed right-2 top-3 text-xs">{"0"}</div>
      <Handle
        type="source"
        position={Position.Right}
        id="t0"
        style={{
          top: 21,
          background: "#fff",
          border: 0,
          borderRadius: 0,
        }}
      />

      <div className="fixed right-2 top-6 text-xs">{"1"}</div>
      <Handle
        type="source"
        position={Position.Right}
        id="t1"
        style={{
          top: 33,
          background: "#fff",
          border: 0,
          borderRadius: 0,
        }}
      />

      <div className="fixed right-2 top-9 text-xs">{"2"}</div>
      <Handle
        type="source"
        position={Position.Right}
        id="t2"
        style={{
          top: 45,
          background: "#fff",
          border: 0,
          borderRadius: 0,
        }}
      />
      <div className="fixed right-2 top-12 text-xs">{"3"}</div>
      <Handle
        type="source"
        position={Position.Right}
        id="t3"
        style={{
          top: 57,
          background: "#fff",
          border: 0,
          borderRadius: 0,
        }}
      />
    </>
  );
};

const LeftControlFlowHandles = () => {
  return (
    <>
      <div className="fixed left-2 top-0 text-xs">{"IN"}</div>
      <Handle
        type="target"
        position={Position.Left}
        id="in"
        style={{
          top: 10,
          background: "#fff",
          border: 0,
          borderRadius: 0,
        }}
      />
    </>
  );
};
