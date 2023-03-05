import {
  GraphQLObjectType,
  GraphQLID,
  GraphQLInt,
  GraphQLInputObjectType,
} from 'graphql';

export const MemberType = new GraphQLObjectType({
  name: 'MemberType',
  description: 'Member Type',
  fields: {
    id: { type: GraphQLID },
    discount: { type: GraphQLInt },
    monthPostsLimit: { type: GraphQLInt },
  },
});

export const ChangeMemberType = new GraphQLInputObjectType({
  name: 'CreateProfile',
  description: 'Create Profile',
  fields: {
    discount: { type: GraphQLInt },
    monthPostsLimit: { type: GraphQLInt },
  },
});
