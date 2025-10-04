/**
 * TextOutput Node Executor
 *
 * This node outputs text data and publishes it to a Redis channel.
 * It publishes to the configured channel for workflow text outputs.
 */

import { getPlatformDependencies, type NodeExecutionContext } from "@gravityai-dev/plugin-base";
import { TextOutputConfig, TextOutputResult, TextOutputServiceResult, TextOutputError } from "../util/types";
import { publishText } from "../service/publishText";

// Get platform dependencies - CRITICAL: Use Pattern A to avoid instanceof errors
const { PromiseNode, createLogger } = getPlatformDependencies();

const NODE_TYPE = "TextOutput";

export default class TextOutputExecutor extends PromiseNode<TextOutputConfig> {
  constructor() {
    super(NODE_TYPE);
  }

  protected async executeNode(
    inputs: Record<string, any>,
    config: TextOutputConfig,
    context: NodeExecutionContext
  ): Promise<TextOutputResult> {
    const logger = createLogger("TextOutput");
    const workflow = context.workflow!;

    // Validate config
    if (!config.text) {
      throw new Error("Text is required");
    }

    // Debug log the entire context
    logger.info("TextOutput context received", {
      hasWorkflow: !!context.workflow,
      workflowId: context.workflow?.id,
      hasVariables: !!context.workflow?.variables,
      variables: context.workflow?.variables,
      contextKeys: Object.keys(context),
    });

    // Get workflow variables with defaults
    const workflowVars = context.workflow?.variables || {};
    const finalVars = {
      chatId: workflowVars.chatId || "",
      conversationId: workflowVars.conversationId || "",
      userId: workflowVars.userId || "",
      providerId: workflowVars.providerId || "",
    };

    logger.info(`Text output: ${config.text}`, {
      workflowId: workflow.id,
      runId: workflow.runId,
    });

    try {
      // Publish text using shared service with injected API
      const result = await publishText({
        text: config.text,
        redisChannel: config.redisChannel,
        chatId: finalVars.chatId,
        conversationId: finalVars.conversationId,
        userId: finalVars.userId,
        providerId: finalVars.providerId,
        workflowId: workflow.id,
        workflowRunId: workflow.runId,
        metadata: inputs.metadata,
      }, context.api);

      // Build service result
      const serviceResult: TextOutputServiceResult = {
        text: config.text,
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

      // Return wrapped in __outputs with output connector
      return {
        __outputs: {
          output: serviceResult,
        },
      };
    } catch (error: any) {
      logger.error("Failed to publish text output", error);
      
      // Return wrapped in __outputs with error connector
      const errorResult: TextOutputError = {
        error: error.message || "Failed to publish text output",
        code: error.code,
      };
      
      return {
        __outputs: {
          error: errorResult,
        },
      };
    }
  }
}
