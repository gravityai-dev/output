/**
 * QuestionOutput Node Executor
 *
 * This node outputs question component specifications and publishes them to a Redis channel.
 * It publishes to the configured channel for question display in the UI.
 */

import { getPlatformDependencies, type NodeExecutionContext } from "@gravityai-dev/plugin-base";
import {
  validateConfig,
  validateWorkflowVariablesWithWarning,
  getFinalWorkflowVariables,
  QuestionOutputConfig,
  QuestionOutputResult,
  QuestionOutputServiceResult,
} from "../util";
import { publishQuestions } from "../service/publishQuestions";

// Get platform dependencies - CRITICAL: Use Pattern A to avoid instanceof errors
const { PromiseNode, createLogger } = getPlatformDependencies();

const NODE_TYPE = "QuestionOutput";

export default class QuestionOutputExecutor extends PromiseNode<QuestionOutputConfig> {
  constructor() {
    super(NODE_TYPE);
  }

  protected async executeNode(
    inputs: Record<string, any>,
    config: QuestionOutputConfig,
    context: NodeExecutionContext
  ): Promise<QuestionOutputResult> {
    const logger = createLogger("QuestionOutput");
    const { workflow = { id: "unknown", runId: "unknown" } } = context;

    // Debug log the entire context
    logger.info("QuestionOutput context received", {
      hasWorkflow: !!context.workflow,
      workflowId: context.workflow?.id,
      hasVariables: !!context.workflow?.variables,
      variables: context.workflow?.variables,
      contextKeys: Object.keys(context),
      configKeys: Object.keys(config || {}),
      fullConfig: config,
      configQuestionsType: typeof config?.questions,
      configQuestionsValue: config?.questions,
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

    logger.info(`Question output: ${JSON.stringify(config.questions)}`, {
      workflowId: workflow.id,
      runId: workflow.runId,
    });

    try {
      // The questions field is already a JavaScript object from the template system
      const questionData = config.questions;

      // Ensure questions is an array of strings
      let questionsArray: string[];
      if (Array.isArray(questionData)) {
        questionsArray = questionData.map((q) => (typeof q === "string" ? q : String(q)));
      } else if (typeof questionData === "string") {
        questionsArray = [questionData];
      } else {
        questionsArray = [String(questionData)];
      }

      // Publish questions using shared service
      const result = await publishQuestions({
        questions: questionsArray,
        redisChannel: config.redisChannel,
        chatId: finalVars.chatId,
        conversationId: finalVars.conversationId,
        userId: finalVars.userId,
        providerId: finalVars.providerId,
        workflowId: workflow.id,
        workflowRunId: workflow.runId,
        metadata: inputs.metadata,
      });

      // Build service result
      const serviceResult: QuestionOutputServiceResult = {
        questionData: questionsArray,
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
      logger.error("Failed to publish question output", error);
      throw error;
    }
  }
}
