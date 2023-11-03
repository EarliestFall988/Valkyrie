import { z } from "zod";
import { createTRPCRouter, privateProcedure } from "../trpc";

const key = "some key"; //TODO: make this an actually good key that we store in env...
const host = process.env.SERVER_HOST;

export const instructionSetSchemaVersionRouter = createTRPCRouter({
  createNewVersion: privateProcedure
    .input(
      z.object({
        name: z.string().min(3).max(100),
        description: z.string().max(255).optional(),
        productionBuild: z.boolean().optional(),
        jobId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const job = await ctx.prisma.job.findFirst({
        where: {
          id: input.jobId,
        },
      });

      if (job === null) {
        throw new Error("Job not found");
      }

      const uri = `${host}api/v1/getdata/?devId=create`;

      console.log(uri);

      const data = await fetch(uri, {
        method: "POST",
        body: JSON.stringify({
          id: input.jobId,
          key: key,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      }).then((res) => {
        if (res.status !== 200) {
          throw new Error("Failed to fetch data");
        }
        return res.text();
      });

      const newVersion = await ctx.prisma.instructionSetSchemaVersion.create({
        data: {
          name: input.name,
          description: input.description ?? "",
          productionBuild: input.productionBuild,
          jobid: input.jobId,
          data: data,
        },
      });

      return newVersion;
    }),

  getVersionsByJobId: privateProcedure
    .input(
      z.object({
        jobId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const results = ctx.prisma.instructionSetSchemaVersion.findMany({
        where: {
          jobid: input.jobId,
        },
        orderBy: {
          updatedAt: "desc",
        },
      });

      return results;
    }),

  updateVersion: privateProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(3).max(100),
        description: z.string().max(255).optional(),
        productionBuild: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const version = await ctx.prisma.instructionSetSchemaVersion.findFirst({
        where: {
          id: input.id,
        },
      });

      if (version === null) {
        throw new Error("Version not found");
      }

      const updatedVersion =
        await ctx.prisma.instructionSetSchemaVersion.update({
          where: {
            id: input.id,
          },
          data: {
            name: input.name,
            description: input.description ?? "",
            productionBuild: input.productionBuild,
          },
        });

      return updatedVersion;
    }),

  deleteVersions: privateProcedure
    .input(
      z.array(
        z.object({
          id: z.string(),
        })
      )
    )
    .mutation(async ({ ctx, input }) => {
      const result = await ctx.prisma.instructionSetSchemaVersion.deleteMany({
        where: {
          id: {
            in: input.map((id) => id.id),
          },
        },
      });

      return result;
    }),
});
