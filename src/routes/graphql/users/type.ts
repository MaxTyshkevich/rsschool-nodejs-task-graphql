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
import DataLoader from 'dataloader';

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
        { fastify, loaders }: ContextToGraph,
        info
      ) => {
        let dl = loaders.get(info.fieldNodes);

        if (!dl) {
          dl = new DataLoader(async (ids: any) => {
            // обращаемся в базу чтоб получить авторов по ids
            const profiles = await fastify.db.profiles.findMany({
              key: 'userId',
              equalsAnyOf: ids,
            });

            // IMPORTANT: сортируем данные из базы в том порядке, как нам передали ids
            const sortedInIdsOrder = ids.map(
              (id: string) =>
                profiles.find((profile) => profile.userId === id) ?? null
            );
            return sortedInIdsOrder;
          });
          // ложим инстанс дата-лоадера в WeakMap для повторного использования
          loaders.set(info.fieldNodes, dl);
        }

        return dl.load(user.id);
      },
    },

    subscribedToUser: {
      type: new GraphQLList(ProfileType),
      resolve: async (
        user: UserEntity,
        args: [],
        { fastify, loaders }: ContextToGraph,
        info
      ) => {
        let dl = loaders.get(info.fieldNodes);

        if (!dl) {
          dl = new DataLoader(async (ids: readonly string[][]) => {
            const listIds: string[] = [];
            ids.forEach((arrayIds) => {
              listIds.push(...arrayIds);
            });

            const profiles = await fastify.db.profiles.findMany({
              key: 'userId',
              equalsAnyOf: listIds,
            });

            // IMPORTANT: сортируем данные из базы в том порядке, как нам передали ids
            const sortedInIdsOrder = ids.map((userslist: string[]) =>
              userslist.map(
                (id) =>
                  profiles.find((profile) => profile.userId === id) ?? null
              )
            );
            return sortedInIdsOrder;
          });
          // ложим инстанс дата-лоадера в WeakMap для повторного использования
          loaders.set(info.fieldNodes, dl);
        }

        return dl.load(user.subscribedToUserIds);
      },
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
