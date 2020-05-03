import { Response } from 'express';
import { Model } from 'dynamoose/dist/Model';
import { Document } from 'dynamoose/dist/Document';
import { ObjectType } from 'dynamoose/dist/General';

type ClientType = Document & Model<Document>;

export const getByID = (
  (res: Response, client: ClientType, id: string) => {
    client.get(id, (err, data) => {
      if (err) {
        res.send(err);
      } else if (!data) {
        res.send({ err: { message: `id not found in ${client.name}` } });
      } else {
        res.send(data);
      }
    });
  }
);

export const getAll = (
  (res: Response, client: ClientType) => {
    client.scan().exec((err, data) => {
      if (err) {
        res.send(err);
      } else if (!data) {
        res.send({ err: { message: `items not found in ${client}` } });
      } else {
        res.send(data);
      }
    });
  }
);

export const retrieveByID = (
  (res: Response, client: ClientType, id: string) => {
    let doc: Document | undefined;
    client.get(id, (err, data) => {
      if (err) {
        res.send(err);
      } else if (!data) {
        res.send({ err: { message: `id not found in ${client}` } });
      } else {
        doc = data;
      }
    });
    return doc;
  }
);

export const create = (
  (res: Response, doc: Document) => {
    doc.save((err, data) => {
      if (err) {
        res.send({ err });
      } else {
        res.send(data);
      }
    });
  }
);

export const update = (
  (res: Response, client: ClientType, key: ObjectType, updateObj: ObjectType) => {
    client.update(key, updateObj, (err, data) => {
      if (err) {
        res.send(err);
      } else if (!data) {
        res.send({ err: { message: `id not found in ${client.name}` } });
      } else {
        res.send(data);
      }
    });
  }
);

export const deleteByID = (
  (res: Response, client: ClientType, id: string) => {
    client.get(id, (err, data) => {
      if (err) {
        res.send({ err });
      } else if (!data) {
        res.send({ err: { message: `id not found in ${client.name}` } });
      } else {
        data.delete().then(() => res.send({ id }));
      }
    });
  });
