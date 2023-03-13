import {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLList,
  GraphQLNonNull,
  GraphQLID,
} from 'graphql';
import Fastify, { FastifyInstance } from 'fastify';
import { NoRequiredEntity } from '../../utils/DB/errors/NoRequireEntity.error';
import { ChangeMemberType, MemberType } from './member-types/type';
import { ChangePost, CreatePost, PostType } from './posts/type';
import { ChangeProfile, CreateProfile, ProfileType } from './profilies/type';
import { ChangeUser, CreateUser, UserType } from './users/type';
import { UserEntity } from '../../utils/DB/entities/DBUsers';

export type ContextToGraph = {
  fastify: FastifyInstance;
};

const query = new GraphQLObjectType({
  name: 'Queries',
  description: 'Root endpoint Queries',
  fields: () => ({
    GetAllMemberTypes: {
      type: new GraphQLList(MemberType),
      resolve: async (parent, args, { fastify }: ContextToGraph) => {
        return fastify.db.memberTypes.findMany();
      },
    },
    GetOneOfMemberType: {
      type: MemberType,
      args: { id: { type: new GraphQLNonNull(GraphQLID) } },
      resolve: async (parent, args, { fastify }: ContextToGraph) => {
        const { id } = args;
        const type = await fastify.db.memberTypes.findOne({
          key: 'id',
          equals: id,
        });

        if (!type) throw fastify.httpErrors.notFound(`User not Found!`);

        return type;
      },
    },
    GetAllPosts: {
      type: new GraphQLList(PostType),
      resolve: async (parent, args, { fastify }: ContextToGraph) => {
        return fastify.db.posts.findMany();
      },
    },
    GetOneOfPost: {
      type: PostType,
      args: { id: { type: new GraphQLNonNull(GraphQLID) } },
      resolve: async (parent, args, { fastify }: ContextToGraph) => {
        try {
          const { id } = args;

          const profile = await fastify.db.posts.findOne({
            key: 'id',
            equals: id,
          });

          if (!profile) throw new NoRequiredEntity(``);

          return profile;
        } catch (error) {
          if (
            error instanceof NoRequiredEntity ||
            error instanceof Fastify.errorCodes.FST_ERR_NOT_FOUND
          ) {
            throw fastify.httpErrors.notFound();
          }
          throw fastify.httpErrors.badRequest();
        }
      },
    },
    GetAllProfiles: {
      type: new GraphQLList(ProfileType),
      resolve: async (parent, args, { fastify }: ContextToGraph) => {
        return fastify.db.profiles.findMany();
      },
    },
    GetOneOfProfile: {
      type: ProfileType,
      args: { id: { type: new GraphQLNonNull(GraphQLID) } },
      resolve: async (parent, args, { fastify }: ContextToGraph) => {
        const { id } = args;

        const profile = await fastify.db.profiles.findOne({
          key: 'id',
          equals: id,
        });

        if (!profile) throw fastify.httpErrors.notFound();

        return profile;
      },
    },
    GetAllUsers: {
      type: new GraphQLList(UserType),
      resolve: async (parent, args, { fastify }: ContextToGraph) => {
        return fastify.db.users.findMany();
      },
    },
    GetOneOfUser: {
      type: UserType,
      args: { id: { type: new GraphQLNonNull(GraphQLID) } },
      resolve: async (parent, args, { fastify }: ContextToGraph) => {
        const { id } = args;
        const user = await fastify.db.users.findOne({
          key: 'id',
          equals: id,
        });
        if (!user) throw fastify.httpErrors.notFound(`User not Found!`);
        return user;
      },
    },
  }),
});

