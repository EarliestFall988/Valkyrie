import { z } from "zod";
import { createTRPCRouter, privateProcedure } from "../trpc";

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
      const jobs = await ctx.prisma.job.deleteMany({
        where: {
          id: {
            in: input.map((i) => i.id),
          },
        },
      });

      return jobs;
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
      const jobs = await ctx.prisma.job.findFirst({
        where: {
          id: input.id,
        },
      });

      return jobs;
    }),
});
