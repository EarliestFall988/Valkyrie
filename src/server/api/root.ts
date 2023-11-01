import { exampleRouter } from "~/server/api/routers/example";
import { createTRPCRouter } from "~/server/api/trpc";
import { jobsRouter } from "./routers/jobs";
import { functionsRouter } from "./routers/functions";
import { variablesRouter } from "./routers/variables";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  example: exampleRouter,
  jobs: jobsRouter,
  functions: functionsRouter,
  variables: variablesRouter
});

// export type definition of API
export type AppRouter = typeof appRouter;
