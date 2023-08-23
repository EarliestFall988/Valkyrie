import { useCallback } from "react";
import { Handle, Position } from "reactflow";
import { TextIcon } from "@radix-ui/react-icons";

const handleStyle = { left: 10 };

type nodeData = {
  data: {
    label: string;
    variableType: string;
  };
};

export const VariableNode = (props: nodeData) => {


  const dataType = props.data.variableType as
    | "text"
    | "integer"
    | "decimal"
    | "boolean";

  const onChange = useCallback((e: string) => {
    console.log("VariableNode onChange", e);
  }, []);

  return (
    <>
      {/* <Handle type="target" position={Position.Left} /> */}
      <div className="flex h-12 w-28 items-center justify-center gap-2 rounded-lg bg-gray-700 p-2">
        {dataType === "text" && <TextIcon className="h-4 w-4" />}
        {dataType === "integer" && <p className="text-sm">123</p>}
        {dataType === "decimal" && <p className="text-sm">1.2</p>}
        {dataType === "boolean" && <p className="text-sm">y/n</p>}
        {(dataType === "text" ||
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
        )}
      </div>
      <Handle type="source" position={Position.Right} id="a" />
      {/* <Handle
        type="source"
        position={Position.Bottom}
        id="b"
        style={handleStyle}
      /> */}
    </>
  );
};
