import { Response } from 'express';
import { ModelType, ObjectType } from 'dynamoose/dist/General';
import { Condition } from 'dynamoose/dist/Condition';
import { Item } from 'dynamoose/dist/Item';
import { Rider } from '../models/rider';

// Helper function to populate riders for ride objects
async function populateRiders(rideJson: any) {
  if (
    rideJson.riders &&
    Array.isArray(rideJson.riders) &&
    rideJson.riders.length > 0
  ) {
    try {
      // If riders are just IDs (strings), populate them
      if (typeof rideJson.riders[0] === 'string') {
        const riderIds = rideJson.riders;
        const populatedRiders = await Promise.all(
          riderIds.map(async (riderId: string) => {
            try {
              const rider = await Rider.get(riderId);
              return rider ? rider.toJSON() : null;
            } catch (error) {
              console.error(`Failed to populate rider ${riderId}:`, error);
              return null;
            }
          })
        );
        rideJson.riders = populatedRiders.filter((rider) => rider !== null);
      }
    } catch (error) {
      console.error('Error populating riders:', error);
      rideJson.riders = [];
    }
  }
  return rideJson;
}

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
      try {
        const populated = await data.populate();
        let json = populated.toJSON();
        // Ensure riders field is properly handled
        if (json.riders === null || json.riders === undefined) {
          json.riders = [];
        }
        // Manually populate riders if needed
        json = await populateRiders(json);
        callback(json);
      } catch (populateError) {
        console.error('Populate error in getById:', populateError);
        // If populate fails, try to send the raw data
        const rawJson = data.toJSON();
        if (rawJson.riders === null || rawJson.riders === undefined) {
          rawJson.riders = [];
        }
        callback(rawJson);
      }
    } else {
      try {
        const populated = await data.populate();
        let json = populated.toJSON();
        // Ensure riders field is properly serialized
        if (json.riders === null || json.riders === undefined) {
          json.riders = [];
        }
        // Manually populate riders if needed
        json = await populateRiders(json);

        res.status(200).json({ data: json });
      } catch (populateError) {
        console.error('Populate error in getById response:', populateError);
        // If populate fails, try to send the raw data
        const rawJson = data.toJSON();
        if (rawJson.riders === null || rawJson.riders === undefined) {
          rawJson.riders = [];
        }
        res.status(200).json({ data: rawJson });
      }
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
  //here
  document.save(async (err, data) => {
    if (err) {
      console.log(err);
      res.status(err.statusCode || 450).send({ err: err.message });
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
      console.error('Update error:', err);
      res.status(err.statusCode || 500).send({ err: err.message });
    } else if (!data) {
      res.status(400).send({ err: `id not found in ${table}` });
    } else if (callback) {
      try {
        const populated = await data.populate();
        callback(populated.toJSON());
      } catch (populateError) {
        console.error('Populate error in update:', populateError);
        res.status(500).send({ err: 'Error populating updated data' });
      }
    } else {
      try {
        const populated = await data.populate();
        res.status(200).send({ data: populated.toJSON() });
      } catch (populateError) {
        console.error('Populate error in update response:', populateError);
        res.status(500).send({ err: 'Error populating updated data' });
      }
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
      console.error('Dynamoose scan error:', err);
      res.status(err.statusCode || 500).send({ err: err.message });
    } else if (!data) {
      res.status(400).send({ err: 'error when scanning table' });
    } else if (callback) {
      try {
        // Per-item populate with error isolation & logging
        const results: any[] = [];
        const items = Array.isArray(data) ? data : [data];
        for (const item of items) {
          if (!item) {
            console.warn('Scan result contains null/undefined item. Skipping.');
            continue;
          }
          try {
            const populated = await (item as any).populate();
            let json = (populated as any).toJSON
              ? (populated as any).toJSON()
              : populated;
            // Manually populate riders if needed
            json = await populateRiders(json);
            results.push(json);
          } catch (e) {
            // Attempt to get an identifier for logging
            let itemId: any = undefined;
            try {
              itemId =
                (item as any).id ||
                ((item as any).get && (item as any).get('id'));
            } catch {}
            console.error(
              'Populate failed for item',
              itemId ? { id: itemId } : '',
              'error:',
              e
            );
            // Continue processing the rest
          }
        }

        callback(results);
      } catch (error) {
        console.error('Error in scan callback:', error);
        res.status(500).send({ err: 'Error processing scan results' });
      }
    } else {
      try {
        // Per-item populate with error isolation & logging
        const results: any[] = [];
        const items = Array.isArray(data) ? data : [data];
        for (const item of items) {
          if (!item) {
            console.warn('Scan result contains null/undefined item. Skipping.');
            continue;
          }
          try {
            const populated = await (item as any).populate();
            let json = (populated as any).toJSON
              ? (populated as any).toJSON()
              : populated;
            // Manually populate riders if needed
            json = await populateRiders(json);
            results.push(json);
          } catch (e) {
            let itemId: any = undefined;
            try {
              itemId =
                (item as any).id ||
                ((item as any).get && (item as any).get('id'));
            } catch {}
            console.error(
              'Error in scan response: populate failed for item',
              itemId ? { id: itemId } : '',
              'error:',
              e
            );
            // Continue processing other items
          }
        }

        res.status(200).send({ data: results });
      } catch (error) {
        console.error('Error in scan response:', error);
        res.status(500).send({ err: 'Error processing scan results' });
      }
    }
  });
}
