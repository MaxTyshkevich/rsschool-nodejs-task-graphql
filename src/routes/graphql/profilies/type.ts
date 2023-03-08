import { FastifyInstance } from 'fastify';
import {
  GraphQLObjectType,
  GraphQLID,
  GraphQLInt,
  GraphQLString,
  GraphQLInputObjectType,
  GraphQLNonNull,
} from 'graphql';
import { MemberType } from '../member-types/type';
import { PostType } from '../posts/type';

import { UserType } from '../users/type';

export const ProfileType = new GraphQLObjectType({
  name: 'ProfileType',
  description: 'Profile Type',
  fields: {
    id: { type: GraphQLID },
    avatar: { type: GraphQLString },
    sex: { type: GraphQLString },
    birthday: { type: GraphQLInt },
    country: { type: GraphQLString },
    street: { type: GraphQLString },
    city: { type: GraphQLString },
    /*  userId: { type: GraphQLID }, */
    /*  memberTypeId: { type: GraphQLID }, */

    memberType: {
      type: MemberType,
      resolve: async (parent, args, fastify: FastifyInstance) => {
        return fastify.db.memberTypes.findOne({
          key: 'id',
          equals: parent.memberTypeId,
        });
      },
    },

    user: {
      type: UserType,
      resolve: async (parent, args, fastify: FastifyInstance) => {
        return fastify.db.users.findOne({ key: 'id', equals: parent.userId });
      },
    },

    post: {
      type: PostType,
      resolve: async (parent, args, fastify: FastifyInstance) => {
        return fastify.db.posts.findOne({
          key: 'userId',
          equals: parent.userId,
        });
      },
    },
  },
});

export const CreateProfile = new GraphQLInputObjectType({
  name: 'CreateProfile',
  description: 'Create Profile',
  fields: () => ({
    avatar: { type: new GraphQLNonNull(GraphQLString) },
    sex: { type: new GraphQLNonNull(GraphQLString) },
    birthday: { type: new GraphQLNonNull(GraphQLInt) },
    country: { type: new GraphQLNonNull(GraphQLString) },
    street: { type: new GraphQLNonNull(GraphQLString) },
    city: { type: new GraphQLNonNull(GraphQLString) },
    userId: { type: new GraphQLNonNull(GraphQLID) },
    memberTypeId: { type: new GraphQLNonNull(GraphQLID) },
  }),
});

export const ChangeProfile = new GraphQLInputObjectType({
  name: 'ChangeProfile',
  description: 'Change Profile',
  fields: {
    avatar: { type: GraphQLString },
    sex: { type: GraphQLString },
    birthday: { type: GraphQLInt },
    country: { type: GraphQLString },
    street: { type: GraphQLString },
    city: { type: GraphQLString },
    memberTypeId: { type: GraphQLID },
  },
});
