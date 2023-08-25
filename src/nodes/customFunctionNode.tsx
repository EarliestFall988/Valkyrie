import { useCallback } from "react";
import { Handle, Position } from "reactflow";
import { TextIcon } from "@radix-ui/react-icons";
import { api } from "~/utils/api";
import { CodeBracketIcon } from "@heroicons/react/24/outline";

const handleStyle = {
  top: 10,
  background: "#fff",
  border: 0,
  borderRadius: 0,
};

type nodeData = {
  data: {
    label: string;
    functionId: string;
  };
};

export const CustomFunction = (props: nodeData) => {
  console.log(props.data);

  const { data, isLoading } = api.functions.getFunctionById.useQuery({
    id: props.data.functionId,
  });

  if (isLoading) return <div className="animate-pulse">loading...</div>;

  if (data === undefined || data === null) return <div>err</div>;

  const parameters = data.parameters;

  const setParameterHandles = () => {
    let leftIndex = 0;
    let rightIndex = 0;

    const result = parameters.map((parameter) => {
      const leftTopLocation = leftIndex * 20 + 100;
      const leftWordLocation = leftIndex * 1.75 + 7.5;

      const rightTopLocation = rightIndex * 20 + 100;
      const rightWordLocation = rightIndex * 1.75 + 7.5;
      
      let backgroundColor = "";

      if(parameter.type === "text")
      {
        backgroundColor = "red"
      }

      if(parameter.type === "integer")
      {
        backgroundColor = "blue"
      }

      if(parameter.type === "boolean")
      {
        backgroundColor = "green"
      }

      if(parameter.type === "decimal")
      {
        backgroundColor = "yellow"
      }


      if (parameter.io === "input") {
        const res = (
          <>
            <div className={`top-[${leftWordLocation}em] fixed left-2 text-xs`}>
              {parameter.name}
            </div>
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
            />
          </>
        );

        leftIndex += 1;
        return res;
      } else {
        const res = (
          <>
            <div
              className={`top-[${rightWordLocation}em] fixed right-2 text-xs`}
            >
              {parameter.name}
            </div>
            <Handle
              key={parameter.id}
              type="source"
              position={Position.Right}
              id={parameter.id}
              style={{
                top: rightTopLocation,
                border: "1px solid black",
                backgroundColor: backgroundColor,
              }}
            />
          </>
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

      <div className="flex h-48 w-80 items-start justify-center gap-2 rounded-lg p-2 bg-gray-700">
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
      {/* <div className="fixed left-2 top-[0.9rem] text-[0.5em]">{"0"}</div>
      <Handle
        type="source"
        position={Position.Left}
        id="f0"
        style={{
          top: 20,
          background: "#fff",
          border: 0,
          borderRadius: 0,
        }}
      /> */}

      {/* <div className="fixed left-2 top-[1.5rem] text-[0.5em]">{"1"}</div>
      <Handle
        type="source"
        position={Position.Left}
        id="f1"
        style={{
          top: 30,
          background: "#fff",
          border: 0,
          borderRadius: 0,
        }}
      /> */}
    </>
  );
};
