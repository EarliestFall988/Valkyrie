import { type NextApiResponse, type NextApiRequest } from "next";

const SyncService = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method?.trim().toLowerCase() !== "get") {
    res.status(405).json({ message: "Method not allowed" });
    return;
  }

  const uri = req.headers.uri as string;

  console.log(uri);

  let finalUri = uri;

  if (finalUri.endsWith("/")) {
    finalUri = finalUri.slice(0, -1);
  }

  finalUri = finalUri + "/api/v1/sync";

  const result = fetch(finalUri, {
    method: "GET",
  })
    .then((response) => {
      if (response.status !== 200) {
        res.status(500).json({ message: "Error connecting to server" });
        return;
      }

      return response.text();
    })
    .then((data) => {
      console.log("data", data);
      res.status(200).json(data);
    })
    .catch((error) => {
      console.log(error);
      res.status(500).json({ message: "Error connecting to server" });
    });
  return result;
};

export default SyncService;
