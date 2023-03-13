import { FastifyPluginAsyncJsonSchemaToTs } from '@fastify/type-provider-json-schema-to-ts';
import { idParamSchema } from '../../utils/reusedSchemas';
import {
  createUserBodySchema,
  changeUserBodySchema,
  subscribeBodySchema,
} from './schemas';
import type { UserEntity } from '../../utils/DB/entities/DBUsers';
import { NoRequiredEntity } from '../../utils/DB/errors/NoRequireEntity.error';
import Fastify from 'fastify';

const plugin: FastifyPluginAsyncJsonSchemaToTs = async (
  fastify
): Promise<void> => {
  fastify.get('/', async function (request, reply): Promise<UserEntity[]> {
    return this.db.users.findMany();
  });

  fastify.get(
    '/:id',
    {
      schema: {
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<UserEntity> {
      const { id } = request.params;
      const user = await fastify.db.users.findOne({
        key: 'id',
        equals: id,
      });
      if (!user) throw fastify.httpErrors.notFound(`User not Found!`);
      return user;
    }
  );

  fastify.post(
    '/',
    {
      schema: {
        body: createUserBodySchema,
      },
    },
    async function (request, reply): Promise<UserEntity> {
      try {
        const user = request.body;

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
    }
  );

  fastify.delete(
    '/:id',
    {
      schema: {
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<UserEntity> {
      const { id } = request.params;

      const yoursalf = await fastify.db.users.findOne({
        key: 'id',
        equals: id,
      });

      if (!yoursalf) throw fastify.httpErrors.badRequest();

      /* когда я удаляю юзера, мне нужно найти юзеров которые подписаны на удаляющего что-бы убрать подписку */
      const usersSubscribedList = await this.db.users.findMany({
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

      /*   const s = await Promise.all(
        usersSubscribedList.map(async (item) => {
          const updateSubscrib = item.subscribedToUserIds.filter(
            (subIdUser) => subIdUser !== id
          );

          const itemUpdate: Partial<Omit<UserEntity, 'id'>> = {
            subscribedToUserIds: updateSubscrib,
          };
          return fastify.db.users.change(id, itemUpdate);
        }) */

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
        const postDel = await fastify.db.posts.delete(post.id);
        console.log(postDel);
      }

      const delUser = await fastify.db.users.delete(id);
      return delUser;
    }
  );

  fastify.post(
    '/:id/subscribeTo',
    {
      schema: {
        body: subscribeBodySchema,
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<UserEntity> {
      const { id } = request.params;

      const userToSubscribe = await fastify.db.users.findOne({
        key: 'id',
        equals: id,
      });

      if (!userToSubscribe) throw fastify.httpErrors.notFound();

      /* I want to Subscribed */
      const user = await fastify.db.users.findOne({
        key: 'id',
        equals: request.body.userId,
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
        subscribedToUserIds: [...user.subscribedToUserIds, userToSubscribe.id],
      };

      const changed = await this.db.users.change(
        user.id,
        updateUserSubscribeTo
      );

      return changed;
    }
  );

  fastify.post(
    '/:id/unsubscribeFrom',
    {
      schema: {
        body: subscribeBodySchema,
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<UserEntity> {
      const { id } = request.params;
      const { userId } = request.body;

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

      const changed = await this.db.users.change(user.id, updateUserSubscribed);

      return changed;
    }
  );

  fastify.patch(
    '/:id',
    {
      schema: {
        body: changeUserBodySchema,
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<UserEntity> {
      const { id } = request.params;

      const user = await fastify.db.users.findOne({
        key: 'id',
        equals: id,
      });

      if (!user) throw fastify.httpErrors.badRequest();

      return fastify.db.users.change(id, request.body);
    }
  );
};

export default plugin;
