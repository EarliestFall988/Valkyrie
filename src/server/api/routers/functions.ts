import { z } from "zod";
import { createTRPCRouter, privateProcedure } from "../trpc";

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
      const newFunction = await ctx.prisma.customFunction.create({
        data: {
          name: input.name,
          description: input.description,
          jobId: input.jobId,
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
      z
        .object({
          id: z.string(),
        })
        .array()
    )
    .mutation(async ({ ctx, input }) => {
      const functions = await ctx.prisma.customFunction.deleteMany({
        where: {
          id: {
            in: input.map((i) => i.id),
          },
        },
      });

      return functions;
    }),
});
