import { Code, Function, FunctionProps, Runtime } from "aws-cdk-lib/aws-lambda";
import { StringParameter } from "aws-cdk-lib/aws-ssm";
import { Construct } from "constructs";

import path = require("path");

interface LmLambdaProps {
  openAiStatusParameter: StringParameter;
}

export class LmLambda extends Construct {
  public readonly checkOpenAiLambdaFunction: Function;

  constructor(scope: Construct, id: string, props: LmLambdaProps) {
    super(scope, id);

    this.checkOpenAiLambdaFunction = this.createCheckOpenAiLambdaFunction(
      props.openAiStatusParameter
    );
  }

  private createCheckOpenAiLambdaFunction(
    openAiStatusParameter: StringParameter
  ): Function {
    const functionProps: FunctionProps = {
      runtime: Runtime.NODEJS_16_X,
      handler: "index.handler",
      code: Code.fromAsset(path.join(__dirname, `/../src/lambda/checkOpenAi`)),
    };

    // Product microservices lambda function
    const checkFunction = new Function(
      this,
      "checkOpenAiLambdaFunction",
      functionProps
    );

    openAiStatusParameter.grantWrite(checkFunction);

    return checkFunction;
  }
}
