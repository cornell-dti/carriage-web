const AWS = require('aws-sdk');
const config = require('./config');

AWS.config.update(config);

// function createLocations() {
//   const dynamodb = new AWS.DynamoDB();

//   const params = {
//     TableName: 'Locations',
//     KeySchema: [
//       { AttributeName: 'id', KeyType: 'HASH' }, // Partition key
//       { AttributeName: 'location', KeyType: 'RANGE' }, // Sort key
//     ],
//     AttributeDefinitions: [
//       { AttributeName: 'id', AttributeType: 'S' },
//       { AttributeName: 'location', AttributeType: 'S' },
//     ],
//     ProvisionedThroughput: {
//       ReadCapacityUnits: 10,
//       WriteCapacityUnits: 10,
//     },
//   };

//   dynamodb.createTable(params, (err, data) => {
//     if (err) {
//       console.error('Unable to create table. Error JSON:', JSON.stringify(err, null, 2));
//     } else {
//       console.log('Created table. Table description JSON:', JSON.stringify(data, null, 2));
//     }
//   });
// }

// function createRider() {
//   const dynamodb = new AWS.DynamoDB();

//   const params = {
//     TableName: 'Riders',
//     KeySchema: [
//       { AttributeName: 'id', KeyType: 'HASH' }, // Partition key
//     ],
//     AttributeDefinitions: [
//       { AttributeName: 'id', AttributeType: 'S' },
//     ],
//     ProvisionedThroughput: {
//       ReadCapacityUnits: 10,
//       WriteCapacityUnits: 10,
//     },
//   };

//   dynamodb.createTable(params, (err, data) => {
//     if (err) {
//       console.error('Unable to create table. Error JSON:', JSON.stringify(err, null, 2));
//     } else {
//       console.log('Created table. Table description JSON:', JSON.stringify(data, null, 2));
//     }
//   });
// }

// function createDriver() {
//   const dynamodb = new AWS.DynamoDB();

//   const params = {
//     TableName: 'Drivers',
//     KeySchema: [
//       { AttributeName: 'id', KeyType: 'HASH' }, // Partition key
//     ],
//     AttributeDefinitions: [
//       { AttributeName: 'id', AttributeType: 'S' },
//     ],
//     ProvisionedThroughput: {
//       ReadCapacityUnits: 10,
//       WriteCapacityUnits: 10,
//     },
//   };

//   dynamodb.createTable(params, (err, data) => {
//     if (err) {
//       console.error('Unable to create table. Error JSON:', JSON.stringify(err, null, 2));
//     } else {
//       console.log('Created table. Table description JSON:', JSON.stringify(data, null, 2));
//     }
//   });
// }

// function createActiveRides() {
//   const dynamodb = new AWS.DynamoDB();

//   const params = {
//     TableName: 'ActiveRides',
//     KeySchema: [
//       { AttributeName: 'id', KeyType: 'HASH' }, // Partition key
//       { AttributeName: 'startTime', KeyType: 'RANGE' }, // Sort key
//     ],
//     AttributeDefinitions: [
//       { AttributeName: 'id', AttributeType: 'S' },
//       { AttributeName: 'startTime', AttributeType: 'N' },
//     ],
//     ProvisionedThroughput: {
//       ReadCapacityUnits: 10,
//       WriteCapacityUnits: 10,
//     },
//   };

//   dynamodb.createTable(params, (err, data) => {
//     if (err) {
//       console.error('Unable to create table. Error JSON:', JSON.stringify(err, null, 2));
//     } else {
//       console.log('Created table. Table description JSON:', JSON.stringify(data, null, 2));
//     }
//   });
// }

// function createPastRides() {
//   const dynamodb = new AWS.DynamoDB();

