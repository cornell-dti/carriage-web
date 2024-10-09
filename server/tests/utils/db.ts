import { ModelType } from 'dynamoose/dist/General';
import * as models from '../../src/models';
import { v4 as uuid } from 'uuid';
import { Item } from 'dynamoose/dist/Item';

export const populateDB = async <T extends Item>(
  table: ModelType<T>,
  data: any
) => {
  return await table.create({
    id: uuid(),
    ...data,
  });
};

export const clearTableContent = async (table: ModelType<Item>) => {
  const items = await table.scan().exec();
  await Promise.allSettled(items.map((item) => item.delete()));
};

export const clearDB = async () => {
  for (const model of Object.values(models)) {
    await clearTableContent(model);
  }
};
