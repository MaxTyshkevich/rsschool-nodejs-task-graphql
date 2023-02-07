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
      try {
        const { id } = request.params;

        const yoursalf = await fastify.db.users.findOne({
          key: 'id',
          equals: id,
        });

        if (!yoursalf) throw new NoRequiredEntity('');

        const userssubscribed = await this.db.users.findMany({
          key: 'subscribedToUserIds',
          inArray: id,
        });

        userssubscribed.forEach(async (user: UserEntity) => {
          const indexID = user.subscribedToUserIds.findIndex(
            (userID) => userID === id
          );

          const updateUserSubscribe = [...user.subscribedToUserIds].splice(
            indexID,
            1
          );

          await this.db.users.change(user.id, {
            subscribedToUserIds: updateUserSubscribe,
          });
        });

        return this.db.users.delete(id);
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

  fastify.post(
    '/:id/subscribeTo',
    {
      schema: {
        body: subscribeBodySchema,
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<UserEntity> {
      try {
        const { id } = request.params;

        const yoursalf = await fastify.db.users.findOne({
          key: 'id',
          equals: id,
        });
        if (!yoursalf) throw fastify.httpErrors.notFound();

        const userSubscribeTo = await fastify.db.users.findOne({
          key: 'id',
          equals: request.body.userId,
        });

        if (!userSubscribeTo) throw fastify.httpErrors.notFound();

        const isSubscribed = userSubscribeTo.subscribedToUserIds.includes(
          yoursalf.id
        );
        if (isSubscribed) {
          return userSubscribeTo;
        }

        const updateUserSubscribeTo = {
          ...userSubscribeTo,
          subscribedToUserIds: [
            ...userSubscribeTo.subscribedToUserIds,
            yoursalf.id,
          ],
        };

        const changed = await this.db.users.change(
          userSubscribeTo.id,
          updateUserSubscribeTo
        );

        return changed;
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

  fastify.post(
    '/:id/unsubscribeFrom',
    {
      schema: {
        body: subscribeBodySchema,
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<UserEntity> {
      try {
        const { id } = request.params;
        const { userId } = request.body;

        const yoursalf = await fastify.db.users.findOne({
          key: 'id',
          equals: id,
        });
        if (!yoursalf) throw fastify.httpErrors.notFound();

        const userToUnnsubscribe = await fastify.db.users.findOne({
          key: 'id',
          equals: userId,
        });

        if (!userToUnnsubscribe) throw fastify.httpErrors.notFound();

        const updateUserToUnnsubscribe = {
          subscribedToUserIds: userToUnnsubscribe.subscribedToUserIds.filter(
            (subscribe) => subscribe !== yoursalf.id
          ),
        };
        const changed = await this.db.users.change(
          id,
          updateUserToUnnsubscribe
        );

        return changed;
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

  fastify.patch(
    '/:id',
    {
      schema: {
        body: changeUserBodySchema,
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<UserEntity> {
      try {
        const { id } = request.params;

        return this.db.users.change(id, request.body);
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
};

export default plugin;
