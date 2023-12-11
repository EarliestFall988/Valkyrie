import type { NextApiRequest, NextApiResponse } from "next";
import type { Edge, Node } from "reactflow";
import { prisma } from "~/server/db";

type ContentRequestType = {
  key: string;
  id: string;
};

const key = "some key"; //TODO: put this in the env file

type VariableType = {
  name: string;
  id: string;
  type: string;
  value: string;
};
export type InputParamType = {
  name: string;
  type: string;
  connectVar: string;
};

export type FunctionType = {
  name: string;
  parameters?: InputParamType[];
};

type StateType = {
  type: string;
  name: string;
  function: string;
};

type TransitionType = {
  from: string;
  to: string;
  outcome: number;
};

type InstructionSetType = {
  name: string;
  variables: VariableType[];
  functions: FunctionType[];
  states: StateType[];
  transitions: TransitionType[];
};

const ContentRoute = async (req: NextApiRequest, res: NextApiResponse) => {
  // console.log(req);

  // console.log("method", '"' + req.method + '"');

  if (req.method?.trim() !== "POST") {
    res.status(405).json({ message: "Method not allowed" });
    return;
  }

  const versionId = req.query.version as string | undefined;
  const k = req.headers["x-api-key"] as string;
  const instructionId = req.headers["x-instruction-id"] as string;

  if (k == "" || k == null) {
    res.status(403).json({ message: "Invalid key" });
    return;
  }

  if (k !== key) {
    res.status(403).json({ message: "Invalid key" });
    return;
  }

  if (instructionId === null || instructionId === "") {
    res.status(400).json({ message: "Invalid id" });
    return;
  }

  if (!versionId) {
    const instructionSetVersion =
      await prisma.instructionSetSchemaVersion.findFirst({
        where: {
          jobid: instructionId,
          productionBuild: true,
        },
        orderBy: {
          updatedAt: "desc",
        },
      });

    if (instructionSetVersion != null)
      return res.status(200).send(instructionSetVersion.data);
    else
      return res.status(404).json({
        message:
          "No production instruction set found. Please build your instruction set before fetching data.",
      });
  }

  if (versionId && versionId !== "create") {
    const version = await prisma.instructionSetSchemaVersion.findFirst({
      where: {
        jobid: instructionId,
        id: versionId,
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    if (version != null) return res.status(200).send(version.data);
  }

  //create a new version ... based on the current structure of the instruction set

  const instructions = await prisma.job.findFirst({
    where: {
      id: instructionId,
    },
    include: {
      variables: {
        orderBy: {
          name: "asc",
        },
      },
    },
  });

  if (!instructions || instructions === null) {
    res.status(404).json({ message: "Not found" });
    return;
  }

  // return res.json(JSON.parse(instructions.data));

  const instructionData = instructions.data;

  if (
    instructions.data === null ||
    instructions.data === undefined ||
    instructions.data === ""
  ) {
    console.log("no data found");
    res.status(500).json({ message: "No data found" });
    return;
  }

  const nodeAndEdgeData = JSON.parse(instructionData) as {
    nodes: Node[];
    edges: Edge[];
  };

  const dataEdges = nodeAndEdgeData.edges.filter((n) => {
    const res = n.sourceHandle?.startsWith("t") && n.targetHandle === "in";
    return !res;
  });

  // console.log(dataEdges);

  const varParamConnectionIds = dataEdges
    .map((e) => {
      const paramHandleId = e.sourceHandle?.startsWith("vout")
        ? e.targetHandle
        : e.sourceHandle;

      const varHandleId = e.targetHandle?.startsWith("vin")
        ? e.targetHandle
        : e.sourceHandle;

      console.log(e);

      // console.log("varid ", varHandleId?.split(" ")[1]?.trim());

      console.log(varHandleId);

      const varDbId = varHandleId?.split(" ")[1]?.trim();
      const varInstanceId = varHandleId?.split(" ")[2]?.trim();

      const paramDbId = paramHandleId?.split(" ")[1]?.trim();
      const paramInstanceId = paramHandleId?.split(" ")[2]?.trim();

      return { paramDbId, varDbId, paramInstanceId, varInstanceId };
    })
    .filter(
      (e) => e?.paramDbId && e.varDbId && e.paramInstanceId && e.varInstanceId
    );

  // console.log("connected param ids ", varParamConnectionIds);

  const paramsFromDb = await prisma.parameters.findMany({
    where: {
      id: {
        in: varParamConnectionIds.map((x) => x.paramDbId!),
      },
    },
  });

  // const varsFromDb = await prisma.variables.findMany({
  //   where: {
  //     id: {
  //       in: varParamConnectionIds.map((x) => x.varDbId!),
  //     },
  //   },
  // });

  const varsFromDb = instructions.variables.map((v) => {
    return {
      name: v.name.trim(),
      id: v.id,
      type: v.type.trim(),
      value: v.value,
    } as VariableType;
  });

  // console.log("vars from db", varsFromDb);

  const connections = [] as {
    name: string;
    dbId: string;
    instanceId: string;
    variableName: string;
  }[];

  varParamConnectionIds.forEach((e) => {
    // console.log(e);

    const param = paramsFromDb.find((p) => p.id === e.paramDbId);
    const variable = varsFromDb.find((v) => v.id === e.varDbId);

    // console.log(param);
    //console.log(variable);

    if (param === undefined || variable === undefined) {
      return;
    }
    connections.push({
      name: param.name.trim(),
      dbId: e.paramDbId ?? "",
      instanceId: e.paramInstanceId ?? "",
      variableName: variable.name.trim(),
    });
  });

  console.log("connections", connections);

  const funcs = await prisma.customFunction.findMany({
    where: {
      jobId: instructionId,
    },
    include: {
      parameters: {
        orderBy: {
          name: "asc",
        },
      },
    },
  });

  let containsStart = false;
  let containsExit = false;

  const functionInstanceIds = [] as {
    id: string;
    instanceId: string;
    used: boolean;
  }[];

  const matchValidFunctions = funcs.filter((f) => {
    if (f.name.toLowerCase().trim() === "start") {
      containsStart = true;
      return false;
    }
    if (f.name.toLowerCase().trim() === "exit") {
      containsExit = true;
      return false;
    }

    const fun = nodeAndEdgeData.nodes.find((n) => {
      const data = n.data as { label: string; instanceId: string };
      if (data.label.trim() === f.name.trim()) {
        functionInstanceIds.push({
          id: f.id,
          instanceId: data.instanceId,
          used: false,
        });

        return true && data.instanceId;
      }
    });

    return fun !== undefined && fun !== null;
  });

  console.log("function instance ids", functionInstanceIds);

  const functions = functionInstanceIds
    .map((ins) => {
      const f = matchValidFunctions.find((f) => f.id === ins.id);
      if (f === undefined) return null;

      ins.used = true;

      return {
        name: f.name + " " + ins.instanceId,
        parameters: f.parameters.map((p) => {
          return {
            name: p.name.trim(),
            type: p.type,
            connectVar:
              connections.find((c) => {
                return (
                  c.dbId === p.id &&
                  c.name === p.name &&
                  c.instanceId === ins.instanceId
                );
              })?.variableName ?? "",
          } as InputParamType;
        }),
      } as FunctionType;
    })
    .filter((f) => f !== null) as FunctionType[];

  const states = functions.map((f) => {
    // let type = "state";
    // if (f.name.toLowerCase().trim() === "start") {
    //   containsStart = true;
    //   return {
    //     name: "s",
    //     type: "start",
    //     function: "Continue",
    //   };
    // }
    // if (f.name.toLowerCase().trim() === "exit") {
    //   containsExit = true;
    //   return {
    //     name: "exit state",
    //     type: "fallback",
    //     function: "Continue",
    //   };
    // }

    return {
      type: "state",
      name: f.name.trim() + " state",
      function: f.name.trim(),
    } as StateType;
  });

  states.push({
    name: "Start state",
    type: "start",
    function: "Continue",
  });

  states.push({
    name: "Exit state",
    type: "fallback",
    function: "Continue",
  });

  functions.push({
    name: "Continue",
    parameters: [],
  });

  if (!containsStart) {
    res.status(500).json({ message: "No start function found" });
    return;
  }

  if (!containsExit) {
    res.status(500).json({ message: "No exit function found" });
    return;
  }

  // console.log(nodeAndEdgeData.nodes);
  // console.log(nodeAndEdgeData.edges);

  const transitions = nodeAndEdgeData.edges
    .filter((n) => {
      return n.sourceHandle?.startsWith("t") && n.targetHandle === "in";
    })
    .map((n) => {
      const source = nodeAndEdgeData.nodes.find((x) => {
        return x.id === n.source;
      });

      const target = nodeAndEdgeData.nodes.find((x) => {
        return x.id === n.target;
      });

      if (source === undefined || target === undefined) {
        return null;
      }

      const sourceData = source.data as { label: string; instanceId: string };
      const labelData = target.data as { label: string; instanceId: string };
      let outcome = n.sourceHandle?.substr(1);

      if (outcome === "-") {
        outcome = "-1";
      }

      return {
        from: sourceData.label.trim() + " " + sourceData.instanceId + " state",
        to: labelData.label.trim() + " " + labelData.instanceId + " state",
        outcome: parseInt(outcome ?? "1"),
      } as TransitionType;
    });

  const instructionSet = {
    name: instructions.title,
    variables: varsFromDb,
    functions: functions,
    states: states,
    transitions: transitions,
  } as InstructionSetType;

  // console.log("instruction set ", instructionSet);

  res.status(200).json(instructionSet);
};

export default ContentRoute;
