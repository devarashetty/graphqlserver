import path from 'path';
import express from 'express';
import cors from 'cors';
import { graphqlExpress, graphiqlExpress } from 'graphql-server-express';
import OpticsAgent from 'optics-agent';
import bodyParser from 'body-parser';
import { invert, isString } from 'lodash';
import { createServer } from 'http';
import { SubscriptionServer } from 'subscriptions-transport-ws';

import { subscriptionManager } from './subscriptions';

import schema from './schema';
import config from './config';

const SUBSCRIPTIONS_PATH = '/subscriptions';

// Arguments usually come from env vars
export function run({
  OPTICS_API_KEY,
  PORT: portFromEnv = 3010,
} = {}) {
  if (OPTICS_API_KEY) {
    OpticsAgent.instrumentSchema(schema);
  }

  let port = portFromEnv;
  if (isString(portFromEnv)) {
    port = parseInt(portFromEnv, 10);
  }

  const subscriptionsURL = process.env.NODE_ENV !== 'production'
      ? `ws://localhost:${port}${SUBSCRIPTIONS_PATH}`
      : `ws://api.githunt.com${SUBSCRIPTIONS_PATH}`;

  const app = express();

  app.use(cors());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json());

  

  
  if (OPTICS_API_KEY) {
    app.use('/graphql', OpticsAgent.middleware());
  }

  app.use('/graphql', graphqlExpress((req) => {
    console.log("-------------------req",req);
    return {schema};    
  }));

  app.use('/graphiql', graphiqlExpress({
    endpointURL: '/graphql',
    subscriptionsEndpoint: subscriptionsURL
  }));

  // Serve our helpful static landing page. Not used in production.
  app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
  });

  const server = createServer(app);

  server.listen(port, () => {
    console.log(`API Server is now running on http://localhost:${port}`); // eslint-disable-line no-console
    console.log(`API Subscriptions server is now running on ws://localhost:${port}${SUBSCRIPTIONS_PATH}`); // eslint-disable-line no-console
  });

  // eslint-disable-next-line
  new SubscriptionServer(
    {
      subscriptionManager,     
    },
    {
      path: SUBSCRIPTIONS_PATH,
      server,
    },
  );

  return server;
}
