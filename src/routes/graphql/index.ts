import { FastifyPluginAsyncJsonSchemaToTs } from '@fastify/type-provider-json-schema-to-ts';
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
      const { query, variables, mutation } = request.body;

      if (query) {
        console.log(`query: `, query);
        console.log(`variables: `, variables);
        console.log(`mutation: `, mutation);

        return await graphql({
          schema,
          source: query,
          variableValues: variables,
          contextValue: fastify,
        });
      }
    }
  );
};

export default plugin;
