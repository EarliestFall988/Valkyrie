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
  type: string;
  value: string;
};
type parameterType = {
  name: string;
  type: string;
  connectVar: string;
};

type FunctionType = {
  name: string;
  parameters: parameterType[];
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

  console.log("method", "\"" + req.method + "\"");

  if (req.method?.trim() !== "POST") {
    res.status(405).json({ message: "Method not allowed" });
    return;
  }

  const body = req.body as string;
  console.log(body);

  const result = req.body as ContentRequestType;

  const instructionId = result.id;
  const k = result.key;

  console.log("body result", result);

  if (k !== key) {
    res.status(403).json({ message: "Invalid key" });
    return;
  }

  if (instructionId === null || instructionId === "") {
    res.status(400).json({ message: "Invalid id" });
    return;
  }

  console.log("name", instructionId);

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

  if (instructions === null) {
    res.status(404).json({ message: "Not found" });
    return;
  }

  const instructionData = instructions.data;

  const nodeAndEdgeData = JSON.parse(instructionData) as {
    nodes: Node[];
    edges: Edge[];
  };

  const variableEdges = nodeAndEdgeData.edges.filter((n) => {
    const res = n.sourceHandle?.startsWith("t") && n.targetHandle === "in";
    return !res;
  });

  // console.log(variableEdges);

  const connectedParamIds = variableEdges
    .map((e) => {
      const paramId = e.sourceHandle?.startsWith("vout")
        ? e.targetHandle
        : e.sourceHandle;

      const varHandleId = e.targetHandle?.startsWith("vin")
        ? e.targetHandle
        : e.sourceHandle;

      console.log(e);

      console.log("varid ", varHandleId?.split(" ")[1]?.trim());
      const varId = varHandleId?.split(" ")[1]?.trim();

      return { paramId, varId };
    })
    .filter((e) => e !== undefined && e !== null);

  if (
    connectedParamIds.length === 0 ||
    connectedParamIds === undefined ||
    connectedParamIds === null
  ) {
    res.status(500).json({ message: "No variables connected to nodes" });
    return;
  }

  const params = await prisma.parameters.findMany({
    where: {
      id: {
        in: connectedParamIds.map((x) => x.paramId!),
      },
    },
  });

  console.log("params ", params);

  const variables = await prisma.variables.findMany({
    where: {
      id: {
        in: connectedParamIds.map((x) => x.varId!),
      },
    },
  });

  console.log("vars ", variables);

  const paramMap = new Map<string, string>();

  connectedParamIds.forEach((e) => {
    const param = params.find((p) => p.id === e.paramId);
    const variable = variables.find((v) => v.id === e.varId);

    if (param === undefined || variable === undefined) {
      return;
    }
    paramMap.set(param.name.trim(), variable.name.trim());
  });

  const vars = instructions.variables.map((v) => {
    return {
      name: v.name.trim(),
      type: v.type.trim(),
      value: v.value,
    } as VariableType;
  });

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

  const functions = funcs.map((f) => {
    return {
      name: f.name,
      parameters: f.parameters.map((p) => {
        return {
          name: p.name.trim(),
          type: p.type,
          connectVar: paramMap.get(p.name.trim()), //p.connectVar,
        } as parameterType;
      }),
    } as FunctionType;
  });

  const states = functions.map((f) => {
    let type = "state";
    if (f.name.toLowerCase().trim() === "start") {
      type = "start";
      containsStart = true;
    }
    if (f.name.toLowerCase().trim() === "exit") {
      type = "fallback";
      containsExit = true;
    }

    return {
      type,
      name: f.name.trim() + " state",
      function: f.name.trim(),
    } as StateType;
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

      const sourceData = source.data as { label: string };
      const labelData = target.data as { label: string };
      let outcome = n.sourceHandle?.substr(1);

      if (outcome === "-") {
        outcome = "-1";
      }

      return {
        from: sourceData.label.trim(),
        to: labelData.label.trim(),
        outcome: parseInt(outcome ?? "1"),
      } as TransitionType;
    });

  const instructionSet = {
    name: instructions.title,
    variables: vars,
    functions: functions,
    states: states,
    transitions: transitions,
  } as InstructionSetType;

  res.status(200).json(instructionSet);
};

export default ContentRoute;
