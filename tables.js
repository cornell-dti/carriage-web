const AWS = require('aws-sdk');
const config = require('./config');

AWS.config.update(config);

function createLocations() {
  const dynamodb = new AWS.DynamoDB();

  const params = {
    TableName: 'Location',
    KeySchema: [
      { AttributeName: 'id', KeyType: 'HASH' },
      { AttributeName: 'location', KeyType: 'RANGE' },
    ],
    AttributeDefinitions: [
      { AttributeName: 'id', AttributeType: 'N' },
      { AttributeName: 'location', AttributeType: 'S' },
    ],
    ProvisionedThroughput: {
      ReadCapacityUnits: 10,
      WriteCapacityUnits: 10,
    },
  };

  dynamodb.createTable(params, (err, data) => {
    if (err) {
      console.error('Unable to create Location table. Error JSON:', JSON.stringify(err, null, 2));
    } else {
      console.log('Created Location table. Table description JSON:', JSON.stringify(data, null, 2));
    }
  });
}

function createRider() {
  const dynamodb = new AWS.DynamoDB();

  const params = {
    TableName: 'Rider',
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

  dynamodb.createTable(params, (err, data) => {
    if (err) {
      console.error('Unable to create Rider table. Error JSON:', JSON.stringify(err, null, 2));
    } else {
      console.log('Created Rider table. Table description JSON:', JSON.stringify(data, null, 2));
    }
  });
}

function createDriver() {
  const dynamodb = new AWS.DynamoDB();

  const params = {
    TableName: 'Driver',
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

  dynamodb.createTable(params, (err, data) => {
    if (err) {
      console.error('Unable to create Driver table. Error JSON:', JSON.stringify(err, null, 2));
    } else {
      console.log('Created Driver table. Table description JSON:', JSON.stringify(data, null, 2));
    }
  });
}

function createActiveRides() {
  const dynamodb = new AWS.DynamoDB();

  const params = {
    TableName: 'ActiveRides',
    KeySchema: [
      { AttributeName: 'id', KeyType: 'HASH' },
      { AttributeName: 'startTime', KeyType: 'RANGE' },
    ],
    AttributeDefinitions: [
      { AttributeName: 'id', AttributeType: 'N' },
      { AttributeName: 'startTime', AttributeType: 'S' },
    ],
    ProvisionedThroughput: {
      ReadCapacityUnits: 10,
      WriteCapacityUnits: 10,
    },
  };

  dynamodb.createTable(params, (err, data) => {
    if (err) {
      console.error('Unable to create ActiveRides table. Error JSON:', JSON.stringify(err, null, 2));
    } else {
      console.log('Created ActiveRides table. Table description JSON:', JSON.stringify(data, null, 2));
    }
  });
}

function createPastRides() {
  const dynamodb = new AWS.DynamoDB();

  const params = {
    TableName: 'PastRides',
    KeySchema: [
      { AttributeName: 'id', KeyType: 'HASH' },
      { AttributeName: 'startTime', KeyType: 'RANGE' },
    ],
    AttributeDefinitions: [
      { AttributeName: 'id', AttributeType: 'N' },
      { AttributeName: 'startTime', AttributeType: 'S' },
    ],
    ProvisionedThroughput: {
      ReadCapacityUnits: 10,
      WriteCapacityUnits: 10,
    },
  };

  dynamodb.createTable(params, (err, data) => {
    if (err) {
      console.error('Unable to create PastRides table. Error JSON:', JSON.stringify(err, null, 2));
    } else {
      console.log('Created PastRides table. Table description JSON:', JSON.stringify(data, null, 2));
    }
  });
}

createActiveRides();
createDriver();
createLocations();
createPastRides();
createRider();
