import express from 'express';
import bodyparser from 'body-parser';
import AWS from 'aws-sdk';
import config from '../config';

const router = express.Router();

AWS.config.update(config);
const sns = new AWS.SNS();

const apsPlatformArn = '???';
const fcmPlatformArn = '???';

const buildAPSPayloadString = (message) => JSON.stringify({
  aps: {
    alert: message,
  },
});
const buildFCMPayloadString = (message) => JSON.stringify({
  notification: {
    text: message,
  },
});

router.post('/device', (req, res) => {
  const {
    body: { token, platform },
  } = req;
  const snsParams = {
    Token: token,
    PlatformApplicationArn:
      platform === 'ios' ? apsPlatformArn : fcmPlatformArn,
  };
  sns.createPlatformEndpoint(snsParams, (err, data) => {
    if (err) res.send({ err });
    else {
      res.send(data.EndpointArn);
    }
  });
});

router.post('/message', (req, res) => {
  const {
    body: { endpoint, platform, message },
  } = req;
  let payloadKey;
  let payload = '';
  if (platform === 'ios') {
    payloadKey = 'APNS';
    payload = buildAPSPayloadString(message);
  } else {
    payloadKey = 'GCM';
    payload = buildFCMPayloadString(message);
  }
  const snsMessage = {};
  snsMessage[payloadKey] = payload;

  const snsParams = {
    Message: JSON.stringify(snsMessage),
    TargetArn: endpoint,
    MessageStructure: 'json',
  };
  sns.publish(snsParams, (err, data) => {
    if (err) res.send({ err });
    else {
      res.send(data);
    }
  });
});

const port = process.env.PORT || 3006;
const app = express();
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: false }));
app.use('/notify', router);
// eslint-disable-next-line no-console
app.listen(port, () => console.log('Listening at port', port));
