/**
 * FormOutput Node Executor
 */

import { getPlatformDependencies, type NodeExecutionContext } from "@gravityai-dev/plugin-base";
import { FormOutputConfig, FormOutputResult, FormOutputServiceResult } from "../util/types";
import { publishForms } from "../service/publishForms";

// Get platform dependencies - CRITICAL: Use Pattern A to avoid instanceof errors
const { PromiseNode, createLogger } = getPlatformDependencies();

const NODE_TYPE = "FormOutput";

export default class FormOutputExecutor extends PromiseNode<FormOutputConfig> {
  constructor() {
    super(NODE_TYPE);
  }

  protected async executeNode(
    inputs: Record<string, any>,
    config: FormOutputConfig,
    context: NodeExecutionContext
  ): Promise<FormOutputResult> {
    const logger = createLogger("FormOutput");
    const { workflow = { id: "unknown", runId: "unknown" } } = context;

    const workflowVars = context.workflow?.variables || {};
    const finalVars = {
      chatId: workflowVars.chatId || "",
      conversationId: workflowVars.conversationId || "",
      userId: workflowVars.userId || "",
      providerId: workflowVars.providerId || "",
    };

    try {
      const formData = config.form;

      const result = await publishForms({
        forms: Array.isArray(formData) ? formData : [formData],
        redisChannel: config.redisChannel,
        chatId: finalVars.chatId,
        conversationId: finalVars.conversationId,
        userId: finalVars.userId,
        providerId: finalVars.providerId,
        workflowId: workflow.id,
        workflowRunId: workflow.runId,
        metadata: inputs.metadata,
      }, context.api);

      const serviceResult: FormOutputServiceResult = {
        formData,
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

      return {
        __outputs: {
          output: serviceResult,
        },
      };
    } catch (error: any) {
      logger.error("Failed to publish form output", error);
      throw error;
    }
  }
}
