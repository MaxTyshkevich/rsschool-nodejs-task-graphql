import { FastifyPluginAsyncJsonSchemaToTs } from '@fastify/type-provider-json-schema-to-ts';
import { idParamSchema } from '../../utils/reusedSchemas';
import { createPostBodySchema, changePostBodySchema } from './schema';
import type { PostEntity } from '../../utils/DB/entities/DBPosts';
import Fastify from 'fastify';
import { NoRequiredEntity } from '../../utils/DB/errors/NoRequireEntity.error';

const plugin: FastifyPluginAsyncJsonSchemaToTs = async (
  fastify
): Promise<void> => {
  fastify.get('/', async function (request, reply): Promise<PostEntity[]> {
    return fastify.db.posts.findMany();
  });

  fastify.get(
    '/:id',
    {
      schema: {
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<PostEntity> {
      try {
        const { id } = request.params;

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
    }
  );

  fastify.post(
    '/',
    {
      schema: {
        body: createPostBodySchema,
      },
    },
    async function (request, reply): Promise<PostEntity> {
      return fastify.db.posts.create(request.body);
    }
  );

  fastify.delete(
    '/:id',
    {
      schema: {
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<PostEntity> {
      try {
        const { id } = request.params;

        const posts = await fastify.db.posts.delete(id);
        return posts;
      } catch (error) {
        if (error instanceof NoRequiredEntity) {
          throw fastify.httpErrors.badRequest();
        }
        throw fastify.httpErrors.notFound();
      }
    }
  );

  fastify.patch(
    '/:id',
    {
      schema: {
        body: changePostBodySchema,
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<PostEntity> {
      try {
        const { id } = request.params;

        const posts = await fastify.db.posts.change(id, request.body);
        return posts;
      } catch (error) {
        if (error instanceof NoRequiredEntity) {
          throw fastify.httpErrors.badRequest();
        }
        throw fastify.httpErrors.notFound();
      }
    }
  );
};

export default plugin;
