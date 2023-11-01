import type { NextApiRequest, NextApiResponse } from "next";

type ContentRequestType = {
    contentName: string;
};

const ContentRoute = async (req: NextApiRequest, res: NextApiResponse) => {
  
  
  if (req.method === "GET") {

    const { contentName } = req.body as { contentName: string };

    res.status(200).json({ message: "OK" });
    return;
  }

  if (req.method !== "POST") {
    res.status(405).json({ message: "Method not allowed" });
    return;
  }

  console.log("the body: ", req.body);


  res.status(405).json({ message: "yeet" });

};

export default ContentRoute;
