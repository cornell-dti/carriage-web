import { Request, Response } from 'express';
import { DocumentClient } from 'aws-sdk/clients/dynamodb';

export const deleteByID = (
  (req: Request, res: Response, client: DocumentClient, table: string) => {
    const { id } = req.params;
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

export default deleteByID;
