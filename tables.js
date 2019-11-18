const AWS = require('aws-sdk');
const config = require('./config');

AWS.config.update(config);

const dynamodb = new AWS.DynamoDB();

const locationParams = {
  TableName: 'Locations',
  KeySchema: [
    { AttributeName: 'id', KeyType: 'HASH' },
  ],
  AttributeDefinitions: [
    { AttributeName: 'id', AttributeType: 'N' },
  ],
  ProvisionedThroughput: {
    ReadCapacityUnits: 10,
    WriteCapacityUnits: 10,
  },
};

const driverParams = {
  TableName: 'Drivers',
  KeySchema: [
    { AttributeName: 'id', KeyType: 'HASH' },
  ],
  AttributeDefinitions: [
    { AttributeName: 'id', AttributeType: 'N' },
  ],
  ProvisionedThroughput: {
    ReadCapacityUnits: 10,
    WriteCapacityUnits: 10,
  },
};

// const movieParams = {
//   TableNames: 'Movies',
//   KeySchema: [
//     { AttributeName: 'year', KeyType: 'HASH' }, // Partition key
//     { AttributeName: 'title', KeyType: 'RANGE' }, // Sort key
//   ],
//   AttributeDefinitions: [
//     { AttributeName: 'year', AttributeType: 'N' },
//     { AttributeName: 'title', AttributeType: 'S' },
//   ],
//   ProvisionedThroughput: {
//     ReadCapacityUnits: 10,
//     WriteCapacityUnits: 10,
//   },
// };

dynamodb.createTable(driverParams, (err, data) => {
  if (err) {
    console.error('Unable to create table. Error JSON:', JSON.stringify(err, null, 2));
  } else {
    console.log('Created table. Table description JSON:', JSON.stringify(data, null, 2));
  }
});

dynamodb.createTable(locationParams, (err, data) => {
  if (err) {
    console.error('Unable to create table. Error JSON:', JSON.stringify(err, null, 2));
  } else {
    console.log('Created table. Table description JSON:', JSON.stringify(data, null, 2));
  }
});
