import { getPlatformDependencies, type EnhancedNodeDefinition } from "@gravityai-dev/plugin-base";
import { AI_RESULT_CHANNEL } from "@gravityai-dev/gravity-server";
import FormOutputExecutor from "./executor";

export const NODE_TYPE = "FormOutput";

function createNodeDefinition(): EnhancedNodeDefinition {
  const { NodeInputType } = getPlatformDependencies();
  
  return {
    packageVersion: "1.0.13",
    type: NODE_TYPE,
    isService: false,
    name: "Form Output",
    description: "Sends form component specifications to the output",
    category: "Output",
    color: "#6366f1",
    logoUrl: "https://res.cloudinary.com/sonik/image/upload/v1751366180/gravity/icons/gravityIcon.png",
    inputs: [{ name: "signal", type: NodeInputType.ANY }],
    outputs: [{ name: "output", type: NodeInputType.ANY }],
    configSchema: {
      type: "object",
      properties: {
        form: {
          type: "object",
          title: "Form Data",
          description: "JavaScript template that returns form object",
          default: "",
          "ui:field": "template",
        },
        redisChannel: {
          type: "string",
          title: "Redis Channel",
          description: "Redis channel to publish the form to",
          default: AI_RESULT_CHANNEL,
        },
      },
      required: [],
    },
    capabilities: { isTrigger: false },
    services: { provides: [], requires: {} },
  };
}

const definition = createNodeDefinition();

export const FormOutputNode = {
  definition,
  executor: FormOutputExecutor,
};

export { createNodeDefinition };
