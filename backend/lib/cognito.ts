import { CfnOutput, Stack, StackProps } from "aws-cdk-lib";
import {
  CfnUserPoolGroup,
  UserPool,
  UserPoolClient,
} from "aws-cdk-lib/aws-cognito";
import { Construct } from "constructs";

export class LmCoginto extends Construct {
  public userPool: UserPool;
  private userPoolClient: UserPoolClient;

  constructor(scope: Construct, id: string) {
    super(scope, id);

    this.createUserPool();
    this.createUserPoolClient();
    this.createTeachersGroup();
  }

  private createUserPool() {
    this.userPool = new UserPool(this, "LmUserPool", {
      selfSignUpEnabled: true,
      signInAliases: {
        // username: true,
        email: true,
      },
    });

    new CfnOutput(this, "LmUserPoolId", {
      value: this.userPool.userPoolId,
    });
  }
  private createUserPoolClient() {
    this.userPoolClient = this.userPool.addClient("LmUserPoolClient", {
      authFlows: {
        adminUserPassword: true,
        custom: true,
        userPassword: true,
        userSrp: true,
      },
    });
    new CfnOutput(this, "LmUserPoolClientId", {
      value: this.userPoolClient.userPoolClientId,
    });
  }

  private createTeachersGroup() {
    new CfnUserPoolGroup(this, "LmTeachers", {
      userPoolId: this.userPool.userPoolId,
      groupName: "teachers",
    });
  }
}
