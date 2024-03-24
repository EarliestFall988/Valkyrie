import type { APISchema, CustomFunction } from "@prisma/client";
import type { NextPage } from "next";
import { useState } from "react";
import { api } from "~/utils/api";

const PullDataPage: NextPage = () => {
  const { data } = api.pullData.pullAllData.useQuery();
  const { mutate } = api.pullData.pushData.useMutation();


  const [newData, setNewData] = useState<string>("");

  const dataPull = () => {
    console.log(data);
  };

  const dataPush = () => {

  const res = JSON.parse(newData) as {apischema: APISchema[], functionData: CustomFunction[]};


   mutate({apiSchema: res.apischema, functionData: res.functionData, instructionSetSchemaVersionData: [], jobData: [], parameterData: [], pins: [], variableTypeData: [], variables: []});
  }

  return (
    <div className="flex flex-col gap-2 p-2">
      <h1 className="text-lg font-semibold rounded">pullData</h1>
      <button className="p-2 bg-sky-500 rounded" onClick={dataPull}>Pull CustomFunctionData</button>
      <h1 className="text-lg font-semibold">pushData</h1>
      <textarea
        className="p-2 rounded bg-neutral-800 text-neutral-100 w-full outline-none focus:ring-2 focus:ring-sky-500"
        value={newData}
        onChange={(e) => setNewData(e.target.value)}/>
      <button className="p-2 bg-sky-500 rounded" onClick={dataPush}>Push CustomFunctionData</button>
    </div>
  );
};

export default PullDataPage;
