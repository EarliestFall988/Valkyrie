import { z } from "zod";
import { createTRPCRouter, privateProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";

export const VariableTypes = createTRPCRouter({
  createNewVariableType: privateProcedure
    .input(
      z.object({
        key: z.string().min(3).max(100),
        description: z.string().optional(),
        jobId: z.string().min(3).max(100),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.currentUser) throw new Error("User not authenticated");

      const alreadyExists = await ctx.prisma.variableType.findFirst({
        where: {
          typeName: input.key,
          jobId: input.jobId,
        },
      });

      if (alreadyExists) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Variable type already exists",
        });
      }

      const customVariableCreated = await ctx.prisma.variableType.create({
        data: {
          typeName: input.key,
          description: input.description ?? "",
          authorId: ctx.currentUser,
          jobId: input.jobId,
        },
      });

      return customVariableCreated;
    }),

  getAllVariableTypesByJob: privateProcedure
    .input(
      z.object({
        jobId: z.string().min(3).max(100),
        searchTerm: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      if (input.searchTerm && input.searchTerm.length > 0) {
        const customVariableTypes = await ctx.prisma.variableType.findMany({
          where: {
            jobId: input.jobId,
            typeName: {
              contains: input.searchTerm,
            },
          },
        });

        return customVariableTypes;
      }

      const customVariableTypes = await ctx.prisma.variableType.findMany({
        where: {
          jobId: input.jobId,
        },
      });

      return customVariableTypes;
    }),

  getVariableTypeById: privateProcedure
    .input(
      z.object({
        variableTypeId: z.string().min(3).max(100),
      })
    )
    .query(async ({ ctx, input }) => {
      const customVariableType = await ctx.prisma.variableType.findUnique({
        where: {
          id: input.variableTypeId,
        },
      });

      return customVariableType;
    }),

  getVariableTypeByNameAndJobId: privateProcedure
    .input(
      z.object({
        key: z.string().min(3).max(100),
        jobId: z.string().min(3).max(100),
      })
    )
    .query(async ({ ctx, input }) => {
      const customVariableType = await ctx.prisma.variableType.findFirst({
        where: {
          jobId: input.jobId,
          typeName: input.key,
        },
      });

      return customVariableType;
    }),

  updateVariableTypeById: privateProcedure
    .input(
      z.object({
        variableTypeId: z.string().min(3).max(100),
        key: z.string().min(3).max(100),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const customVariableType = await ctx.prisma.variableType.update({
        where: {
          id: input.variableTypeId,
        },
        data: {
          typeName: input.key,
          description: input.description ?? "",
        },
      });

      return customVariableType;
    }),

  upsertVariableType: privateProcedure
    .input(
      z.object({
        varId: z.string().min(3).max(100),
        key: z.string().min(3).max(100),
        description: z.string().optional(),
        jobId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.currentUser) throw new Error("User not authenticated");

    //   const alreadyExists = await ctx.prisma.variableType.findFirst({
    //     where: {
    //       typeName: input.key,
    //       jobId: input.jobId,
    //     },
    //   });

    //   if (alreadyExists) {
    //     throw new TRPCError({
    //       code: "BAD_REQUEST",
    //       message: "Variable type already exists",
    //     });
    //   }

      const customVariableCreated = await ctx.prisma.variableType.upsert({
        where: {
          id: input.varId,
        },
        update: {
          typeName: input.key,
          description: input.description ?? "",
        },
        create: {
          typeName: input.key,
          description: input.description ?? "",
          authorId: ctx.currentUser,
          jobId: input.jobId ?? "",
        },
      });

      return customVariableCreated;
    }),

  deleteVariableTypeById: privateProcedure
    .input(
      z.object({
        variableTypeId: z.string().min(3).max(100),
      })
    )
    .mutation(async ({ ctx, input }) => {
      //👇👇 check to make sure that there are not other variables that rely on this variable type
      const variables = await ctx.prisma.variables.findFirst({
        where: {
          typeId: input.variableTypeId,
        },
      });

      if (variables) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Variable type is in use and cannot be deleted",
        });
      }

      const customVariableType = await ctx.prisma.variableType.delete({
        where: {
          id: input.variableTypeId,
        },
      });

      return customVariableType;
    }),

  getVariableTypeCountFromJobId: privateProcedure
    .input(
      z.object({
        jobId: z.string().min(3).max(100),
      })
    )
    .query(async ({ ctx, input }) => {
      const count = await ctx.prisma.variableType.count({
        where: {
          jobId: input.jobId,
        },
      });

      return count;
    }),
});
