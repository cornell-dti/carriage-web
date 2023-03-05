import { ModelType } from 'dynamoose/dist/General';
import { Document } from 'dynamoose/dist/Document';
import * as models from '../../src/models';
import { v4 as uuid } from 'uuid';

export const populateDB = async (table: ModelType<Document>, data: any) => {
  await table.create({
    id: uuid(),
    ...data,
  });
};

export const clearTableContent = async (table: ModelType<Document>) => {
  const items = await table.scan().exec();
  await Promise.allSettled(items.map((item) => item.delete()));
};

export const clearDB = async () => {
  for (const model of Object.values(models)) {
    await clearTableContent(model);
  }
};
