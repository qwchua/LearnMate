import { StringParameter } from "aws-cdk-lib/aws-ssm";
import { Construct } from "constructs";

import path = require("path");

export class LmParameter extends Construct {
  public readonly openAiStatusParameter: StringParameter;

  constructor(scope: Construct, id: string) {
    super(scope, id);

    this.openAiStatusParameter = this.createOpenAiStatusParameter();
  }

  private createOpenAiStatusParameter(): StringParameter {
    const parameter = new StringParameter(this, "OpenAIApiStatusParameter", {
      parameterName: "/openai/api/status",
      stringValue: "unknown", // initial value
    });

    return parameter;
  }
}
