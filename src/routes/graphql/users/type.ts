import {
  GraphQLObjectType,
  GraphQLID,
  GraphQLList,
  GraphQLString,
  GraphQLNonNull,
  GraphQLInputObjectType,
} from 'graphql';

export const UserType = new GraphQLObjectType({
  name: 'UserType',
  description: 'User Type',
  fields: {
    id: { type: GraphQLID },
    firstName: { type: GraphQLString },
    lastName: { type: GraphQLString },
    email: { type: GraphQLString },
    subscribedToUserIds: { type: new GraphQLList(GraphQLID) },
  },
});

export const CreateUser = new GraphQLInputObjectType({
  name: 'CreateUser',
  description: 'Create a new User',
  fields: {
    firstName: { type: new GraphQLNonNull(GraphQLString) },
    lastName: { type: new GraphQLNonNull(GraphQLString) },
    email: { type: new GraphQLNonNull(GraphQLString) },
  },
});

export const ChangeUser = new GraphQLInputObjectType({
  name: 'ChangeUser',
  description: 'Change User',
  fields: {
    firstName: { type: GraphQLString },
    lastName: { type: GraphQLString },
    email: { type: GraphQLString },
  },
});
