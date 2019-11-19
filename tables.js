const AWS = require('aws-sdk');
const config = require('./config');

AWS.config.update(config);



var createLocations = function() {
  var dynamodb = new AWS.DynamoDB();

  var params = {
    TableName : "Location",
    KeySchema: [       
        { AttributeName: "id", KeyType: "HASH"},  //Partition key
        { AttributeName: "location", KeyType: "RANGE" }  //Sort key
    ],
    AttributeDefinitions: [       
        { AttributeName: "id", AttributeType: "N" },
        { AttributeName: "location", AttributeType: "S" }
    ],
    ProvisionedThroughput: {       
        ReadCapacityUnits: 10, 
        WriteCapacityUnits: 10
    },
  }; 

  dynamodb.createTable(params, function(err, data) {
    if (err) {
        console.error("Unable to create Location table. Error JSON:", JSON.stringify(err, null, 2));
    } else {
        console.log("Created Location table. Table description JSON:", JSON.stringify(data, null, 2));
    }
  });
}

var createRider = function() {
  var dynamodb = new AWS.DynamoDB();

  var params = {
    TableName : "Rider",
    KeySchema: [       
        { AttributeName: "id", KeyType: "HASH"},  //Partition key
    ],
    AttributeDefinitions: [       
        { AttributeName: "id", AttributeType: "N" },
    ],
    ProvisionedThroughput: {       
        ReadCapacityUnits: 10, 
        WriteCapacityUnits: 10
    },
  }; 

  dynamodb.createTable(params, function(err, data) {
    if (err) {
        console.error("Unable to create Rider table. Error JSON:", JSON.stringify(err, null, 2));
    } else {
        console.log("Created Rider table. Table description JSON:", JSON.stringify(data, null, 2));
    }
  });
}

var createDriver = function() {
  var dynamodb = new AWS.DynamoDB();

  var params = {
    TableName : "Driver",
    KeySchema: [       
        { AttributeName: "id", KeyType: "HASH"},  //Partition key
    ],
    AttributeDefinitions: [       
        { AttributeName: "id", AttributeType: "N" },
    ],
    ProvisionedThroughput: {       
        ReadCapacityUnits: 10, 
        WriteCapacityUnits: 10
    },
  }; 

  dynamodb.createTable(params, function(err, data) {
    if (err) {
        console.error("Unable to create Driver table. Error JSON:", JSON.stringify(err, null, 2));
    } else {
        console.log("Created Driver table. Table description JSON:", JSON.stringify(data, null, 2));
    }
  });
}

var createActiveRides = function() {
  var dynamodb = new AWS.DynamoDB();

  var params = {
    TableName : "Location",
    KeySchema: [       
        { AttributeName: "id", KeyType: "HASH"},  //Partition key
        { AttributeName: "startTime", KeyType: "RANGE"},  //Sort key
    ],
    AttributeDefinitions: [       
        { AttributeName: "id", AttributeType: "N" },
        { AttributeName: "startTime", AttributeType: "S" },
    ],
    ProvisionedThroughput: {       
        ReadCapacityUnits: 10, 
        WriteCapacityUnits: 10
    },
  }; 

  dynamodb.createTable(params, function(err, data) {
    if (err) {
        console.error("Unable to create ActiveRides table. Error JSON:", JSON.stringify(err, null, 2));
    } else {
        console.log("Created ActiveRides table. Table description JSON:", JSON.stringify(data, null, 2));
    }
  });
}

var createPastRides = function() {
  var dynamodb = new AWS.DynamoDB();

  var params = {
    TableName : "Location",
    KeySchema: [       
        { AttributeName: "id", KeyType: "HASH"},  //Partition key
        { AttributeName: "startTime", KeyType: "RANGE"},  //Sort key
    ],
    AttributeDefinitions: [       
        { AttributeName: "id", AttributeType: "N" },
        { AttributeName: "startTime", AttributeType: "S" },
    ],
    ProvisionedThroughput: {       
        ReadCapacityUnits: 10, 
        WriteCapacityUnits: 10
    },
  }; 

  dynamodb.createTable(params, function(err, data) {
    if (err) {
        console.error("Unable to create PastRides table. Error JSON:", JSON.stringify(err, null, 2));
    } else {
        console.log("Created PastRides table. Table description JSON:", JSON.stringify(data, null, 2));
    }
  });
}