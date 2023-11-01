import { type NextApiRequest, type NextApiResponse } from "next";

// import Pusher from "pusher";
// import { env } from "process";

const apiRoute = (req: NextApiRequest, res: NextApiResponse) => {
  return res.status(200).json({ message: "OK" });

  if (req.method !== "POST") {
    res.status(405).json({ message: "Method not allowed" });
    return;
  }

  // const { socketId } = req.body as { socketId: string };
  // const { channelName } = req.body as { channelName: string };
  // const { userName } = req.body as { userName: string };

  // if (!socketId || !channelName || !userName) {
  //   res.status(400).json({ message: "Missing required fields" });
  //   return;
  // }

  // const appId = env.PUSHER_APP_ID;
  // const key = env.PUSHER_KEY;
  // const secret = env.PUSHER_SECRET;
  // const cluster = env.PUSHER_CLUSTER;

  // if (!appId || !key || !secret || !cluster) {
  //   res
  //     .status(500)
  //     .json({ message: "Not configured", appId, key, secret, cluster });
  //   return;
  // }

  // const pusher = new Pusher({
  //   appId,
  //   key,
  //   secret,
  //   cluster,
  //   useTLS: true,
  // });

  // const authResponse = pusher.authorizeChannel(socketId, channelName, {
  //   user_id: userName,
  // });

  // res
  //   .status(200)
  //   .json({ ...authResponse, channelData: JSON.stringify({ userName }) });
};

export default apiRoute;
