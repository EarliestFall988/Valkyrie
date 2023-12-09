import { promise, z } from "zod";
import { createTRPCRouter, privateProcedure } from "../trpc";
import { prisma } from "~/server/db";

export const NormalSpacedToCamelCase = (str: string) => {
  let i = 0;

  for (i = str.length - 1; i >= 0; i--) {
    if (str[i] == " ") {
      const newString =
        str.substring(0, i) + str[i + 1]?.toUpperCase() + str.substring(i + 2);
      str = newString;
    }
  }

  return str;
};

export const functionsRouter = createTRPCRouter({
  createFunction: privateProcedure
    .input(
      z.object({
        name: z.string().min(3).max(100),
        jobId: z.string().min(3).max(100),
        description: z.string().max(255).optional(),
        params: z
          .object({
            name: z.string().min(3).max(100),
            type: z.string().min(3).max(100),
            io: z.string().min(3).max(100),
          })
          .array(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const authorId = ctx.currentUser;

      const newFunction = await ctx.prisma.customFunction.create({
        data: {
          name: input.name,
          description: input.description,
          jobId: input.jobId,
          authorId,
        },
      });

      const functionId = newFunction.id;

      const params = [] as {
        name: string;
        type: string;
        required: boolean;
        io: string;
        customFunctionId: string;
      }[];

      params.push(
        ...input.params.map((param) => {
          return {
            name: param.name,
            type: param.type,
            required: true,
            io: param.io,
            customFunctionId: functionId,
          };
        })
      );

      const newParams = await ctx.prisma.parameters.createMany({
        data: params,
      });

      return { newFunction, newParams };
    }),

  getFunctionsByJobId: privateProcedure
    .input(
      z.object({
        jobId: z.string().min(3).max(100),
      })
    )
    .query(async ({ ctx, input }) => {
      const functions = await ctx.prisma.customFunction.findMany({
        where: {
          jobId: input.jobId,
        },
        include: {
          parameters: true,
        },
      });

      return functions;
    }),

  getFunctionById: privateProcedure
    .input(
      z.object({
        id: z.string().min(3).max(100),
      })
    )
    .query(async ({ ctx, input }) => {
      const func = await ctx.prisma.customFunction.findFirst({
        where: {
          id: input.id,
        },
        include: {
          parameters: true,
        },
      });

      return func;
    }),

  deleteFunction: privateProcedure
    .input(
      z.object({
        id: z.string().min(3).max(100),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const func = await ctx.prisma.customFunction.findFirst({
        // get the function
        where: {
          id: input.id,
        },
      });

      if (func == null) return null;

      const params = await ctx.prisma.parameters.findMany({
        // find the params
        where: {
          customFunctionId: input.id,
        },
      });

      await ctx.prisma.parameters.deleteMany({
        // delete the params
        where: {
          id: {
            in: params.map((p) => p.id),
          },
        },
      });

      const job = await ctx.prisma.job.findFirst({
        // get the job
        where: {
          id: func.jobId,
        },
      });

      if (job == null) return null;

      await ctx.prisma.job.update({
        // disconnect the function from the job
        where: {
          id: job.id,
        },
        data: {
          customFunctions: {
            disconnect: {
              id: func.id,
            },
          },
        },
      });

      const deletedFunction = await ctx.prisma.customFunction.delete({
        // now we finally delete the function
        where: {
          id: input.id,
        },
      });

      return deletedFunction;
    }),

  deleteAllFunctionsByJobId: privateProcedure
    .input(
      z.object({
        jobId: z.string().min(3).max(100),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const functions = await ctx.prisma.customFunction.findMany({
        where: {
          jobId: input.jobId,
        },
        include: {
          parameters: {
            select: {
              id: true,
            },
          },
        },
      });

      await Promise.all(
        functions.map(async (f) => {
          await ctx.prisma.parameters.deleteMany({
            where: {
              customFunctionId: f.id,
            },
          });
        })
      );

      const result = await ctx.prisma.customFunction.deleteMany({
        where: {
          jobId: input.jobId,
        },
      });

      return result;
    }),

  getFunctionCountFromJobId: privateProcedure
    .input(
      z.object({
        jobId: z.string().min(3).max(100),
      })
    )
    .query(async ({ ctx, input }) => {
      const count = await ctx.prisma.customFunction.count({
        where: {
          jobId: input.jobId,
        },
      });

      return count;
    }),

  searchFunctionsFromJobId: privateProcedure
    .input(
      z.object({
        jobId: z.string().min(3).max(100),
        search: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      console.log("\t\t\ninput.search: ", input.search);

      if (!input.search || input.search.length <= 3)
        return await ctx.prisma.customFunction.findMany({
          where: {
            jobId: input.jobId,
          },
          include: {
            parameters: true,
          },
        });

      const res = NormalSpacedToCamelCase(input.search);

      console.log("\t\t\nres: ", res);

      const functions = await ctx.prisma.customFunction.findMany({
        where: {
          jobId: input.jobId,
          name: {
            contains: res,
          },
        },
        include: {
          parameters: true,
        },
      });

      return functions;
    }),

  deleteFunctions: privateProcedure
    .input(
      z
        .object({
          id: z.string(),
        })
        .array()
    )
    .mutation(async ({ ctx, input }) => {
      const functionsToDelete = await ctx.prisma.customFunction.findMany({
        where: {
          id: {
            in: input.map((i) => i.id),
          },
        },
      });

      const paramsToDelete = await ctx.prisma.parameters.findMany({
        where: {
          customFunctionId: {
            in: functionsToDelete.map((f) => f.id),
          },
        },
      });

      await ctx.prisma.parameters.deleteMany({
        //remove the params
        where: {
          id: {
            in: paramsToDelete.map((p) => p.id),
          },
        },
      });

      const jobs = await ctx.prisma.job.findMany({
        where: {
          id: {
            in: functionsToDelete.map((f) => f.jobId),
          },
        },
      });

      await prisma.$transaction([
        // disconnect the functions from the job
        ...jobs.map((job) => {
          return prisma.job.update({
            where: {
              id: job.id,
            },
            data: {
              customFunctions: {
                disconnect: functionsToDelete.map((f) => {
                  return {
                    id: f.id,
                  };
                }),
              },
            },
          });
        }),
      ]);

      const functions = await ctx.prisma.customFunction.deleteMany({
        // delete the functions
        where: {
          id: {
            in: input.map((i) => i.id),
          },
        },
      });

      return functions;
    }),
});
