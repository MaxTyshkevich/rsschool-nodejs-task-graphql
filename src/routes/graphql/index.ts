import { FastifyPluginAsyncJsonSchemaToTs } from '@fastify/type-provider-json-schema-to-ts';
/* import DataLoader = require('dataloader'); */
import { graphql } from 'graphql/graphql';
import { graphqlBodySchema } from './schema';
import { schema } from './types';

const plugin: FastifyPluginAsyncJsonSchemaToTs = async (
  fastify
): Promise<void> => {
  fastify.post(
    '/',
    {
      schema: {
        body: graphqlBodySchema,
      },
    },
    async function (request, reply) {
      const { query, variables } = request.body;

      /*   const loader = new DataLoader((keys) => {
       
      }); */

      if (query) {
        return await graphql({
          schema,
          source: query,
          variableValues: variables,
          contextValue: { fastify },
        });
      }
    }
  );
};

export default plugin;
