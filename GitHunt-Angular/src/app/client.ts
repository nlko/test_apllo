import ApolloClient, {createBatchingNetworkInterface} from 'apollo-client';
import {SubscriptionClient, addGraphQLSubscriptions} from 'subscriptions-transport-ws/dist/client';

// Polyfill fetch
import 'whatwg-fetch';

interface Result {
  id?: string;
  __typename?: string;
}
/*
const wsClient = new SubscriptionClient('ws://localhost:3010/subscriptions', {
  reconnect: true,
});*/

const networkInterface = createBatchingNetworkInterface({
  uri: 'http://localhost:3000',
  batchInterval: 10,
  opts: {
    credentials: 'same-origin',
  }
});

// const networkInterfaceWithSubscriptions = addGraphQLSubscriptions(
//   networkInterface,
//   //wsClient,
// );

const client = new ApolloClient({
  networkInterface: networkInterface,
  dataIdFromObject: o => (o as any).id,
});

export function provideClient(): ApolloClient {
  return client;
}
