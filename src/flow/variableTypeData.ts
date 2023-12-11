import { type VariableType } from "@prisma/client";
import { useState } from "react";
import { client } from "~/utils/client";

export const useGetVarTypes = (id: string) => {
  const [varTypeData, setVarTypeData] = useState<{
    jobId: string;
    types: VariableType[];
  } | null>();

  let isLoading = false;
  let isError = false;

  const handleGetData = () => {
    if (varTypeData === null || varTypeData?.jobId === id) {
      isLoading = true;

      const data = client.variableTypes.getAllVariableTypesByJob
        .query({
          jobId: id,
        })
        .then((res) => {
          setVarTypeData({
            jobId: id,
            types: res,
          });

          isLoading = false;
        })
        .catch((err) => {
          console.log(err);
          isError = true;
        });

      isLoading = false;
    }

    return varTypeData;
  };

  handleGetData();

  const result =
    varTypeData ??
    ({} as {
      jobId: string;
      types: VariableType[];
    } | null);

  return { varTypes: result, isLoading, isError };
};
