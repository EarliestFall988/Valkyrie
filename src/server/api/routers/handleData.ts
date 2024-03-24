import { z } from "zod";
import { createTRPCRouter, privateProcedure } from "../trpc";
import type {
  APISchema,
  CustomFunction,
  Example,
  InstructionSetSchemaVersion,
  Job,
  Parameters,
  Pins,
  VariableType,
  Variables,
} from "@prisma/client";

export const utilRouter = createTRPCRouter({
  pullAllData: privateProcedure.query(async ({ ctx }) => {
    if (ctx.userId !== "user_2QUCdDDKeie1QgbtjNJrvUWn11K") {
      return null;
    }

    const apischema = await ctx.prisma.aPISchema.findMany();

    const functionData = await ctx.prisma.customFunction.findMany();

    const example = await ctx.prisma.example.findMany();

    const instructionSetSchemaVersionData =
      await ctx.prisma.instructionSetSchemaVersion.findMany();

    const jobData = await ctx.prisma.job.findMany();

    const parameterData = await ctx.prisma.parameters.findMany();

    const pins = await ctx.prisma.pins.findMany();

    const variableTypeData = await ctx.prisma.variableType.findMany();

    const variables = await ctx.prisma.variables.findMany();

    return {
      apischema,
      functionData,
      example,
      instructionSetSchemaVersionData,
      jobData,
      parameterData,
      pins,
      variableTypeData,
      variables,
    };
  }),

  pushData: privateProcedure
    .input(
      z.object({
        apiSchema: z
          .object({
            id: z.string(),
            createdAt: z.date(),
            updatedAt: z.date(),
            name: z.string(),
            description: z.string(),
            uri: z.string(),
            method: z.string(),
            headers: z.string(),
            body: z.string(),
            schemaResult: z.string(),
            authorId: z.string(),
          })
          .array(),
        functionData: z
          .object({
            id: z.string(),
            createdAt: z.date(),
            updatedAt: z.date(),
            name: z.string(),
            description: z.string().nullable(),
            jobId: z.string(),
            authorId: z.string(),
          })
          .array(),
        instructionSetSchemaVersionData: z
          .object({
            id: z.string(),
            createdAt: z.date(),
            updatedAt: z.date(),
            name: z.string(),
            description: z.string(),
            data: z.string(),
            jobid: z.string(),
            productionBuild: z.boolean(),
            authorId: z.string(),
          })
          .array(),
        jobData: z
          .object({
            id: z.string(),
            createdAt: z.date(),
            updatedAt: z.date(),
            title: z.string(),
            description: z.string().nullable(),
            ui_data: z.string(),
            data: z.string(),
            authorId: z.string(),
          })
          .array(),
        parameterData: z
          .object({
            id: z.string(),
            createdAt: z.date(),
            updatedAt: z.date(),
            name: z.string(),
            description: z.string().nullable(),
            type: z.string(),
            required: z.boolean(),
            default: z.string().nullable(),
            io: z.string(),
            customFunctionId: z.string(),
          })
          .array(),
        pins: z
          .object({
            id: z.string(),
            createdAt: z.date(),
            updatedAt: z.date(),
            pinCode: z.string(),
            userId: z.string(),
            status: z.string(),
            deviceId: z.string(),
            deviceName: z.string(),
            deviceDescription: z.string(),
            deviceType: z.string(),
          })
          .array(),
        variableTypeData: z
          .object({
            id: z.string(),
            createdAt: z.date(),
            updatedAt: z.date(),
            typeName: z.string(),
            description: z.string(),
            colorHex: z.string(),
            jobId: z.string(),
            authorId: z.string(),
          })
          .array(),
        variables: z
          .object({
            id: z.string(),
            createdAt: z.date(),
            updatedAt: z.date(),
            name: z.string(),
            description: z.string().nullable(),
            type: z.string(),
            typeId: z.string(),
            required: z.boolean(),
            default: z.string().nullable(),
            value: z.string().nullable(),
            jobId: z.string(),
            authorId: z.string(),
          })
          .array(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const id = ctx.userId;

      if (id !== "user_2QUCdDDKeie1QgbtjNJrvUWn11K") {
        return null;
      }

      // const parsedData = JSON.parse(input.data) as {
      //   apischema: APISchema[];
      //   //   functionData: CustomFunction[];
      //   //   example: Example[];
      //   //   instructionSetSchemaVersionData: InstructionSetSchemaVersion[];
      //   //   jobData: Job[];
      //   //   parameterData: Parameters[];
      //   //   pins: Pins[];
      //   //   variableTypeData: VariableType[];
      //   //   variables: Variables[];
      // };

      await ctx.prisma.aPISchema.deleteMany({});
      await ctx.prisma.customFunction.deleteMany({});

      input.apiSchema.map(async (apischema) => {
        await ctx.prisma.aPISchema.create({
          data: apischema,
        });
      });

      input.functionData.map(async (data) => {
        await ctx.prisma.customFunction.create({
          data: data,
        });
      });

      // parsedData.example.map(async (data) => {
      //   await ctx.prisma.example.create({
      //     data: data,
      //   });
      // });

      // parsedData.instructionSetSchemaVersionData.map(async (data) => {
      //   await ctx.prisma.instructionSetSchemaVersion.create({
      //     data: data,
      //   });
      // });

      // parsedData.jobData.map(async (data) => {
      //   await ctx.prisma.job.create({
      //     data: data,
      //   });
      // });

      // parsedData.parameterData.map(async (data) => {
      //   await ctx.prisma.parameters.create({
      //     data: data,
      //   });
      // });

      // parsedData.pins.map(async (data) => {
      //   await ctx.prisma.pins.create({
      //     data: data,
      //   });
      // });

      // parsedData.variableTypeData.map(async (data) => {
      //   await ctx.prisma.variableType.create({
      //     data: data,
      //   });
      // });

      // parsedData.variables.map(async (data) => {
      //   await ctx.prisma.variables.create({
      //     data: data,
      //   });
      // });

      return "Data pushed";
    }),
});
