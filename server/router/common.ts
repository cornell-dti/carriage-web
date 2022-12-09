import { Response } from 'express';
import { Document } from 'dynamoose/dist/Document';
import { ModelType, ObjectType } from 'dynamoose/dist/General';
import { Condition } from 'dynamoose/dist/Condition';

export function getById(
  res: Response,
  model: ModelType<Document>,
  id: string | ObjectType | undefined,
  table: string,
  callback?: (value: any) => void
) {
  model.get(id || '', (err, data) => {
    if (err) {
      res.status(err.statusCode || 500).send({ err: err.message });
    } else if (!data) {
      res.status(400).send({ err: `id not found in ${table}` });
    } else if (callback) {
      callback(data.toJSON());
    } else {
      res.status(200).send({ data: data.toJSON() });
    }
  });
}

export function batchGet(
  res: Response,
  model: ModelType<Document>,
  keys: ObjectType[],
  table: string,
  callback?: (value: any) => void
) {
  if (!keys.length) {
    res.send({ data: [] });
  } else {
    model.batchGet(keys, (err, data) => {
      if (err) {
        res.status(err.statusCode || 500).send({ err: err.message });
      } else if (!data) {
        res.status(400).send({ err: `items not found in ${table}` });
      } else if (callback) {
        callback(data.toJSON());
      } else {
        res.status(200).send({ data: data.toJSON() });
      }
    });
  }
}

export function getAll(
  res: Response,
  model: ModelType<Document>,
  table: string,
  callback?: (value: any) => void
) {
  model.scan().exec((err, data) => {
    if (err) {
      res.status(err.statusCode || 500).send({ err: err.message });
    } else if (!data) {
      res.status(400).send({ err: `items not found in ${table}` });
    } else if (callback) {
      callback(data.toJSON());
    } else {
      res.status(200).send({ data: data.toJSON() });
    }
  });
}

export function create(
  res: Response,
  document: Document,
  callback?: (value: any) => void
) {
  document.save((err, data) => {
    if (err) {
      res.status(err.statusCode || 500).send({ err: err.message });
    } else if (!data) {
      res.status(400).send({ err: 'error when saving document' });
    } else if (callback) {
      callback(data.toJSON());
    } else {
      res.status(200).send({ data: data.toJSON() });
    }
  });
}

export function update(
  res: Response,
  model: ModelType<Document>,
  key: ObjectType,
  operation: ObjectType,
  table: string,
  callback?: (value: any) => void
) {
  model.update(key, operation, (err, data) => {
    if (err) {
      res.status(err.statusCode || 500).send({ err: err.message });
    } else if (!data) {
      res.status(400).send({ err: `id not found in ${table}` });
    } else if (callback) {
      callback(data.toJSON());
    } else {
      res.status(200).send({ data: data.toJSON() });
    }
  });
}

export function conditionalUpdate(
  res: Response,
  model: ModelType<Document>,
  key: ObjectType,
  operation: ObjectType,
  condition: Condition,
  table: string,
  callback?: (value: any) => void
) {
  model.update(
    key,
    operation,
    { condition, return: 'document' },
    (err, data) => {
      if (err) {
        res.status(err.statusCode || 500).send({ err: err.message });
      } else if (!data) {
        res.status(400).send({ err: `id not found in ${table}` });
      } else if (callback) {
        callback(data.toJSON());
      } else {
        res.status(200).send({ data: data.toJSON() });
      }
    }
  );
}

export function deleteById(
  res: Response,
  model: ModelType<Document>,
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
  model: ModelType<Document>,
  condition: Condition,
  index: string,
  callback?: (value: any) => void
) {
  model
    .query(condition)
    .using(index)
    .exec((err: any, data: any) => {
      if (err) {
        res.status(err.statusCode || 500).send({ err: err.message });
      } else if (callback) {
        callback(data.toJSON());
      } else {
        res.status(200).send({ data: data.toJSON() });
      }
    });
}

export function scan(
  res: Response,
  model: ModelType<Document>,
  condition: Condition,
  callback?: (value: any) => void
) {
  model.scan(condition).exec((err, data) => {
    if (err) {
      res.status(err.statusCode || 500).send({ err: err.message });
    } else if (!data) {
      res.status(400).send({ err: 'error when scanning table' });
    } else if (callback) {
      callback(data.toJSON());
    } else {
      res.status(200).send({ data: data.toJSON() });
    }
  });
}
