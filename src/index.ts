import { createPlugin, type GravityPluginAPI } from "@gravityai-dev/plugin-base";
import packageJson from "../package.json";

const plugin = createPlugin({
  name: packageJson.name,
  version: packageJson.version,
  description: packageJson.description,

  async setup(api: GravityPluginAPI) {
    // Initialize platform dependencies
    const { initializePlatformFromAPI } = await import("@gravityai-dev/plugin-base");
    initializePlatformFromAPI(api);

    // Import and register CardOutput node
    const { CardOutputNode } = await import("./CardOutput/node");
    api.registerNode(CardOutputNode);

    // Import and register TextOutput node
    const { TextOutputNode } = await import("./TextOutput/node");
    api.registerNode(TextOutputNode);

    // Import and register FormOutput node
    const { FormOutputNode } = await import("./FormOutput/node");
    api.registerNode(FormOutputNode);

    // Import and register JSONOutput node
    const { JSONOutputNode } = await import("./JSONOutput/node");
    api.registerNode(JSONOutputNode);

    // Import and register ProgressOutput node
    const { ProgressOutputNode } = await import("./ProgressOutput/node");
    api.registerNode(ProgressOutputNode);

    // Import and register QuestionOutput node
    const { QuestionOutputNode } = await import("./QuestionOutput/node");
    api.registerNode(QuestionOutputNode);

    // No credentials needed for output nodes
  },
});

export default plugin;
