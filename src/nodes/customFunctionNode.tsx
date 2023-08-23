import { useCallback } from "react";
import { Handle, Position } from "reactflow";
import { TextIcon } from "@radix-ui/react-icons";
import { api } from "~/utils/api";

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

  return (
    <>
      {/* <Handle type="target" position={Position.Left} /> */}
      <div className="flex h-24 w-40 items-center justify-center gap-2 rounded-lg bg-gray-700 p-2">
        {data.name}
      </div>
      <Handle type="source" position={Position.Right} id="a" />
      <Handle
        type="source"
        position={Position.Right}
        id="b"
        style={handleStyle}
      />
    </>
  );
};
