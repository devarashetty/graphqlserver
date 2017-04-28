import { merge } from 'lodash';
import { makeExecutableSchema } from 'graphql-tools';

import { pubsub } from './subscriptions';

import mongoConnectionCallback from './mongoConnect.js';

import {
  GraphQLObjectType,
  GraphQLList,
  GraphQLString,
  GraphQLNonNull,
  GraphQLSchema
} from'graphql'

var mongodb ;

mongoConnectionCallback(function(res,err){
  mongodb = res;
});

const Profile= new GraphQLObjectType({
  name: 'Profile',
  description: 'Represent the type of an author of a blog post or a comment',
  fields: () => ({
    firstName: {type: GraphQLString},
    lastName: {type: GraphQLString},
  })
})

const User = new GraphQLObjectType({
  name: 'User',
  description: 'Represent the type of an author of a blog post or a comment',
  fields: () => ({
    _id: {type: GraphQLString},
    username: {type: GraphQLString},
    profile:{type: Profile}
  })
});

const Query = new GraphQLObjectType({
  name: 'UserSchema',
  description: 'Root of the Users Schema',
  fields: () => ({
    users: {
      type: User,
      description: 'List of posts in the blog',
      resolve: function(source,args,callback) {
         
        var promised = new Promise(function(resolve,reject){
          mongoConnectionCallback(function(res,err){
            if(res){
              mongodb = res
              mongodb.collection('users').findOne({},function(err,item){
                resolve(item);
              });
            }
          })
        })         

        return promised.then(function(d){console.log("000000000d",d);return d})
      }
    },
  })
})

const Mutation = new GraphQLObjectType({
  name:'UserMutation',
  description:"user mutation",
  fields:()=>({
    loginVerification:{
      type:User,
      args:{
        username: {type: new GraphQLNonNull(GraphQLString)},
        password: {type: new GraphQLNonNull(GraphQLString)},
      },
      resolve: function(source, args) {
        console.log("------------args",args);
        return {};
      }
    },    
  })
});

const executableSchema = new GraphQLSchema({
  query: Query,
  mutation:Mutation
}) 

export default executableSchema;