const mutation = new GraphQLObjectType({
  name: 'Mutation',
  description: 'Root endpoint Mutations',
  fields: () => ({
    /* Member */
    ChangeMemberType: {
      type: MemberType,
      args: {
        id: {
          type: new GraphQLNonNull(GraphQLID),
        },
        input: {
          type: new GraphQLNonNull(ChangeMemberType),
        },
      },
      resolve: async (parent, args, { fastify }: ContextToGraph) => {
        try {
          const { id, input } = args;

          const changed = await fastify.db.memberTypes.change(id, input);

          return changed;
        } catch (error) {
          if (error instanceof NoRequiredEntity) {
            throw fastify.httpErrors.badRequest();
          }
          throw fastify.httpErrors.notFound();
        }
      },
    },
    /* Posts */
    CreatePost: {
      type: PostType,
      args: {
        post: {
          type: new GraphQLNonNull(CreatePost),
        },
      },
      resolve: async (parent, args, { fastify }: ContextToGraph) => {
        const { post } = args;
        return fastify.db.posts.create(post);
      },
    },

    ChangePost: {
      type: PostType,
      args: {
        id: {
          type: new GraphQLNonNull(GraphQLID),
        },
        input: {
          type: new GraphQLNonNull(ChangePost),
        },
      },
      resolve: async (parent, args, { fastify }: ContextToGraph) => {
        try {
          const { id, input } = args;
          const posts = await fastify.db.posts.change(id, input);
          return posts;
        } catch (error) {
          if (error instanceof NoRequiredEntity) {
            throw fastify.httpErrors.badRequest();
          }
          throw fastify.httpErrors.notFound();
        }
      },
    },

    DeletePost: {
      type: PostType,
      args: {
        id: {
          type: new GraphQLNonNull(GraphQLID),
        },
      },
      resolve: async (parent, args, { fastify }: ContextToGraph) => {
        try {
          const { id } = args;

          const posts = await fastify.db.posts.delete(id);
          return posts;
        } catch (error) {
          if (error instanceof NoRequiredEntity) {
            throw fastify.httpErrors.badRequest();
          }
          throw fastify.httpErrors.notFound();
        }
      },
    },
    /* Profile */
    CreateProfile: {
      type: ProfileType,
      args: {
        profile: {
          type: new GraphQLNonNull(CreateProfile),
        },
      },
      resolve: async (parent, args, { fastify }: ContextToGraph) => {
        const { userId, memberTypeId } = args.profile;

        const user = await fastify.db.users.findOne({
          key: 'id',
          equals: userId,
        });
        if (!user) throw fastify.httpErrors.badRequest();

        const type = await fastify.db.memberTypes.findOne({
          key: 'id',
          equals: memberTypeId,
        });
        if (!type) throw fastify.httpErrors.badRequest();

        const profile = await fastify.db.profiles.findOne({
          key: 'userId',
          equals: userId,
        });
        if (profile) throw fastify.httpErrors.badRequest();

        return fastify.db.profiles.create(args.profile);
      },
    },
    DeleteProfile: {
      type: ProfileType,
      args: {
        id: {
          type: new GraphQLNonNull(GraphQLID),
        },
      },
      resolve: async (parent, args, { fastify }: ContextToGraph) => {
        const { id } = args;

        const profile = await fastify.db.profiles.findOne({
          key: 'id',
          equals: id,
        });

        if (!profile) throw fastify.httpErrors.badRequest();

        return fastify.db.profiles.delete(profile.id);
      },
    },
    ChangeProfile: {
      type: ProfileType,
      args: {
        id: {
          type: new GraphQLNonNull(GraphQLID),
        },
        input: {
          type: new GraphQLNonNull(ChangeProfile),
        },
      },
      resolve: async (parent, args, { fastify }: ContextToGraph) => {
        try {
          const { id, input } = args;

          const profile = await fastify.db.profiles.findOne({
            key: 'id',
            equals: id,
          });

          if (!profile) throw fastify.httpErrors.badRequest();

          const profileChanged = await fastify.db.profiles.change(id, input);

          return profileChanged;
        } catch (error) {
          if (error instanceof NoRequiredEntity) {
            throw fastify.httpErrors.badRequest();
          }
          throw error;
        }
      },
    },
    /* User */
    CreateUser: {
      type: UserType,
      args: {
        input: {
          type: new GraphQLNonNull(CreateUser),
        },
      },
      resolve: async (parent, args, { fastify }: ContextToGraph) => {
        try {
          const user = args.input;

          return await fastify.db.users.create(user);
        } catch (error) {
          if (
            error instanceof NoRequiredEntity ||
            error instanceof Fastify.errorCodes.FST_ERR_NOT_FOUND
          ) {
            throw fastify.httpErrors.notFound();
          }
          throw fastify.httpErrors.badRequest();
        }
      },
    },
    ChangeUser: {
      type: UserType,
      args: {
        id: {
          type: new GraphQLNonNull(GraphQLID),
        },
        input: {
          type: new GraphQLNonNull(ChangeUser),
        },
      },
      resolve: async (parent, args, { fastify }: ContextToGraph) => {
        try {
          const { id, input } = args;

          const user = await fastify.db.users.findOne({
            key: 'id',
            equals: id,
          });

          if (!user) throw fastify.httpErrors.badRequest();

          return fastify.db.users.change(id, input);
        } catch (error) {
          if (error instanceof NoRequiredEntity) {
            throw fastify.httpErrors.notFound();
          }
          throw fastify.httpErrors.badRequest();
        }
      },
    },

    DeleteUser: {
      type: UserType,
      args: {
        id: {
          type: new GraphQLNonNull(GraphQLID),
        },
      },
      resolve: async (parent, args, { fastify }: ContextToGraph) => {
        const { id } = args;

        const yoursalf = await fastify.db.users.findOne({
          key: 'id',
          equals: id,
        });

        if (!yoursalf) throw fastify.httpErrors.badRequest();

        /* когда я удаляю юзера, мне нужно найти юзеров которые подписаны на удаляющего что-бы убрать подписку */
        const usersSubscribedList = await fastify.db.users.findMany({
          key: 'subscribedToUserIds',
          inArrayAnyOf: [id],
        });

        /* проверить асинхронность */
        for (const item of usersSubscribedList) {
          const updateSubscrib = item.subscribedToUserIds.filter(
            (subIdUser) => subIdUser !== id
          );

          const itemUpdate: Partial<Omit<UserEntity, 'id'>> = {
            subscribedToUserIds: updateSubscrib,
          };

          const upUser = await fastify.db.users.change(item.id, itemUpdate);
          console.log(upUser);
        }

        const profile = await fastify.db.profiles.findOne({
          key: 'userId',
          equals: id,
        });

        if (profile) {
          await fastify.db.profiles.delete(profile.id);
        }

        const postsUser = await fastify.db.posts.findMany({
          key: 'userId',
          equals: id,
        });

        for (const post of postsUser) {
          await fastify.db.posts.delete(post.id);
        }

        return fastify.db.users.delete(id);
      },
    },
    SubscribeTo: {
      type: UserType,
      args: {
        id: {
          type: new GraphQLNonNull(GraphQLID),
        },
        userId: {
          type: new GraphQLNonNull(GraphQLID),
        },
      },
      resolve: async (parent, args, { fastify }: ContextToGraph) => {
        const { id, userId } = args;

        const userToSubscribe = await fastify.db.users.findOne({
          key: 'id',
          equals: id,
        });

        if (!userToSubscribe) throw fastify.httpErrors.notFound();

        /* I want to Subscribed */
        const user = await fastify.db.users.findOne({
          key: 'id',
          equals: userId,
        });

        if (!user) throw fastify.httpErrors.notFound();

        /* Do I have  userToSubscribed ? */
        const isSubscribed = user.subscribedToUserIds.includes(
          userToSubscribe.id
        );

        if (isSubscribed) {
          return user;
        }

        const updateUserSubscribeTo = {
          subscribedToUserIds: [
            ...user.subscribedToUserIds,
            userToSubscribe.id,
          ],
        };

        const changed = await fastify.db.users.change(
          user.id,
          updateUserSubscribeTo
        );

        return changed;
      },
    },
    UnsubscribeTo: {
      type: UserType,
      args: {
        id: {
          type: new GraphQLNonNull(GraphQLID),
        },
        userId: {
          type: new GraphQLNonNull(GraphQLID),
        },
      },
      resolve: async (parent, args, { fastify }: ContextToGraph) => {
        const { id, userId } = args;

        const userToUnsubscribe = await fastify.db.users.findOne({
          key: 'id',
          equals: id,
        });

        if (!userToUnsubscribe) throw fastify.httpErrors.notFound();

        const user = await fastify.db.users.findOne({
          key: 'id',
          equals: userId,
        });

        if (!user) throw fastify.httpErrors.notFound();

        /* Do you have the  userToUnsubscribe ? */
        if (!user.subscribedToUserIds.includes(userToUnsubscribe.id)) {
          throw fastify.httpErrors.badRequest();
        }

        const updateUserSubscribed = {
          subscribedToUserIds: user.subscribedToUserIds.filter(
            (subscribe) => subscribe !== userToUnsubscribe.id
          ),
        };

        const changed = await fastify.db.users.change(
          user.id,
          updateUserSubscribed
        );

        return changed;
      },
    },
  }),
});

export const schema = new GraphQLSchema({
  query,
  mutation,
});
