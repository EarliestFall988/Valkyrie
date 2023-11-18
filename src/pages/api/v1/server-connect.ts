import { type NextApiResponse, type NextApiRequest } from "next";

const SyncService = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method?.trim().toLowerCase() !== "get") {
    res.status(405).json({ message: "Method not allowed" });
    return;
  }

  console.log('test');

  const uri = req.headers.uri as string;
  const key = req.headers.key as string;

  console.log(uri); 

  const finalUri = uri + "/sync";

  const result = fetch(finalUri , {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      apikey: key,
    },
  })
    .then((response) => {

      if (response.status !== 200) {
        res.status(500).json({ message: "Error connecting to server" });
        return;
      }

      return response.json();
    })
    .then((data) => {

      console.log(data);


      res.status(200).json(data);
    })
    .catch((error) => {
      console.log(error);
      res.status(500).json({ message: "Error connecting to server" });
    });

  return result;
};

export default SyncService;
