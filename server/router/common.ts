import { Response } from 'express';
import { Model } from 'dynamoose/dist/Model';
import { Document } from 'dynamoose/dist/Document';
import { ObjectType } from 'dynamoose/dist/General';

type ModelType = Document & Model<Document>;

export function getByID(
  res: Response,
  model: ModelType,
  id: string | ObjectType,
  table: string,
  callback?: (value: any) => void,
) {
  model.get(id, (err, data) => {
    if (err) {
      res.send({ err });
    } else if (!data) {
      res.send({ err: { message: `id not found in ${table}` } });
    } else if (callback) {
      callback(data);
    } else {
      res.send(data);
    }
  });
}

export function batchGet(
  res: Response,
  model: ModelType,
  keys: ObjectType[],
  table: string,
  callback?: (value: any) => void,
) {
  model.batchGet(keys, (err, data) => {
    if (err) {
      res.send({ err });
    } else if (!data) {
      res.send({ err: { message: `items not found in ${table}` } });
    } else if (callback) {
      callback(data);
    } else {
      res.send({ data });
    }
  });
}

export function getAll(
  res: Response,
  model: ModelType,
  table: string,
  callback?: (value: any) => void,
) {
  model.scan().exec((err, data) => {
    if (err) {
      res.send({ err });
    } else if (!data) {
      res.send({ err: { message: `items not found in ${table}` } });
    } else if (callback) {
      callback(data);
    } else {
      res.send({ data });
    }
  });
}

export function create(
  res: Response,
  doc: Document,
  callback?: (value: any) => void,
) {
  doc.save((err, data) => {
    if (err) {
      res.send({ err });
    } else if (callback) {
      callback(data);
    } else {
      res.send(data);
    }
  });
}

export function update(
  res: Response,
  model: ModelType,
  key: ObjectType,
  updateObj: ObjectType,
  table: string,
  callback?: (value: any) => void,
) {
  model.update(key, updateObj, (err, data) => {
    if (err) {
      res.send({ err });
    } else if (!data) {
      res.send({ err: { message: `id not found in ${table}` } });
    } else if (callback) {
      callback(data);
    } else {
      res.send(data);
    }
  });
}

export function deleteByID(
  res: Response,
  model: ModelType,
  id: string | ObjectType,
  table: string,
  callback?: (value: any) => void,
) {
  model.get(id, (err, data) => {
    if (err) {
      res.send({ err });
    } else if (!data) {
      res.send({ err: { message: `id not found in ${table}` } });
    } else if (callback) {
      callback(data);
    } else {
      data.delete().then(() => res.send({ id }));
    }
  });
}
