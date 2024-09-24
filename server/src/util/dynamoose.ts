import { DynamoDB } from '@aws-sdk/client-dynamodb';
import dynamoose from 'dynamoose';
import config from '../config';

const ddb = new DynamoDB({
  credentials: {
    accessKeyId: config.accessKeyId as string,
    secretAccessKey: config.secretAccessKey as string,
  },
  region: config.region,
});
dynamoose.aws.ddb.set(ddb);

export default function initDynamoose() {
  dynamoose.aws.ddb.set(ddb);
}
