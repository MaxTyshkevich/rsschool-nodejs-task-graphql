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
  name: 'ChangeMemberType',
  description: 'Change Member Type',
  fields: {
    discount: { type: GraphQLInt },
    monthPostsLimit: { type: GraphQLInt },
  },
});
