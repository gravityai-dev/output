import { getPlatformDependencies, type EnhancedNodeDefinition } from "@gravityai-dev/plugin-base";
import { SYSTEM_CHANNEL, AI_RESULT_CHANNEL, QUERY_MESSAGE_CHANNEL } from "@gravityai-dev/gravity-server";
import CardOutputExecutor from "./executor";

export const NODE_TYPE = "CardOutput";

function createNodeDefinition(): EnhancedNodeDefinition {
  const { NodeInputType } = getPlatformDependencies();
  
  return {
    packageVersion: "1.0.10",
    type: NODE_TYPE,
    isService: false,
    name: "Card Output",
    description: "Sends flexible card component specifications to the output",
    category: "Output",
    color: "#6366f1",
    logoUrl: "https://res.cloudinary.com/sonik/image/upload/v1751366180/gravity/icons/gravityIcon.png",
    inputs: [{ name: "signal", type: NodeInputType.ANY }],
    outputs: [{ name: "output", type: NodeInputType.ANY }],
    // Schema for the node configuration UI
    configSchema: {
      type: "object",
      properties: {
        cards: {
          type: "object",
          title: "Cards Data",
          description:
            "JavaScript template that returns cards array. Supports template syntax like ${input.fieldName} to reference input data.",
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
    // No services - this is an output node
    services: {
      provides: [],
      requires: {},
    },
  };
}

const definition = createNodeDefinition();

export const CardOutputNode = {
  definition,
  executor: CardOutputExecutor,
};

export { createNodeDefinition };
