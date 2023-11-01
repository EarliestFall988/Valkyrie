import { z } from "zod";
import { createTRPCRouter, privateProcedure } from "../trpc";

export const variablesRouter = createTRPCRouter({
  createVariable: privateProcedure
    .input(
      z.object({
        name: z.string().min(3).max(100),
        description: z.string().max(255).optional(),
        type: z.string().min(3).max(100),
        jobId: z.string().min(3).max(100),
        required: z.boolean(),
        value: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const newVariable = await ctx.prisma.variables.create({
        data: {
          name: input.name,
          description: input.description,
          type: input.type,
          jobId: input.jobId,
          required: input.required,
          value: input.value,
          job: {
            connect: {
              id: input.jobId,
            },
          },
        },
      });

      return newVariable;
    }),

  getVariablesByJobId: privateProcedure
    .input(
      z.object({
        id: z.string().min(3).max(100),
      })
    )
    .query(async ({ ctx, input }) => {
      const variables = await ctx.prisma.variables.findMany({
        where: {
          jobId: input.id,
        },
      });

      return variables;
    }),

  updateVariable: privateProcedure
    .input(
      z.object({
        id: z.string().min(3).max(100),
        name: z.string().min(3).max(100),
        description: z.string().max(255).optional(),
        type: z.string().min(3).max(100),
        required: z.boolean(),
        value: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const updatedVariable = await ctx.prisma.variables.update({
        where: {
          id: input.id,
        },
        data: {
          name: input.name,
          description: input.description,
          type: input.type,
          required: input.required,
          value: input.value,
        },
      });
      return updatedVariable;
    }),

  upsertVariables: privateProcedure
    .input(
      z.array(
        z.object({
          id: z.string().min(3).max(100),
          name: z.string().min(3).max(100),
          description: z.string().max(255).optional(),
          type: z.string().min(3).max(100),
          jobId: z.string().min(3).max(100),
          required: z.boolean(),
          value: z.string().optional(),
        })
      )
    )
    .mutation(async ({ ctx, input }) => {
      const updatedVariables = await ctx.prisma.$transaction(
        input.map((variable) => {
          return ctx.prisma.variables.upsert({
            where: {
              id: variable.id,
            },
            update: {
              name: variable.name,
              description: variable.description,
              type: variable.type,
              required: variable.required,
              value: variable.value,
            },
            create: {
              name: variable.name,
              description: variable.description,
              type: variable.type,
              jobId: variable.jobId,
              required: variable.required,
              value: variable.value,
            },
          });
        })
      );
      return updatedVariables;
    }),

  deleteVariable: privateProcedure
    .input(
      z.object({
        id: z.string().min(3).max(100),
      })
    )
    .mutation(async ({ ctx, input }) => {
      //disconnect the variable from the job
      await ctx.prisma.job.update({
        where: {
          id: input.id,
        },
        data: {
          variables: {
            disconnect: {
              id: input.id,
            },
          },
        },
      });

      const deletedVariable = await ctx.prisma.variables.delete({
        where: {
          id: input.id,
        },
      });
      return deletedVariable;
    }),
});
