import { Handle, Position } from "reactflow";
import { api } from "~/utils/api";
import { type functionMetaData } from "~/flow/flow";
import { TooltipTrigger } from "@radix-ui/react-tooltip";
import { TooltipComponent } from "~/components/tooltip";

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

  const { data, isLoading } = api.functions.getFunctionById.useQuery({
    id: props.data.id,
  });

  if (isLoading) return <div className="animate-pulse">loading...</div>;

  if (data === undefined || data === null) return <div>err</div>;

  const parameters = data.parameters;

  // console.log(parameters);

  const setParameterHandles = () => {
    let leftIndex = 1;
    let rightIndex = 1;

    const result = parameters.map((parameter) => {
      const leftTopLocation = leftIndex * 20 + 50;
      const leftWordLocation = 5 - leftIndex;

      const rightTopLocation = rightIndex * 20 + 50;
      const rightWordLocation = 5 - rightIndex;

      let backgroundColor = "";

      if (parameter.type === "text") {
        backgroundColor = "red";
      }

      if (parameter.type === "integer") {
        backgroundColor = "blue";
      }

      if (parameter.type === "boolean") {
        backgroundColor = "green";
      }

      if (parameter.type === "decimal") {
        backgroundColor = "yellow";
      }

      if (parameter.io === "input") {
        const res = (
          <div key={parameter.id}>
            <Handle
              key={parameter.id}
              type="target"
              position={Position.Left}
              id={parameter.id}
              style={{
                top: leftTopLocation,
                border: "1px solid black",
                backgroundColor: backgroundColor,
              }}
            >
              <div className="pointer-events-none relative w-[100px] -translate-y-[45%] translate-x-2 font-mono text-[12px] text-neutral-200">
                {parameter.name}
              </div>
            </Handle>
          </div>
        );
        leftIndex += 1;
        return res;
      } else {
        const res = (
          <div key={parameter.id}>
            <Handle
              key={parameter.id + "out"}
              type="source"
              position={Position.Right}
              id={parameter.id}
              style={{
                top: rightTopLocation,
                border: "1px solid black",
                backgroundColor: backgroundColor,
              }}
            >
              <div className="pointer-events-none relative w-[100px] -translate-y-[45%] text-right -translate-x-[105px] font-mono text-[12px] text-neutral-200">
                {parameter.name}
              </div>
            </Handle>
          </div>
        );

        rightIndex += 1;
        return res;
      }
    });

    return result;
  };

  return (
    <>
      {/* <Handle type="target" position={Position.Left} /> */}

      <div className="flex h-48 w-80 items-start justify-center gap-2 rounded-lg border border-neutral-600 bg-neutral-800 p-2">
        <div className="w-3/4">
          <div>
            <p className="text-lg font-semibold">{data.name}</p>
            <p className="w-full truncate whitespace-nowrap text-xs">
              {data.description}
            </p>
          </div>
        </div>
      </div>
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
  );
};

const RightControlFlowHandles = () => {
  return (
    <>
      <div className="fixed right-2 top-0 text-xs">{"-1"}</div>
      <Handle
        type="target"
        position={Position.Right}
        id="t-1"
        style={{
          top: 10,
          background: "#fff",
          border: 0,
          borderRadius: 0,
        }}
      />
      <div className="fixed right-2 top-3 text-xs">{"0"}</div>
      <Handle
        type="target"
        position={Position.Right}
        id="t0"
        style={{
          top: 20,
          background: "#fff",
          border: 0,
          borderRadius: 0,
        }}
      />

      <div className="fixed right-2 top-6 text-xs">{"1"}</div>
      <Handle
        type="target"
        position={Position.Right}
        id="t1"
        style={{
          top: 30,
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
        type="source"
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
