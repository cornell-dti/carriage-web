import { Response } from 'express';
import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import { Model } from 'dynamoose/dist/Model';
import { Document } from 'dynamoose/dist/Document';
import { ObjectType } from 'dynamoose/dist/General';

type ModelType = Document & Model<Document>;

export const getByID = (
  (res: Response,
    model: ModelType,
    id: string,
    table: string,
    callback?: (value: any) => void) => {
    model.get(id, (err, data) => {
      if (err) {
        res.send(err);
      } else if (!data) {
        res.send({ err: { message: `id not found in ${table}` } });
      } else if (callback) {
        callback(data);
      } else {
        res.send(data);
      }
    });
  }
);

export const batchGet = (
  (res: Response,
    model: ModelType,
    keys: ObjectType[],
    table: string,
    callback?: (value: any) => void) => {
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
);

export const getAll = (
  (res: Response,
    model: ModelType,
    table: string,
    callback?: (value: any) => void) => {
    model.scan().exec((err, data) => {
      if (err) {
        res.send(err);
      } else if (!data) {
        res.send({ err: { message: `items not found in ${table}` } });
      } else if (callback) {
        callback(data);
      } else {
        res.send(data);
      }
    });
  }
);

export const create = (
  (res: Response, doc: Document, callback?: (value: any) => void) => {
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
);

export const update = (
  (res: Response,
    model: ModelType,
    key: ObjectType,
    updateObj: ObjectType,
    table: string,
    callback?: (value: any) => void) => {
    model.update(key, updateObj, (err, data) => {
      if (err) {
        res.send(err);
      } else if (!data) {
        res.send({ err: { message: `id not found in ${table}` } });
      } else if (callback) {
        callback(data);
      } else {
        res.send(data);
      }
    });
  }
);

export const deleteByID = (
  (res: Response,
    model: ModelType,
    id: string,
    table: string,
    callback?: (value: any) => void) => {
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
  });

export const deleteByIDOld = (
  (res: Response, client: DocumentClient, id: string, table: string) => {
    const params = {
      TableName: table,
      Key: { id },
    };
    client.delete(params, (err, _) => {
      if (err) {
        res.send({ err });
      } else {
        res.send({ id });
      }
    });
  });
