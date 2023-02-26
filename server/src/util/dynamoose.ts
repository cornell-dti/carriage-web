import config from '../config';
import dynamoose from 'dynamoose';

export default () => dynamoose.aws.sdk.config.update(config);
