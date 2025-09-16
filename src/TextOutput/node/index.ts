import { getPlatformDependencies, type EnhancedNodeDefinition } from "@gravityai-dev/plugin-base";
import { SYSTEM_CHANNEL, AI_RESULT_CHANNEL, QUERY_MESSAGE_CHANNEL } from "@gravityai-dev/gravity-server";
import TextOutputExecutor from "./executor";

export const NODE_TYPE = "TextOutput";

function createNodeDefinition(): EnhancedNodeDefinition {
  const { NodeInputType } = getPlatformDependencies();
  
  return {
    packageVersion: "1.0.12",
    type: NODE_TYPE,
    isService: false,
    name: "Text Output",
    description: "Sends plain text messages to the output",
    category: "Output",
    color: "#6366f1",
    logoUrl: "https://res.cloudinary.com/sonik/image/upload/v1751366180/gravity/icons/gravityIcon.png",
    inputs: [{ name: "signal", type: NodeInputType.ANY }],
    outputs: [{ name: "output", type: NodeInputType.ANY }],
    // Schema for the node configuration UI
    configSchema: {
      type: "object",
      properties: {
        text: {
          type: "string",
          title: "Text",
          description: "The text to output. Supports template syntax like ${input.fieldName} to reference input data.",
          default: "",
          "ui:field": "template",
        },
        redisChannel: {
          type: "string",
          title: "Redis Channel",
          description: "Redis channel to publish the text to",
          enum: [AI_RESULT_CHANNEL, SYSTEM_CHANNEL, QUERY_MESSAGE_CHANNEL],
          enumNames: ["AI Results", "System Messages", "Query Messages"],
          default: AI_RESULT_CHANNEL,
        },
      },
      required: [],
    },
    // Declare capabilities
    capabilities: {
      isTrigger: false,
    },
  };
}

const definition = createNodeDefinition();

export const TextOutputNode = {
  definition,
  executor: TextOutputExecutor,
};

export { createNodeDefinition };
