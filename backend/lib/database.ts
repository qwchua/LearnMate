import { RemovalPolicy } from "aws-cdk-lib";
import {
  AttributeType,
  BillingMode,
  ITable,
  Table,
} from "aws-cdk-lib/aws-dynamodb";
import { Construct } from "constructs";

export class LmDatabase extends Construct {
  public readonly courseTable: ITable;

  constructor(scope: Construct, id: string) {
    super(scope, id);

    this.courseTable = this.createCourseTable();
  }

  private createCourseTable(): ITable {
    const courseTable = new Table(this, "course", {
      partitionKey: {
        name: "PK",
        type: AttributeType.STRING,
      },
      sortKey: {
        name: "SK",
        type: AttributeType.STRING,
      },
      tableName: "course",
      removalPolicy: RemovalPolicy.DESTROY,
      billingMode: BillingMode.PAY_PER_REQUEST,
    });
    return courseTable;
  }
}
