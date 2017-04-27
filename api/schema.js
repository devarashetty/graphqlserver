import { merge } from 'lodash';
import { makeExecutableSchema } from 'graphql-tools';

import { pubsub } from './subscriptions';

import mongoConnectionCallback from './mongoConnect.js';

var mongodb ;

mongoConnectionCallback(function(res,err){
  mongodb = res;
});


const rootSchema = `
type User{
  _id: String
  username: String
  active:Boolean
}

# the schema allows the following query:
type Query {
  users: [User]
  user(_id: String!): User 
}

`

const rootResolvers = {
  Query: {
    users() {
      console.log("------------------users");
      return [{name:"sairam"}]
    },
  },
};

// Put schema together into one array of schema strings
// and one map of resolvers, like makeExecutableSchema expects

const executableSchema = makeExecutableSchema({
  typeDefs: rootSchema,
  rootResolvers,
});

export default executableSchema;
