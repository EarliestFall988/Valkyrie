import { z } from "zod";
import { createTRPCRouter, privateProcedure } from "../trpc";

export const apiSchemaRouter = createTRPCRouter({
  createAPISchema: privateProcedure
    .input(
      z.object({
        name: z.string().min(3).max(100),
        description: z.string().max(255).optional(),
        uri: z.string().max(255).optional(),
        method: z.string().max(255).optional(),
        headers: z.string().max(255).optional(),
        body: z.string().max(255).optional(),

        schemaResult: z.string().max(255).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.currentUser;

      const newAPISchema = await ctx.prisma.aPISchema.create({
        data: {
          name: input.name,
          description: input.description ?? "",
          uri: input.uri ?? "",
          method: input.method ?? "",
          headers: input.headers ?? "",
          body: input.body ?? "",
          schemaResult: input.schemaResult ?? "",
          authorId: userId,
        },
      });

      return newAPISchema;
    }),

  getAllApiSchema: privateProcedure.query(async ({ ctx }) => {
    const userId = ctx.currentUser;

    const apiSchema = await ctx.prisma.aPISchema.findMany({
      where: {
        authorId: userId,
      },
    });

    return apiSchema;
  }),

  getApiSchemaById: privateProcedure
    .input(
      z.object({
        id: z.string().min(3).max(100),
      })
    )
    .query(async ({ ctx, input }) => {
      const schema = await ctx.prisma.aPISchema.findFirst({
        where: {
          id: input.id,
        },
      });

      return schema;
    }),

  updateAPISchema: privateProcedure
    .input(
      z.object({
        id: z.string().min(3).max(100),
        name: z.string().min(3).max(100),
        description: z.string().max(255).optional(),
        uri: z.string().max(255).optional(),
        method: z.string().max(255).optional(),
        headers: z.string().max(255).optional(),
        body: z.string().max(255).optional(),

        schemaResult: z.string().max(255).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const updatedApiSchema = await ctx.prisma.aPISchema.update({
        where: {
          id: input.id,
        },
        data: {
          name: input.name,
          description: input.description ?? "",
          uri: input.uri ?? "",
          method: input.method ?? "",
          headers: input.headers ?? "",
          body: input.body ?? "",
          schemaResult: input.schemaResult ?? "",
        },
      });

      return updatedApiSchema;
    }),
  deleteApiSchema: privateProcedure
    .input(
      z.object({
        id: z.string().min(3).max(100),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const deleteResult = await ctx.prisma.aPISchema.delete({
        where: {
          id: input.id,
        },
      });

      return deleteResult;
    }),
  deleteMultipleApiSchema: privateProcedure
    .input(
      z.object({
        ids: z.array(z.string().min(3).max(100)),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const deleteResult = await ctx.prisma.aPISchema.deleteMany({
        where: {
          id: {
            in: input.ids,
          },
        },
      });

      return deleteResult;
    }),
});
