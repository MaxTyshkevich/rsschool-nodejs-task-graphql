import { MemberType } from './../member-types/type';

import {
  GraphQLObjectType,
  GraphQLID,
  GraphQLList,
  GraphQLString,
  GraphQLNonNull,
  GraphQLInputObjectType,
} from 'graphql';
import { UserEntity } from '../../../utils/DB/entities/DBUsers';
import { PostType } from '../posts/type';
import { ProfileType } from '../profilies/type';
import { ContextToGraph } from '../types';

export const UserType = new GraphQLObjectType({
  name: 'UserType',
  description: 'User Type',
  fields: {
    id: { type: GraphQLID },
    firstName: { type: GraphQLString },
    lastName: { type: GraphQLString },
    email: { type: GraphQLString },
    subscribedToUserIds: { type: new GraphQLList(GraphQLID) },

    memberType: {
      type: MemberType,
      resolve: async (
        user: UserEntity,
        args: [],
        { fastify }: ContextToGraph
      ) => {
        const profile = await fastify.db.profiles.findOne({
          key: 'userId',
          equals: user.id,
        });

        if (!profile) return null;

        const memberType = await fastify.db.memberTypes.findOne({
          key: 'id',
          equals: profile.memberTypeId,
        });

        if (!memberType) return null;

        return memberType;
      },
    },

    posts: {
      type: new GraphQLList(PostType),
      resolve: async (
        user: UserEntity,
        args: [],
        { fastify }: ContextToGraph
      ) => {
        const posts = await fastify.db.posts.findMany({
          key: 'userId',
          equals: user.id,
        });

        if (!posts) return null;

        return posts;
      },
    },

    profile: {
      type: ProfileType,
      resolve: async (
        user: UserEntity,
        args: [],
        { fastify }: ContextToGraph
      ) => {
        const profile = await fastify.db.profiles.findOne({
          key: 'userId',
          equals: user.id,
        });

        if (!profile) return null;

        return profile;
      },
    },
    /* не уверен
     */
    subscribedToUser: {
      type: new GraphQLList(ProfileType),
      resolve: async (
        user: UserEntity,
        args: [],
        { fastify }: ContextToGraph
      ) => {
        const usersSubscribedTo = await fastify.db.users.findMany({
          key: 'subscribedToUserIds',
          inArray: user.id,
        });

        if (!usersSubscribedTo.length) return null;

        const profiles = usersSubscribedTo.map((usersSubscribed) =>
          fastify.db.profiles.findOne({
            key: 'userId',
            equals: usersSubscribed.id,
          })
        );

        const res = await Promise.all(profiles).then((results) =>
          results.filter((profile) => profile)
        );
        console.log(res);

        return res;
      },

      /*  const listId = usersSubscribedTo.map(({ id }) => id);
        return fastify.db.profiles.findMany({
          key: 'id',
          inArrayAnyOf: listId,
        });
      }, */
    },
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
