import { Response } from 'express';
import { ModelType, ObjectType } from 'dynamoose/dist/General';
import { Condition } from 'dynamoose/dist/Condition';
import { Item } from 'dynamoose/dist/Item';

export function getById(
  res: Response,
  model: ModelType<Item>,
  id: string | ObjectType | undefined,
  table: string,
  callback?: (value: any) => void
) {
  model.get(id || '', async (err, data) => {
    if (err) {
      res.status(err.statusCode || 500).send({ err: err.message });
    } else if (!data) {
      res.status(400).send({ err: `id not found in ${table}` });
    } else if (callback) {
      callback((await data.populate()).toJSON());
    } else {
      res.status(200).send({ data: (await data.populate()).toJSON() });
    }
  });
}

export function batchGet(
  res: Response,
  model: ModelType<Item>,
  keys: ObjectType[],
  table: string,
  callback?: (value: any) => void
) {
  if (!keys.length) {
    res.send({ data: [] });
  } else {
    model.batchGet(keys, async (err, data) => {
      if (err) {
        res.status(err.statusCode || 500).send({ err: err.message });
      } else if (!data) {
        res.status(400).send({ err: `items not found in ${table}` });
      } else if (callback) {
        callback((await data.populate()).toJSON());
      } else {
        res.status(200).send({ data: (await data.populate()).toJSON() });
      }
    });
  }
}

export function getAll(
  res: Response,
  model: ModelType<Item>,
  table: string,
  callback?: (value: any) => void
) {
  model.scan().exec(async (err, data) => {
    if (err) {
      res.status(err.statusCode || 500).send({ err: err.message });
    } else if (!data) {
      res.status(400).send({ err: `items not found in ${table}` });
    } else if (callback) {
      callback((await data.populate()).toJSON());
    } else {
      res.status(200).send({ data: (await data.populate()).toJSON() });
    }
  });
}

export function create(
  res: Response,
  document: Item,
  callback?: (value: any) => void
) {
  document.save(async (err, data) => {
    if (err) {
      res.status(err.statusCode || 500).send({ err: err.message });
    } else if (!data) {
      res.status(400).send({ err: 'error when saving document' });
    } else if (callback) {
      callback((await data.populate()).toJSON());
    } else {
      res.status(200).send({ data: (await data.populate()).toJSON() });
    }
  });
}

export function update(
  res: Response,
  model: ModelType<Item>,
  key: ObjectType,
  operation: ObjectType,
  table: string,
  callback?: (value: any) => void
) {
  model.update(key, operation, async (err, data) => {
    if (err) {
      res.status(err.statusCode || 500).send({ err: err.message });
    } else if (!data) {
      res.status(400).send({ err: `id not found in ${table}` });
    } else if (callback) {
      callback((await data.populate()).toJSON());
    } else {
      res.status(200).send({ data: (await data.populate()).toJSON() });
    }
  });
}

export function conditionalUpdate(
  res: Response,
  model: ModelType<Item>,
  key: ObjectType,
  operation: ObjectType,
  condition: Condition,
  table: string,
  callback?: (value: any) => void
) {
  model.update(
    key,
    operation,
    { condition, return: 'item' },
    async (err, data) => {
      if (err) {
        res.status(err.statusCode || 500).send({ err: err.message });
      } else if (!data) {
        res.status(400).send({ err: `id not found in ${table}` });
      } else if (callback) {
        callback((await data.populate()).toJSON());
      } else {
        res.status(200).send({ data: (await data.populate()).toJSON() });
      }
    }
  );
}

export function deleteById(
  res: Response,
  model: ModelType<Item>,
  id: string | ObjectType | undefined,
  table: string
) {
  model.get(id || '', (err, data) => {
    if (err) {
      res.status(err.statusCode || 500).send({ err: err.message });
    } else if (!data) {
      res.status(400).send({ err: `id not found in ${table}` });
    } else {
      data.delete().then(() => res.status(200).send({ id }));
    }
  });
}

export function query(
  res: Response,
  model: ModelType<Item>,
  condition: Condition,
  index: string,
  callback?: (value: any) => void
) {
  model
    .query(condition)
    .using(index)
    .exec(async (err: any, data: any) => {
      if (err) {
        res.status(err.statusCode || 500).send({ err: err.message });
      } else if (callback) {
        callback((await data.populate()).toJSON());
      } else {
        res.status(200).send({ data: (await data.populate()).toJSON() });
      }
    });
}

export function scan(
  res: Response,
  model: ModelType<Item>,
  condition: Condition,
  callback?: (value: any) => void
) {
  model.scan(condition).exec(async (err, data) => {
    if (err) {
      res.status(err.statusCode || 500).send({ err: err.message });
    } else if (!data) {
      res.status(400).send({ err: 'error when scanning table' });
    } else if (callback) {
      callback((await data.populate()).toJSON());
    } else {
      res.status(200).send({ data: (await data.populate()).toJSON() });
    }
  });
}