//   const params = {
//     TableName: 'PastRides',
//     KeySchema: [
//       { AttributeName: 'id', KeyType: 'HASH' }, // Partition key
//       { AttributeName: 'startTime', KeyType: 'RANGE' }, // Sort key
//     ],
//     AttributeDefinitions: [
//       { AttributeName: 'id', AttributeType: 'S' },
//       { AttributeName: 'startTime', AttributeType: 'N' },
//     ],
//     ProvisionedThroughput: {
//       ReadCapacityUnits: 10,
//       WriteCapacityUnits: 10,
//     },
//   };

//   dynamodb.createTable(params, (err, data) => {
//     if (err) {
//       console.error('Unable to create table. Error JSON:', JSON.stringify(err, null, 2));
//     } else {
//       console.log('Created table. Table description JSON:', JSON.stringify(data, null, 2));
//     }
//   });
// }
// function createVehicles() {
//   const dynamodb = new AWS.DynamoDB();

//   const params = {
//     TableName: 'Vehicles',
//     KeySchema: [
//       { AttributeName: 'id', KeyType: 'HASH' }, // Partition key
//       { AttributeName: 'wheelchairAccessible', KeyType: 'RANGE' }, // Sort key
//     ],
//     AttributeDefinitions: [
//       { AttributeName: 'id', AttributeType: 'S' },
//       { AttributeName: 'wheelchairAccessible', AttributeType: 'B' },
//     ],
//     ProvisionedThroughput: {
//       ReadCapacityUnits: 10,
//       WriteCapacityUnits: 10,
//     },
//   };

//   dynamodb.createTable(params, (err, data) => {
//     if (err) {
//       console.error('Unable to create table. Error JSON:', JSON.stringify(err, null, 2));
//     } else {
//       console.log('Created table. Table description JSON:', JSON.stringify(data, null, 2));
//     }
//   });
// }

function addRiderIndex() {
  const dynamodb = new AWS.DynamoDB();

  const params = {
    TableName: 'ActiveRides',
    GlobalSecondaryIndexUpdates: [{
      Create: {
        IndexName: 'RiderIndex',
        KeySchema: [
          { AttributeName: 'riderID', KeyType: 'HASH' }, // Partition key
          { AttributeName: 'dateRequested', KeyType: 'RANGE' }, // Sort key
        ],
        AttributeDefinitions: [
          { AttributeName: 'riderID', AttributeType: 'S' },
          { AttributeName: 'dateRequested', AttributeType: 'N' },
        ],
        Projection: {
          ProjectionType: 'ALL',
        },
        ProvisionedThroughput: {
          ReadCapacityUnits: 10,
          WriteCapacityUnits: 10,
        },
      },
    }],
  };

  dynamodb.updateTable(params, (err, data) => {
    if (err) {
      console.error('Unable to update ActiveRides table. Error JSON:', JSON.stringify(err, null, 2));
    } else {
      console.log('Updates ActiveRides table. Table description JSON:', JSON.stringify(data, null, 2));
    }
  });
}

function addDriverIndex() {
  const dynamodb = new AWS.DynamoDB();

  const params = {
    TableName: 'ActiveRides',
    GlobalSecondaryIndexUpdates: [{
      Create: {
        IndexName: 'DriverIndex',
        KeySchema: [
          { AttributeName: 'driverID', KeyType: 'HASH' }, // Partition key
          { AttributeName: 'dateRequested', KeyType: 'RANGE' }, // Sort key
        ],
        AttributeDefinitions: [
          { AttributeName: 'driverID', AttributeType: 'S' },
          { AttributeName: 'dateRequested', AttributeType: 'N' },
        ],
        Projection: {
          ProjectionType: 'ALL',
        },
        ProvisionedThroughput: {
          ReadCapacityUnits: 10,
          WriteCapacityUnits: 10,
        },
      },
    }],
  };

  dynamodb.updateTable(params, (err, data) => {
    if (err) {
      console.error('Unable to update ActiveRides table. Error JSON:', JSON.stringify(err, null, 2));
    } else {
      console.log('Updates ActiveRides table. Table description JSON:', JSON.stringify(data, null, 2));
    }
  });
}

addRiderIndex();
addDriverIndex();
