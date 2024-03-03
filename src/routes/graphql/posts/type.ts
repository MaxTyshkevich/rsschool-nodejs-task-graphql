import {
  GraphQLObjectType,
  GraphQLID,
  GraphQLString,
  GraphQLInputObjectType,
  GraphQLNonNull,
} from 'graphql';

export const PostType = new GraphQLObjectType({
  name: 'PostType',
  description: 'Post Type',
  fields: {
    id: { type: GraphQLID },
    title: { type: GraphQLString },
    content: { type: GraphQLString },
    userId: { type: GraphQLString },
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
    title: { type: GraphQLString },
    content: { type: GraphQLString },
  },
});
