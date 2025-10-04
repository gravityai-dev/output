/**
 * ProgressOutput Node Executor
 *
 * This node outputs progress update messages and publishes them to a Redis channel.
 * It publishes to the configured channel for workflow progress updates.
 */

import { PromiseNode, type NodeExecutionContext } from "@gravityai-dev/plugin-base";
import { ProgressOutputConfig, ProgressOutputResult, ProgressOutputServiceResult } from "../util/types";
import { publishProgress } from "../service/publishProgress";

const NODE_TYPE = "ProgressOutput";

export default class ProgressOutputExecutor extends PromiseNode {
  constructor() {
    super(NODE_TYPE);
  }

  protected async executeNode(
    inputs: Record<string, any>,
    config: ProgressOutputConfig,
    context: NodeExecutionContext
  ): Promise<ProgressOutputResult> {
    // Get logger from injected API
    const logger = context.api?.createLogger?.(NODE_TYPE) || console;
    
    // Validate config
    if (!config.text) {
      throw new Error("Text is required");
    }

    // Debug log the entire context
    logger.info("ProgressOutput context received", {
      hasWorkflow: !!context.workflow,
      workflowId: context.workflow?.id,
      hasVariables: !!context.workflow?.variables,
      variables: context.workflow?.variables,
      contextKeys: Object.keys(context),
    });

    // Get workflow variables with defaults
    const workflow = context.workflow!;
    const workflowVars = workflow?.variables || {};
    const finalVars = {
      chatId: workflowVars.chatId || "",
      conversationId: workflowVars.conversationId || "",
      userId: workflowVars.userId || "",
      providerId: workflowVars.providerId || "",
    };

    logger.info(`Progress output: ${config.text}`, {
      workflowId: workflow.id,
      runId: workflow.runId,
    });

    try {
      // Publish progress using shared service
      const result = await publishProgress({
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
      const serviceResult: ProgressOutputServiceResult = {
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

      // Return wrapped in __outputs
      return {
        __outputs: {
          output: serviceResult,
        },
      };
    } catch (error: any) {
      logger.error("Failed to publish progress output", error);
      throw error;
    }
  }
}
