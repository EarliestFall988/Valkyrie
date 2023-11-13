import { useAutoAnimate } from "@formkit/auto-animate/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import { Handle, Position } from "reactflow";
import { LoadingSmall } from "~/components/loading";
// import { TextIcon } from "@radix-ui/react-icons";
import { type varMetaDataType } from "~/flow/flow";
import { api } from "~/utils/api";
// import { ArchiveBoxIcon } from "@heroicons/react/24/solid";

// const handleStyle = { left: 10 };

type nodeData = {
  data: string;
  id: string;
};

export const VariableNode = (props: nodeData) => {

  // console.log(props);

  const [backgroundColor, setBackgroundColor] = useState<string>("white");

  const { data, isLoading } = api.variables.getVariableById.useQuery({
    id: props.data,
  });

  const [dataType, setDataType] = useState<string>("text");

  useEffect(() => {
    if (!data) return;

    const dataType = data.type;

    setDataType(dataType);

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
  }, [dataType, data]);

  const [animationParent] = useAutoAnimate();

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
        id={`vin ${props.id}`}
      />

      <div
        ref={animationParent}
        className="flex h-6 items-center justify-center gap-2 rounded bg-zinc-700 px-4"
      >
        {data && !isLoading && (
          <p className="z-20 whitespace-nowrap font-semibold">
            {data?.name ?? "(Unnamed)"}
          </p>
        )}
        {(!data || isLoading) && (
          <div className="flex w-10 items-center justify-center">
            {isLoading && <LoadingSmall />}
            {!isLoading && <XMarkIcon className="h-5 w-5 text-red-500/80" />}
          </div>
        )}
      </div>
      <Handle
        type="source"
        position={Position.Right}
        style={{
          border: 0,
          backgroundColor: backgroundColor,
        }}
        id={`vout ${props.id}`}
      />
    </>
  );
};
