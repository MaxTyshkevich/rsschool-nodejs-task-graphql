import { FastifyPluginAsyncJsonSchemaToTs } from '@fastify/type-provider-json-schema-to-ts';
import { idParamSchema } from '../../utils/reusedSchemas';
import { changeMemberTypeBodySchema } from './schema';
import type { MemberTypeEntity } from '../../utils/DB/entities/DBMemberTypes';

import { NoRequiredEntity } from '../../utils/DB/errors/NoRequireEntity.error';

const plugin: FastifyPluginAsyncJsonSchemaToTs = async (
  fastify
): Promise<void> => {
  fastify.get('/', async function (request, reply): Promise<
    MemberTypeEntity[]
  > {
    return fastify.db.memberTypes.findMany();
  });

  fastify.get(
    '/:id',
    {
      schema: {
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<MemberTypeEntity> {
      const { id } = request.params;
      const type = await this.db.memberTypes.findOne({ key: 'id', equals: id });

      if (!type) throw fastify.httpErrors.notFound(`User not Found!`);

      return type;
    }
  );

  fastify.patch(
    '/:id',
    {
      schema: {
        body: changeMemberTypeBodySchema,
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<MemberTypeEntity> {
      try {
        const { id } = request.params;

        const changed = await fastify.db.memberTypes.change(id, request.body);

        return changed;
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
