import { FastifyPluginAsyncJsonSchemaToTs } from '@fastify/type-provider-json-schema-to-ts';
import { idParamSchema } from '../../utils/reusedSchemas';
import {
  createUserBodySchema,
  changeUserBodySchema,
  subscribeBodySchema,
} from './schemas';
import type { UserEntity } from '../../utils/DB/entities/DBUsers';
import { NoRequiredEntity } from '../../utils/DB/errors/NoRequireEntity.error';

export type GetId = {
  id: string;
};
type CreateUser = {
  firstName: string;
  lastName: string;
  email: string;
};
type ChangeUser = {
  firstName?: string | undefined;
  lastName?: string | undefined;
  email?: string | undefined;
  subscribedToUserIds?: string[] | undefined;
};

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
      const user = await fastify.db.users.findOne({
        key: 'id',
        equals: (request.params as GetId).id,
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
        const user = request.body as CreateUser;

        return await fastify.db.users.create(user);
      } catch (error) {
        if (error instanceof NoRequiredEntity) {
          throw fastify.httpErrors.badRequest('404');
        }
        throw fastify.httpErrors.notFound();
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
        const { id } = request.params as GetId;
        return this.db.users.delete(id);
      } catch (error) {
        if (error instanceof NoRequiredEntity) {
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
        const { id } = request.params as GetId;

        const yoursalf = await fastify.db.users.findOne({
          key: 'id',
          equals: id,
        });
        if (!yoursalf) throw fastify.httpErrors.notFound(`User not Found!`);

        const updatesalf = { ...yoursalf } as UserEntity;

        updatesalf.subscribedToUserIds?.push(JSON.stringify(request.body));

        const changed = await this.db.users.change(
          id,
          updatesalf as ChangeUser
        );

        return changed;
      } catch (error) {
        if (error instanceof NoRequiredEntity) {
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
        const { id } = request.params as GetId;

        const yoursalf = await fastify.db.users.findOne({
          key: 'id',
          equals: id,
        });
        if (!yoursalf) throw fastify.httpErrors.notFound(`User not Found!`);

        const updatesalf = { ...yoursalf } as UserEntity;

        const targetUser = JSON.stringify(request.body);
        updatesalf.subscribedToUserIds.filter((user) => user !== targetUser);

        const changed = await this.db.users.change(
          id,
          updatesalf as ChangeUser
        );

        return changed;
      } catch (error) {
        if (error instanceof NoRequiredEntity) {
          throw fastify.httpErrors.notFound();
        }
        throw fastify.httpErrors.notFound();
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
        const { id } = request.params as GetId;

        return this.db.users.change(id, request.body as ChangeUser);
      } catch (error) {
        if (error instanceof NoRequiredEntity) {
          throw fastify.httpErrors.notFound();
        }
        throw fastify.httpErrors.notFound();
      }
    }
  );
};

export default plugin;
