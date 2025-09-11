/**
 * JSONOutput Node Executor
 *
 * This node outputs any JSON data structure and publishes it to a Redis channel.
 * It can be used to send user profiles, memories, analytics data, or any other JSON structure.
 */

import { getPlatformDependencies, type NodeExecutionContext } from "@gravityai-dev/plugin-base";
import { AI_RESULT_CHANNEL } from "@gravityai-dev/gravity-server";
import { JSONOutputConfig, JSONOutputResult, JSONOutputServiceResult } from "../util/types";
import { publishJSON } from "../service/publishJSON";

// Get platform dependencies - CRITICAL: Use Pattern A to avoid instanceof errors
const { PromiseNode, createLogger } = getPlatformDependencies();

const NODE_TYPE = "JSONOutput";

export default class JSONOutputExecutor extends PromiseNode<JSONOutputConfig> {
  constructor() {
    super(NODE_TYPE);
  }

  protected async executeNode(
    inputs: Record<string, any>,
    config: JSONOutputConfig,
    context: NodeExecutionContext
  ): Promise<JSONOutputResult> {
    const logger = createLogger("JSONOutput");
    const { workflow = { id: "unknown", runId: "unknown" } } = context;

    // Debug log the entire context
    logger.info("JSONOutput context received", {
      hasWorkflow: !!context.workflow,
      workflowId: context.workflow?.id,
      hasVariables: !!context.workflow?.variables,
      variables: context.workflow?.variables,
      contextKeys: Object.keys(context),
      configKeys: Object.keys(config || {}),
      fullConfig: config,
      configDataType: typeof config?.data,
      configDataValue: config?.data,
      dataType: config?.dataType,
    });

    // Get workflow variables
    const workflowVars = context.workflow?.variables || {};
    const finalVars = {
      chatId: workflowVars.chatId || "",
      conversationId: workflowVars.conversationId || "",
      userId: workflowVars.userId || "",
      providerId: workflowVars.providerId || "",
    };

    logger.info(`JSON output: ${JSON.stringify(config.data)}`, {
      workflowId: workflow.id,
      runId: workflow.runId,
      dataType: config.dataType,
    });

    try {
      // The data field is already a JavaScript object from the template system
      const jsonData = config.data;

      // Publish JSON using shared service
      const result = await publishJSON({
        data: jsonData,
        dataType: config.dataType || "json",
        redisChannel: config.redisChannel || AI_RESULT_CHANNEL,
        chatId: finalVars.chatId,
        conversationId: finalVars.conversationId,
        userId: finalVars.userId,
        providerId: finalVars.providerId,
        workflowId: workflow.id,
        workflowRunId: workflow.runId,
        metadata: inputs.metadata,
      });

      // Build service result
      const serviceResult: JSONOutputServiceResult = {
        data: jsonData,
        dataType: config.dataType || "json",
        channel: result.channel,
        chatId: finalVars.chatId,
        conversationId: finalVars.conversationId,
        userId: finalVars.userId,
        providerId: finalVars.providerId,
        success: result.success,
        workflow: {
          id: workflow.id,
          variables: finalVars,
        },
      };

      // Return wrapped in __outputs
      return {
        __outputs: {
          output: serviceResult,
        },
      };
    } catch (error: any) {
      logger.error("Failed to publish JSON output", error);
      throw error;
    }
  }
}
