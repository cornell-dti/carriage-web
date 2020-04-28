import { Request, Response } from 'express';
import { DocumentClient } from 'aws-sdk/clients/dynamodb';

export const deleteFromTableByID =
  (req: Request, res: Response, docClient: DocumentClient, table: string) => {
    const { id } = req.params;
    const params = {
      TableName: table,
      Key: { id },
    };
    docClient.delete(params, (err, _) => {
      if (err) {
        res.send({ err });
      } else {
        res.send({ id });
      }
    });
  }

export default deleteFromTableByID;