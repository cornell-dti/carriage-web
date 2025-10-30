import dynamoose from 'dynamoose';
import defaultModelConfig from '../util/modelConfig';

const schema = new dynamoose.Schema({
  // we store references because storing the ride duplicates the data, comp key for efficiency and better normalization
  userId: { type: String, required: true, hashKey: true },
  rideId: { type: String, required: true, rangeKey: true },
  favoritedAt: { type: String, default: () => new Date().toISOString() },
});

export const Favorite = dynamoose.model(
  'Favorites',
  schema,
  defaultModelConfig
);
