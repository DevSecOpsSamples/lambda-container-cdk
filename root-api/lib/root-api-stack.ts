import { Stack } from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import { Construct } from 'constructs';

import { SSM_PREFIX, StackCommonProps } from '../config';

/**
 */
export class RootApiStack extends Stack {
  constructor(scope: Construct, id: string, props: StackCommonProps) {
    super(scope, id, props);

    const stage = props.stage;

    const pingApiFunction = new lambda.DockerImageFunction(this, 'lambda-ping', {
      functionName: 'root-api',
      code: lambda.DockerImageCode.fromImageAsset('../app', {
        cmd: ["hello.handler"],
        entrypoint: ["/lambda-entrypoint.sh"],
      })
    });

    const api = new apigateway.RestApi(this, 'servicea-api', {
      deployOptions: {
        stageName: stage,
      }
    });
    const servicea = api.root.addResource('dummy-for-import');
    servicea.addResource('v1').addResource('ping').addMethod('GET', new apigateway.LambdaIntegration(pingApiFunction, { proxy: true }));

    new ssm.StringParameter(this, 'api-id', { parameterName: `${SSM_PREFIX}/rest-api-id`, stringValue: api.restApiId });
    new ssm.StringParameter(this, 'root-resource-id', { parameterName: `${SSM_PREFIX}/root-resource-id`, stringValue: api.root.resourceId });
  }
}