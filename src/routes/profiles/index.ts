import { FastifyPluginAsyncJsonSchemaToTs } from '@fastify/type-provider-json-schema-to-ts';
import { idParamSchema } from '../../utils/reusedSchemas';
import { createProfileBodySchema, changeProfileBodySchema } from './schema';
import type {
  CreateProfileDTO,
  ProfileEntity,
} from '../../utils/DB/entities/DBProfiles';
import { GetId } from '../users';
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
      try {
        const { id } = request.params as GetId;

        const profile = await fastify.db.profiles.findOne({
          key: 'id',
          equals: id,
        });

        if (!profile) throw new NoRequiredEntity(``);

        return profile;
      } catch (error) {
        if (error instanceof NoRequiredEntity) {
          throw fastify.httpErrors.notFound();
        }
        throw fastify.httpErrors.badRequest();
      }
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
      try {
        const profile = await fastify.db.profiles.create(
          request.body as CreateProfileDTO
        );

        if (!profile) throw new NoRequiredEntity(``);

        return profile;
      } catch (error) {
        if (error instanceof NoRequiredEntity) {
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
    async function (request, reply): Promise<ProfileEntity> {
      try {
        const { id } = request.params as GetId;

        const profile = await fastify.db.profiles.delete(id);
        return profile;
      } catch (error) {
        if (error instanceof NoRequiredEntity) {
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
        body: changeProfileBodySchema,
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<ProfileEntity> {}
  );
};

export default plugin;
