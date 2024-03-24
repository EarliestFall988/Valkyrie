import { createTRPCRouter, privateProcedure } from "../trpc";

export const utilRouter = createTRPCRouter({
  pullAllData: privateProcedure.query(async ({ ctx }) => {
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
});
