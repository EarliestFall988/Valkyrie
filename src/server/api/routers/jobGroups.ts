import { z } from "zod";
import { createTRPCRouter, privateProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";

export const jobGroupsRouter = createTRPCRouter({
  create: privateProcedure
    .input(
      z.object({
        name: z.string(),
        description: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const authorId = ctx.currentUser;

      const result = await ctx.prisma.jobGroup.create({
        data: {
          name: input.name,
          description: input.description,
          authorId,
        },
        select: {
          id: true,
        },
      });

      return result;
    }),

  search: privateProcedure
    .input(
      z.object({
        searchTerm: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      const authorId = ctx.currentUser;

      if (!input.searchTerm) {
        return await ctx.prisma.jobGroup.findMany({
          where: {
            authorId,
          },
        });
      }

      return await ctx.prisma.jobGroup.findMany({
        where: {
          AND: [
            {
              authorId,
            },
            {
              name: input.searchTerm,
            },
          ],
        },
      });
    }),

  getById: privateProcedure
    .input(
      z.object({
        id: z.string(),
        includeJobs: z.boolean().optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      const result = ctx.prisma.jobGroup.findFirst({
        where: {
          id: input.id,
        },
        include: {
          jobs: input.includeJobs ?? false,
        },
      });

      return result;
    }),

  update: privateProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string(),
        description: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const result = await ctx.prisma.jobGroup.update({
        where: {
          id: input.id,
        },
        data: {
          name: input.name,
          description: input.description,
        },
        select: {
          id: true,
        },
      });

      return result;
    }),

  addJobToJobGroup: privateProcedure
    .input(
      z.object({
        jobId: z.string(),
        jobGroupId: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const result = await ctx.prisma.jobGroup.update({
        where: {
          id: input.jobGroupId,
        },
        data: {
          jobs: {
            connect: {
              id: input.jobId,
            },
          },
        },
        select: {
          id: true,
        },
      });

      return result;
    }),

  removeJobFromJobGroup: privateProcedure
    .input(
      z.object({
        jobId: z.string(),
        jobGroupId: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const result = await ctx.prisma.jobGroup.update({
        where: {
          id: input.jobGroupId,
        },
        data: {
          jobs: {
            disconnect: {
              id: input.jobGroupId,
            },
          },
        },
        select: {
          id: true,
        },
      });

      return result;
    }),

  deleteJobGroup: privateProcedure
    .input(
      z
        .object({
          id: z.string(),
        })
        .array()
    )
    .mutation(async ({ input, ctx }) => {
      const totalJobs = await ctx.prisma.jobGroup.findFirst({
        where: {
          id: {
            in: input.map((id) => id.id),
          },
        },
        select: {
          jobs: {
            include: {
              _count: true,
            },
          },
        },
      });

      if (totalJobs === undefined || totalJobs?.jobs === undefined) {
        return true;
      }

      if (totalJobs?.jobs.length > 0) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "You need to remove all jobs from the job group first",
        });
      }

      const result = await ctx.prisma.jobGroup.deleteMany({
        where: {
          id: {
            in: input.map((id) => id.id),
          },
        },
      });

      return result;
    }),
});
