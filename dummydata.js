const AWS = require('aws-sdk');
const uuidv1 = require('uuid/v1');
const config = require('./config');


AWS.config.update(config);


const dynamodb = new AWS.DynamoDB.DocumentClient();


const params = {
  TableName: 'Riders',
  Item: {
    id: uuidv1(),
    phoneNumber: '9999999999',
    email: 'sampleemail@cornell.edu',
    name: 'Rider1',
    accessibilityNeeds: {
      needWheelchair: true,
      description: 'sample accessibility description',
    },
    pronoun: 'she/her',
  },
};

console.log('Adding a new item...');
dynamodb.put(params, (err, data) => {
  if (err) {
    console.error('Unable to add item. Error JSON:', JSON.stringify(err, null, 2));
  } else {
    console.log('Added item:', JSON.stringify(data, null, 2));
  }
});

// const params = {
//   TableName: 'Drivers',
//   Key: {
//     id: '62b81940-0b21-11ea-a0cb-ebf91d3e8b42',
//   },
//   UpdateExpression: 'set breaks.Mon.breakStart = :s',
//   ExpressionAttributeValues: {
//     ':s': '09:00',
//   },
//   ReturnValues: 'UPDATED_NEW',
// };

// console.log('Updating an item...');
// dynamodb.update(params, (err, data) => {
//   if (err) {
//     console.error('Unable to update item. Error JSON:', JSON.stringify(err, null, 2));
//   } else {
//     console.log('UpdateItem item:', JSON.stringify(data, null, 2));
//   }
// });
