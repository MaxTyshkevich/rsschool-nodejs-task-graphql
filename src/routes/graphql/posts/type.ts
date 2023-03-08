import { FastifyInstance } from 'fastify';
import {
  GraphQLObjectType,
  GraphQLID,
  GraphQLString,
  GraphQLInputObjectType,
  GraphQLNonNull,
} from 'graphql';
import { UserType } from '../users/type';

export const PostType = new GraphQLObjectType({
  name: 'PostType',
  description: 'Post Type',
  fields: {
    id: { type: GraphQLID },
    title: { type: GraphQLString },
    content: { type: GraphQLString },
    /* userId: { type: GraphQLString }, */
    user: {
      type: UserType,
      resolve: async (parent, args, fastify: FastifyInstance) => {
        return fastify.db.users.findOne({ key: 'id', equals: parent.userId });
      },
    },
  },
});

export const CreatePost = new GraphQLInputObjectType({
  name: 'CreatePost',
  description: 'Create Post',
  fields: {
    title: { type: new GraphQLNonNull(GraphQLString) },
    content: { type: new GraphQLNonNull(GraphQLString) },
    userId: { type: new GraphQLNonNull(GraphQLString) },
  },
});

export const ChangePost = new GraphQLInputObjectType({
  name: 'ChangePost',
  description: 'Create Post',
  fields: {
    title: { type: new GraphQLNonNull(GraphQLString) },
    content: { type: new GraphQLNonNull(GraphQLString) },
  },
});
