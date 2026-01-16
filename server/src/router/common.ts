import { Response } from 'express';
import { ModelType, ObjectType } from 'dynamoose/dist/General';
import { Condition } from 'dynamoose/dist/Condition';
import { Item } from 'dynamoose/dist/Item';
import { Rider } from '../models/rider';
import { Location } from '../models/location';
import { Driver } from '../models/driver';

// Helper: batch fetch locations, riders, drivers and return maps keyed by id
// This is written defensively so that if any batchGet fails in a particular
// environment (e.g., missing tables or limited IAM permissions in production),
// we degrade gracefully by logging the error and continuing with empty maps
// instead of failing the entire scan.
async function buildEntityMapsFromSets(
  locationIds: Set<string>,
  riderIds: Set<string>,
  driverIds: Set<string>
) {
  const locationMap = new Map<string, any>();
  const riderMap = new Map<string, any>();
  const driverMap = new Map<string, any>();

  // Fetch locations
  if (locationIds.size) {
    try {
      const locationsArr = (await Location.batchGet(
        Array.from(locationIds).map((id) => ({ id }))
      )) as any[];
      for (const l of locationsArr) {
        const j = l && l.toJSON ? l.toJSON() : l;
        if (j && j.id) locationMap.set(j.id, j);
      }
    } catch (err) {
      console.error('Error batch fetching locations in buildEntityMapsFromSets:', err);
    }
  }

  // Fetch riders
  if (riderIds.size) {
    try {
      const ridersArr = (await Rider.batchGet(
        Array.from(riderIds).map((id) => ({ id }))
      )) as any[];
      for (const r of ridersArr) {
        const j = r && r.toJSON ? r.toJSON() : r;
        if (j && j.id) riderMap.set(j.id, j);
      }
    } catch (err) {
      console.error('Error batch fetching riders in buildEntityMapsFromSets:', err);
    }
  }

  // Fetch drivers
  if (driverIds.size) {
    try {
      const driversArr = (await Driver.batchGet(
        Array.from(driverIds).map((id) => ({ id }))
      )) as any[];
      for (const d of driversArr) {
        const j = d && d.toJSON ? d.toJSON() : d;
        if (j && j.id) driverMap.set(j.id, j);
      }
    } catch (err) {
      console.error('Error batch fetching drivers in buildEntityMapsFromSets:', err);
    }
  }

  return { locationMap, riderMap, driverMap };
}

// Helper: apply maps to a single ride JSON object
function applyMapsToRide(
  rideJson: any,
  maps: {
    locationMap: Map<string, any>;
    riderMap: Map<string, any>;
    driverMap: Map<string, any>;
  }
) {
  const { locationMap, riderMap, driverMap } = maps;

  const startId =
    typeof rideJson.startLocation === 'string'
      ? rideJson.startLocation
      : rideJson.startLocation && rideJson.startLocation.id
      ? rideJson.startLocation.id
      : undefined;
  const endId =
    typeof rideJson.endLocation === 'string'
      ? rideJson.endLocation
      : rideJson.endLocation && rideJson.endLocation.id
      ? rideJson.endLocation.id
      : undefined;

  if (startId && locationMap.has(startId))
    rideJson.startLocation = locationMap.get(startId);
  if (endId && locationMap.has(endId))
    rideJson.endLocation = locationMap.get(endId);

  if (rideJson.riders && Array.isArray(rideJson.riders)) {
    rideJson.riders = rideJson.riders
      .map((r: any) => {
        const id = typeof r === 'string' ? r : r && r.id ? r.id : undefined;
        return id ? riderMap.get(id) || null : null;
      })
      .filter((r: any) => r !== null);
  } else if (rideJson.rider && rideJson.rider.id) {
    const id = rideJson.rider.id;
    const r = riderMap.get(id);
    rideJson.riders = r ? [r] : [];
  }

  if (rideJson.driver) {
    const dId =
      typeof rideJson.driver === 'string'
        ? rideJson.driver
        : rideJson.driver && rideJson.driver.id
        ? rideJson.driver.id
        : undefined;
    if (dId && driverMap.has(dId)) rideJson.driver = driverMap.get(dId);
  }

  if (rideJson.riders === null || rideJson.riders === undefined) {
    rideJson.riders = [];
  }

  return rideJson;
}

// Helper function to populate riders for ride objects (optimized - uses batchGet)
async function populateRiders(rideJson: any) {
  if (
    !rideJson.riders ||
    !Array.isArray(rideJson.riders) ||
    rideJson.riders.length === 0
  ) {
    rideJson.riders = rideJson.riders || [];
    return rideJson;
  }

  try {
    // If riders are just IDs (strings), use a batchGet to avoid N+1 reads
    if (typeof rideJson.riders[0] === 'string') {
      const uniqueIds = Array.from(new Set(rideJson.riders)).filter(
        (id) => typeof id === 'string'
      ) as string[];
      if (uniqueIds.length === 0) {
        rideJson.riders = [];
        return rideJson;
      }

      const maps = await buildEntityMapsFromSets(
        new Set(),
        new Set(uniqueIds),
        new Set()
      );
      rideJson.riders = uniqueIds
        .map((id: string) => maps.riderMap.get(id))
        .filter((r: any) => r !== undefined && r !== null);
    }
    // If riders are already objects, leave them as-is
  } catch (error) {
    console.error('Error populating riders:', error);
    rideJson.riders = [];
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
  // Use direct delete to avoid an extra GET request (reduces read throughput)
  model.delete(id || '', (err) => {
    if (err) {
      res.status(err.statusCode || 500).send({ err: err.message });
    } else {
      res.status(200).send({ id });
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
      return;
    }
    if (!data) {
      res.status(400).send({ err: 'error when scanning table' });
      return;
    }

    try {
      // Normalize raw items
      const items = Array.isArray(data) ? data : [data];
      const rawItems = items
        .map((item) =>
          item && (item as any).toJSON ? (item as any).toJSON() : item
        )
        .filter(Boolean);

      // Collect unique IDs for batch fetches
      const locationIds = new Set<string>();
      const riderIds = new Set<string>();
      const driverIds = new Set<string>();

      for (const ride of rawItems) {
        const startId =
          typeof ride.startLocation === 'string'
            ? ride.startLocation
            : ride.startLocation && ride.startLocation.id
            ? ride.startLocation.id
            : undefined;
        const endId =
          typeof ride.endLocation === 'string'
            ? ride.endLocation
            : ride.endLocation && ride.endLocation.id
            ? ride.endLocation.id
            : undefined;
        if (startId) locationIds.add(startId);
        if (endId) locationIds.add(endId);

        if (ride.riders && Array.isArray(ride.riders)) {
          for (const r of ride.riders) {
            if (!r) continue;
            if (typeof r === 'string') riderIds.add(r);
            else if (r.id) riderIds.add(r.id);
          }
        } else if (ride.rider && ride.rider.id) {
          riderIds.add(ride.rider.id);
        }

        if (ride.driver) {
          const dId =
            typeof ride.driver === 'string' ? ride.driver : ride.driver.id;
          if (dId) driverIds.add(dId);
        }
      }

      const maps = await buildEntityMapsFromSets(
        locationIds,
        riderIds,
        driverIds
      );

      const results = rawItems.map((rideJson: any) =>
        applyMapsToRide(rideJson, maps)
      );

      if (callback) callback(results);
      else res.status(200).send({ data: results });
    } catch (error) {
      console.error('Error in scan processing:', error);
      res.status(500).send({ err: 'Error processing scan results' });
    }
  });
}
