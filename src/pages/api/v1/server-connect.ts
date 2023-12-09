import { type NextApiResponse, type NextApiRequest } from "next";

const SyncService = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method?.trim().toLowerCase() !== "get") {
    res.status(405).json({ message: "Method not allowed" });
    return;
  }

  console.log("server connect");

  const uri = req.headers.uri as string;
  const key = req.headers["x-api-key"] as string;
  const instructionId = req.headers["x-instruction-id"] as string;

  if (!uri) {
    res.status(400).json({ message: "Invalid uri" });
    return;
  }

  if (!key || key === "") {
    res.status(400).json({ message: "Invalid key" });
    return;
  }

  if (!instructionId || instructionId === "") {
    res.status(400).json({ message: "Invalid instruction id" });
    return;
  }

  console.log("processing uri: " + uri);
  console.log("processing instructionId: ", instructionId);

  // let finalUri = uri;

  // if (finalUri.endsWith("/")) {
  //   finalUri = finalUri.slice(0, -1);
  // }

  // finalUri = finalUri + "/api/v1/sync";

  const result = await fetch(uri, {
    method: "GET",
    headers: {
      apikey: key,
      id: instructionId,
    },
  }).then((res) => {
    return res;
  });

  const data = await result.text();
  console.log("resulting data",  data);
  res.json(data);
};

export default SyncService;
