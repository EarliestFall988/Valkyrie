import type { NextApiHandler, NextApiRequest, NextApiResponse } from "next";
import { prisma } from "~/server/db";
import { type Parameters, type CustomFunction } from "@prisma/client";

type SyncInputParamType = {
  Name: string;
  Type: string;
  IO: string;
  Description: string;
};

export type SyncFunctionType = {
  Name: string;
  Description: string;
  Parameters?: SyncInputParamType[];
};

export type SyncCustomTypeType = {
  Name: string;
  Description: string;
};

export type SyncType = {
  Functions?: SyncFunctionType[];
  CustomTypes?: SyncCustomTypeType[];
};

const key = "some key"; //TODO: put this in the env file

const SyncFunctions: NextApiHandler = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  console.log("\tsync functions");

  const apiKey = req.headers["x-api-key"] as string;

  if (req.method?.trim().toLowerCase() !== "post") {
    res.status(405).json({ message: "Method not allowed" });
    return;
  }

  if (!apiKey) {
    res.status(403).json({ message: "Invalid key" });
    return;
  }

  if (apiKey !== key) {
    // bru
    res.status(403).json({ message: "Invalid key" });
    return;
  }

  const instructionId = req.headers["x-instruction-id"] as string;
  const functionDataString = req.body as string;

  if (!functionDataString) {
    res.status(400).json({ message: "Invalid function definitions" });
    return;
  }

  console.log(functionDataString);

  const syncData = JSON.parse(functionDataString) as SyncType;

  if (!syncData) {
    res.status(400).json({ message: "Nothing to sync" });
    return;
  }

  if (!instructionId) {
    res.status(400).json({ message: "Invalid instruction id" });
    return;
  }

  const functionDefs = syncData.Functions ?? [];
  const typeDefs = syncData.CustomTypes ?? [];

  console.log("api key: ", apiKey);
  console.log("instruction id: ", instructionId);
  //👇👇 dumb limitation of prisma, can't do a bulk upsert *sigh* so we have to do it manually
  if (typeDefs.length > 0) {
    typeDefs.map(async (t) => {
      const customType = await prisma.variableType.findFirst({
        where: {
          AND: [
            {
              jobId: instructionId,
            },
            {
              typeName: t.Name,
            },
          ],
        },
      });

      if (!customType) {
        await prisma.variableType.create({
          data: {
            description: t.Description,
            typeName: t.Name,
            jobId: instructionId,
            authorId: "apikey" + apiKey,
          },
        });
      } else {
        await prisma.variableType.update({
          where: {
            id: customType.id,
          },
          data: {
            description: t.Description,
            typeName: t.Name,
            jobId: instructionId,
          },
        });
      }

      return res;
    });
  }

  if (functionDefs.length > 0) {
    console.log("function defs: ", functionDefs);

    functionDefs.forEach((f) => {
      f.Parameters?.forEach((p) => {
        console.log("param: ", p);
      });
    });

    const instructionSet = await prisma.job.findFirst({
      where: {
        id: instructionId,
      },
    });

    if (!instructionSet) {
      res.status(404).json({ message: "Instruction set not found" });
      return;
    }

    //👇👇 yup gotta do it again... no upsert here either. Prisma only allows upserts on unique fields, which I would make the name a unique field, but
    // that of course would be too easy. So we have to do it manually. I'm sure there's a way to do this with a raw query, but I'm lazy and this works
    // haha I'm not lazy, I'm just tired of fighting with prisma. I'm sure it's a great tool, but it's not for me. I'm going to switch to knex
    // or something else. I'm tired of fighting with this thing.
    // I'm sure there's a way to do this with a raw query, but I'm lazy and this works.

    const pFunctions = [] as {
      func: CustomFunction;
      params: Parameters[];
      newParams: SyncInputParamType[];
      oldParams: string[];
    }[];
    const functionsNotInDb = [] as SyncFunctionType[];

    await Promise.all(
      functionDefs.map(async (f) => {
        const func = await prisma.customFunction.findFirst({
          where: {
            AND: [
              {
                jobId: instructionId,
              },
              {
                name: {
                  in: functionDefs.map((f) => f.Name),
                },
              },
            ],
          },
          include: {
            parameters: {
              where: {
                name: {
                  in: f.Parameters?.map((p) => p.Name),
                },
              },
            },
          },
        });

        if (func) {
          const newParams = f.Parameters?.filter((p) => {
            const param = func?.parameters.find((x) => x.name === p.Name);

            if (!param) {
              return true;
            }

            return false;
          });

          const oldParams = f.Parameters?.map((p) => {
            const param = func?.parameters.find((x) => x.name === p.Name);

            if (param) {
              return param.id;
            }

            return "";
          }).filter((x) => x !== "");

          pFunctions.push({
            func,
            params: func.parameters,
            newParams: newParams ?? [],
            oldParams: oldParams ?? [],
          });
        } else {
          functionsNotInDb.push(f);
        }

        return f;
      })
    );

    // console.log("f not in db", functionsNotInDb);

    // functionsNotInDb.forEach((f) => {

    //   console.log("param count:", f.parameters?.length ?? 0);

    //   f.parameters?.forEach((p) => {
    //     console.log("p: ", p);
    //   });
    // })

    //transaction - either all the functions get updated or none of them do
    await prisma.$transaction(async (tx) => {
      await Promise.all(
        pFunctions.map(async ({ func, params, newParams, oldParams }) => {
          console.log("\n\t\tfunctions not 4 in db: ", functionsNotInDb);

          //update the function data
          await tx.customFunction.update({
            where: {
              id: func.id,
            },
            data: {
              name: func.name,
              description: func.description,
              jobId: func.jobId,
            },
          });

          // update parameters we want to keep
          await Promise.all(
            params.map(async (p) => {
              return await tx.parameters.update({
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
            })
          );

          // create new parameters
          await Promise.all(
            newParams.map(async (p) => {
              return await tx.parameters.create({
                data: {
                  default: "",
                  description: "",
                  name: p.Name,
                  io: "",
                  type: p.Type,
                  required: false,
                  customFunction: {
                    connect: {
                      id: func.id,
                    },
                  },
                },
              });
            })
          );

          //remove parameters we don't want
          await tx.parameters.deleteMany({
            where: {
              id: {
                in: oldParams,
              },
            },
          });

          // return res; //👈 results of the transaction
        })
      );
    });

    console.log("creating remaining functions");

    await prisma.$transaction(async (tx) => {
      await Promise.all(
        functionsNotInDb.map(async (f) => {
          //create the function
          console.log("creating function " + f.Name);
          const func = await tx.customFunction.create({
            data: {
              name: f.Name,
              jobId: instructionId,
              description: "",
              authorId: instructionSet.authorId, //scary...
            },
          });

          if (!f.Parameters) {
            return res;
          }

          //create the parameters
          await Promise.all(
            f.Parameters?.map(async (p) => {
              console.log("param: ", p);

              return await tx.parameters.create({
                data: {
                  default: "",
                  description: "",
                  name: p.Name,
                  io: p.IO,
                  type: p.Type,
                  required: false,
                  customFunction: {
                    connect: {
                      id: func.id,
                    },
                  },
                },
              });
            })
          );

          // return res; //👈 results of the transaction
        })
      );
    });

    console.log("functions not in db: ", functionsNotInDb);
    console.log("functions in db: ", pFunctions);
  }

  res.status(200);
};

export default SyncFunctions;
