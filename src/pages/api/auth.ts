import { clerkClient } from "@clerk/nextjs";
import type { NextApiRequest, NextApiResponse } from "next";

import Pusher from "pusher";

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.PUSHER_CLUSTER!,
  useTLS: true,
});

const apiRoute = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "POST") {
    res.status(405).json({ message: "Method not allowed" });
    return;
  }

  console.log("the body: ", req.body);

  const { socketId } = req.body as { socketId: string };
  const { channelName } = req.body as { channelName: string };

  if (
    socketId === null ||
    socketId === undefined ||
    channelName === undefined
  ) {
    res.status(400).json({ message: "Missing required fields" });
    return;
  }

  console.log("body:", req.body, "\n");

  const { userName } = req.body as { userName: string };
  // const { Name } = req.body as { Name: string };
  // const { Type } = req.body as { Type: string };

  // const { pin } = req.body as { pin: string };

  const users = await clerkClient.users.getUserList();
  const foundUser = users.find(
    (u) => u.emailAddresses[0]?.emailAddress === userName
  );

  if (!foundUser) {
    console.log("could not find user.");
    res.status(400).json({ message: "User not found" });
    return;
  }

  const user = {
    id: foundUser.id,
    user_info: {
      // name: Name,
      userName: userName,
      // type: Type,
    },
    watchlist: [],
  };

  const content = pusher.authorizeChannel(socketId, channelName);

  // const content = pusher.authenticateUser(socketId, user);

  // const authResponse = pusher.authenticateUser(socketId, user);

  // console.log(authResponse);
  // console.log(user);

  // if (!authResponse?.auth) {
  //   res.status(400).json({ message: "Could not authenticate user" });
  //   return;
  // }

  // const response = pusher.authorizeChannel(socketId, channelName);

  console.log("content: ", content);

  const strResult = JSON.stringify(content);

  res.send(strResult);
};

export default apiRoute;
