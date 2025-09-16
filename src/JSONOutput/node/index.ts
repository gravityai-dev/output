import { getPlatformDependencies, type EnhancedNodeDefinition } from "@gravityai-dev/plugin-base";
import { SYSTEM_CHANNEL, AI_RESULT_CHANNEL, QUERY_MESSAGE_CHANNEL } from "@gravityai-dev/gravity-server";
import JSONOutputExecutor from "./executor";

export const NODE_TYPE = "JSONOutput";

function createNodeDefinition(): EnhancedNodeDefinition {
  const { NodeInputType } = getPlatformDependencies();
  
  return {
    packageVersion: "1.0.14",
    type: NODE_TYPE,
    isService: false,
    name: "JSON Output",
    description: "Sends any JSON data structure to the output channel",
    category: "Output",
    color: "#6366f1",
    logoUrl: "https://res.cloudinary.com/sonik/image/upload/v1751366180/gravity/icons/gravityIcon.png",
    inputs: [{ name: "signal", type: NodeInputType.ANY }],
    outputs: [{ name: "output", type: NodeInputType.ANY }],
    configSchema: {
      type: "object",
      properties: {
        data: {
          type: "object",
          title: "JSON Data",
          description:
            "JavaScript template that returns any JSON data structure. Supports template syntax like ${input.fieldName} to reference input data.",
          default: {},
          "ui:field": "template",
        },
        dataType: {
          type: "string",
          title: "Data Type",
          description: "Type identifier for the JSON data (e.g., 'userProfile', 'memories', 'analytics')",
          default: "json",
        },
        redisChannel: {
          type: "string",
          title: "Redis Channel",
          description: "Redis channel to publish the JSON data to",
          enum: [AI_RESULT_CHANNEL, SYSTEM_CHANNEL, QUERY_MESSAGE_CHANNEL],
          enumNames: ["AI Results", "System Messages", "Query Messages"],
          default: AI_RESULT_CHANNEL,
        },
      },
      required: [],
    },
    capabilities: {
      isTrigger: false,
    },
    services: {
      provides: [],
      requires: {},
    },
  };
}

const definition = createNodeDefinition();

export const JSONOutputNode = {
  definition,
  executor: JSONOutputExecutor,
};

export { createNodeDefinition };
