/**
 * CardOutput Node Executor
 *
 * This node outputs card component specifications and publishes them to a Redis channel.
 * It publishes to the configured channel for card display in the UI.
 */

import { getPlatformDependencies, type NodeExecutionContext } from "@gravityai-dev/plugin-base";
import { AI_RESULT_CHANNEL } from "@gravityai-dev/gravity-server";
import { CardOutputConfig, CardOutputResult, CardOutputServiceResult } from "../util/types";
import {
  validateConfig,
  validateWorkflowVariablesWithWarning,
  getFinalWorkflowVariables,
} from "../util/validation";
import { publishCards } from "../service/publishCards";

// Get platform dependencies - CRITICAL: Use Pattern A to avoid instanceof errors
const { PromiseNode, createLogger } = getPlatformDependencies();

const NODE_TYPE = "CardOutput";

export default class CardOutputExecutor extends PromiseNode<CardOutputConfig> {
  constructor() {
    super(NODE_TYPE);
  }

  protected async executeNode(
    inputs: Record<string, any>,
    config: CardOutputConfig,
    context: NodeExecutionContext
  ): Promise<CardOutputResult> {
    const logger = createLogger("CardOutput");
    const { workflow = { id: "unknown", runId: "unknown" } } = context;

    // Debug log the entire context
    logger.info("CardOutput context received", {
      hasWorkflow: !!context.workflow,
      workflowId: context.workflow?.id,
      hasVariables: !!context.workflow?.variables,
      variables: context.workflow?.variables,
      contextKeys: Object.keys(context),
      configKeys: Object.keys(config || {}),
      fullConfig: config,
      configCardsType: typeof config?.cards,
      configCardsValue: config?.cards,
    });

    // Validate configuration
    const configValidation = validateConfig(config);
    if (!configValidation.success) {
      throw new Error(`Invalid configuration: ${configValidation.error}`);
    }

    // Get workflow variables
    const workflowVars = context.workflow?.variables || {};
    const isDebugMode = workflow.id === "debug-workflow" || workflow.id === "debug";

    // Get final variables with debug defaults
    const finalVars = getFinalWorkflowVariables(workflowVars, workflow.id, isDebugMode);

    // Validate workflow variables
    const varsValidation = validateWorkflowVariablesWithWarning(finalVars, isDebugMode);
    if (varsValidation.warning) {
      logger.info(`Validation warning: ${varsValidation.warning}`);
    }

    logger.info(`Card output: ${JSON.stringify(config.cards)}`, {
      workflowId: workflow.id,
      runId: workflow.runId,
    });

    try {
      // The cards field is already a JavaScript object from the template system
      const cardData = config.cards;

      // Publish card using shared service
      const result = await publishCards({
        cards: Array.isArray(cardData) ? cardData : [cardData], // Ensure it's an array
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
      const serviceResult: CardOutputServiceResult = {
        cardData,
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
      logger.error("Failed to publish card output", error);
      throw error;
    }
  }
}
