import type { NextApiHandler, NextApiRequest, NextApiResponse } from "next";
import { prisma } from "~/server/db";
import { type InputParamType, type FunctionType } from "./getdata";
import { type Parameters, type CustomFunction } from "@prisma/client";

const key = "some key"; //TODO: put this in the env file

const SyncFunctions: NextApiHandler = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  const apiKey = req.headers["x-api-key"] as string;

  if (req.method?.trim().toLowerCase() !== "post") {
    res.status(405).json({ message: "Method not allowed" });
    return;
  }

  if (!apiKey) {
    res.status(403).json({ message: "Invalid key" });
    return;
  }

  if (apiKey !== key) {// bru
    res.status(403).json({ message: "Invalid key" });
    return;
  }

  const instructionId = req.headers["x-instruction-id"] as string;
  const functionDataString = req.body as string;

  if (!functionDataString) {
    res.status(400).json({ message: "Invalid function definitions" });
    return;
  }

  const functionDefs = JSON.parse(functionDataString) as FunctionType[];

  if (functionDefs.length === 0) {
    res.status(400).json({ message: "No function definitions" });
    return;
  }

  if (!instructionId) {
    res.status(400).json({ message: "Invalid instruction id" });
    return;
  }

  const instructionSet = await prisma.job.findFirst({
    where: {
      id: instructionId,
    },
  });

  if (!instructionSet) {
    res.status(404).json({ message: "Instruction set not found" });
    return;
  }

  //👇👇 dumb limitation of prisma, can't do a bulk upsert *sigh* so we have to do it manually

  const pFunctions = [] as {
    func: CustomFunction;
    params: Parameters[];
    newParams: InputParamType[];
    oldParams: string[];
  }[];
  const functionsNotInDb = [] as FunctionType[];

  functionDefs.map(async (f) => {
    const func = await prisma.customFunction.findFirst({
      where: {
        AND: [
          {
            jobId: instructionId,
          },
          {
            name: {
              in: functionDefs.map((f) => f.name),
            },
          },
        ],
      },
      include: {
        parameters: {
          where: {
            name: {
              in: f.parameters.map((p) => p.name),
            },
          },
        },
      },
    });

    const newParams = f.parameters.filter((p) => {
      const param = func?.parameters.find((x) => x.name === p.name);

      if (!param) {
        return true;
      }

      return false;
    });

    const oldParams = f.parameters
      .map((p) => {
        const param = func?.parameters.find((x) => x.name === p.name);

        if (param) {
          return param.id;
        }

        return "";
      })
      .filter((x) => x !== "");

    if (func) {
      pFunctions.push({
        func,
        params: func.parameters,
        newParams: newParams,
        oldParams,
      });
    } else {
      functionsNotInDb.push(f);
    }

    return f;
  });

  pFunctions.map(async ({ func, params, newParams, oldParams }) => {
    const res = await prisma.$transaction([
      //transaction - either the whole function gets updated, or none of it does (per function, probably should make this per request...)

      //update the function data
      prisma.customFunction.update({
        where: {
          id: func.id,
        },
        data: {
          name: func.name,
          description: func.description,
          jobId: func.jobId,
        },
      }),

      // update parameters we want to keep
      ...params.map((p) => {
        return prisma.parameters.update({
          where: {
            id: p.id,
          },
          data: {
            default: p.default,
            description: p.description,
            name: p.name,
            io: p.io,
            type: p.type,
            required: p.required,
          },
        });
      }),

      // create new parameters
      ...newParams.map((p) => {
        return prisma.parameters.create({
          data: {
            default: "",
            description: "",
            name: p.name,
            io: "",
            type: p.type,
            required: false,
            customFunction: {
              connect: {
                id: func.id,
              },
            },
          },
        });
      }),

      //remove parameters we don't want
      prisma.parameters.deleteMany({
        where: {
          id: {
            in: oldParams,
          },
        },
      }),
    ]);

    return res; //👈 results of the transaction
  });

  res.status(200).json({ pFunctions });
};

export default SyncFunctions;
