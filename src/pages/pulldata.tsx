import type { NextPage } from "next";
import { api } from "~/utils/api";

const PullDataPage: NextPage = () => {
  const { data } = api.pullData.pullAllData.useQuery();

  const dataPull = () => {
    console.log(data);
  };

  return (
    <div>
      <h1>pullData</h1>
      <button onClick={dataPull}>Pull CustomFunctionData</button>
    </div>
  );
};

export default PullDataPage;
