import { FastifyPluginAsyncJsonSchemaToTs } from '@fastify/type-provider-json-schema-to-ts';
import { idParamSchema } from '../../utils/reusedSchemas';
import { createProfileBodySchema, changeProfileBodySchema } from './schema';
import type { ProfileEntity } from '../../utils/DB/entities/DBProfiles';
/* import Fastify from 'fastify'; */

import { NoRequiredEntity } from '../../utils/DB/errors/NoRequireEntity.error';

const plugin: FastifyPluginAsyncJsonSchemaToTs = async (
  fastify
): Promise<void> => {
  fastify.get('/', async function (request, reply): Promise<ProfileEntity[]> {
    return fastify.db.profiles.findMany();
  });

  fastify.get(
    '/:id',
    {
      schema: {
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<ProfileEntity> {
      const { id } = request.params;

      const profile = await fastify.db.profiles.findOne({
        key: 'id',
        equals: id,
      });

      if (!profile) throw fastify.httpErrors.notFound();

      return profile;
    }
  );

  fastify.post(
    '/',
    {
      schema: {
        body: createProfileBodySchema,
      },
    },
    async function (request, reply): Promise<ProfileEntity> {
      const { userId, memberTypeId } = request.body;

      const user = await this.db.users.findOne({ key: 'id', equals: userId });
      if (!user) throw fastify.httpErrors.badRequest();

      const type = await this.db.memberTypes.findOne({
        key: 'id',
        equals: memberTypeId,
      });
      if (!type) throw fastify.httpErrors.badRequest();

      const profile = await this.db.profiles.findOne({
        key: 'userId',
        equals: userId,
      });
      if (profile) throw fastify.httpErrors.badRequest();

      return fastify.db.profiles.create(request.body);
    }
  );

  fastify.delete(
    '/:id',
    {
      schema: {
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<ProfileEntity> {
      const { id } = request.params;

      const profile = await fastify.db.profiles.findOne({
        key: 'id',
        equals: id,
      });

      if (!profile) throw fastify.httpErrors.badRequest();

      return fastify.db.profiles.delete(profile.id);
    }
  );

  fastify.patch(
    '/:id',
    {
      schema: {
        body: changeProfileBodySchema,
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<ProfileEntity> {
      try {
        const { id } = request.params;

        const profile = await fastify.db.profiles.findOne({
          key: 'id',
          equals: id,
        });

        if (!profile) throw fastify.httpErrors.notFound();

        return fastify.db.profiles.change(id, request.body);
      } catch (error) {
        if (error instanceof NoRequiredEntity) {
          throw fastify.httpErrors.badRequest();
        }
        throw error;
      }
    }
  );
};

export default plugin;
