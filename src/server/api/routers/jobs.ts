import { z } from "zod";
import { createTRPCRouter, privateProcedure } from "../trpc";
import { CustomFunction } from "~/nodes/customFunctionNode";

export const jobsRouter = createTRPCRouter({
  createJob: privateProcedure
    .input(
      z.object({
        title: z.string().min(3).max(100),
        description: z.string().max(255).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const newJob = await ctx.prisma.job.create({
        data: {
          description: input.description,
          title: input.title,
          data: "",
          ui_data: "",
        },
      });

      return newJob;
    }),

  deleteJob: privateProcedure
    .input(
      z
        .object({
          id: z.string(),
        })
        .array()
    )
    .mutation(async ({ ctx, input }) => {
      const customFunctions = await ctx.prisma.customFunction.findMany({
        where: {
          jobId: {
            in: input.map((id) => id.id),
          },
        },
      });

      const variables = await ctx.prisma.variables.findMany({
        where: {
          jobId: {
            in: input.map((id) => id.id),
          },
        },
      });

      const result = await ctx.prisma.$transaction([
        ...input.map((id) =>
          ctx.prisma.job.update({
            where: {
              id: id.id,
            },
            data: {
              customFunctions: {
                deleteMany: {
                  id: {
                    in: customFunctions.map((cf) => cf.id),
                  },
                },
              },
              variables: {
                deleteMany: {
                  id: {
                    in: variables.map((v) => v.id),
                  },
                },
              },
            },
          }),
        ),

        ...input.map((id) =>
          ctx.prisma.job.delete({
            where: {
              id: id.id,
            },
          }),
        ),
      ]);

      return result;
    }),

  updateJob: privateProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().min(3).max(100),
        description: z.string().max(255).optional(),
        jobData: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const jobResult = await ctx.prisma.job.update({
        where: {
          id: input.id,
        },
        data: {
          title: input.title,
          description: input.description,
          data: input.jobData,
        },
      });

      return jobResult;
    }),

  getAllJobs: privateProcedure
    .input(
      z.object({
        skip: z.number().optional(),
        take: z.number().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const jobs = await ctx.prisma.job.findMany({
        skip: input.skip,
        take: input.take,
      });

      return jobs;
    }),

  getJobById: privateProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const job = await ctx.prisma.job.findFirst({
        where: {
          id: input.id,
        },
        include: {
          customFunctions: true,
          variables: true,
        },
      });

      return job;
    }),
});
