import { useCallback, useEffect, useState } from "react";
import { Handle, Position } from "reactflow";
import { TextIcon } from "@radix-ui/react-icons";
import { type varMetaDataType } from "~/flow/flow";
import { ArchiveBoxIcon } from "@heroicons/react/24/solid";

const handleStyle = { left: 10 };

type nodeData = {
  data: varMetaDataType;
};

export const VariableNode = (props: nodeData) => {
  console.log(props);

  const [backgroundColor, setBackgroundColor] = useState<string>("white");

  const dataType = props.data.type as
    | "text"
    | "integer"
    | "decimal"
    | "boolean";

  const onChange = useCallback((e: string) => {
    console.log("VariableNode onChange", e);
  }, []);

  useEffect(() => {
    if (dataType === "text") {
      setBackgroundColor("red");
    }

    if (dataType === "integer") {
      setBackgroundColor("blue");
    }

    if (dataType === "boolean") {
      setBackgroundColor("green");
    }

    if (dataType === "decimal") {
      setBackgroundColor("yellow");
    }
  }, [dataType]);

  return (
    <>
      {/* <Handle type="target" position={Position.Left} /> */}
      <Handle
        type="target"
        position={Position.Left}
        style={{
          border: 0,
          backgroundColor: backgroundColor,
        }}
        id="in"
      />
      <div className="flex h-6 items-center justify-center gap-2 rounded bg-zinc-700 px-4">
        {/* {dataType === "text" && <TextIcon className="h-4 w-4" />}
        {dataType === "integer" && <p className="text-xs">123</p>}
        {dataType === "decimal" && <p className="text-sm">1.2</p>}
        {dataType === "boolean" && <p className="text-sm">y/n</p>} */}
        <p className="whitespace-nowrap font-semibold z-20">
          {props?.data.label || "(Unnamed)"}{" "}
        </p>
        {/* {(dataType === "text" ||
          dataType === "integer" ||
          dataType === "decimal") && (
          <input
            id="text"
            name="text"
            onChange={(e) => {
              onChange(e.target.value);
            }}
            className="nodrag w-16 rounded px-1 text-neutral-800 outline-none"
          />
        )}
        {dataType === "boolean" && (
          <select
            id="text"
            name="text"
            onChange={(e) => {
              onChange(e.target.value);
            }}
            className="nodrag w-16 rounded px-1 text-sm text-neutral-800 outline-none"
          >
            <option value={"1"}>Yes</option>
            <option value={"0"}>No</option>
          </select>
        )} */}
      </div>
      <Handle
        type="source"
        position={Position.Right}
        style={{
          border: 0,
          backgroundColor: backgroundColor,
        }}
        id="out"
      />
      {/* <Handle
        type="source"
        position={Position.Bottom}
        id="b"
        style={handleStyle}
      /> */}
    </>
  );
};
