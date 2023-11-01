import type { NextApiRequest, NextApiResponse } from "next";

type ContentRequestType = {
  id: string;
  content: string;
};

const id = "some id"; //TODO: put this in the env file

const ContentRoute = (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "POST") {
    res.status(405).json({ message: "Method not allowed" });
    return;
  }

  console.log("the body: ", req.body);

  const result = req.body as ContentRequestType;

  const name = result.content;
  const reqId = result.id;

  if (reqId !== id) {
    res.status(400).json({ message: "Invalid id" });
    return;
  }

  if(name === null || name === ""){
    res.status(400).json({ message: "Invalid name" });
    return;
  }


  console.log("name", name);

  res.status(405).json({ message: "yeet" });
};

export default ContentRoute;
