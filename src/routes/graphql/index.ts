import { FastifyPluginAsyncJsonSchemaToTs } from '@fastify/type-provider-json-schema-to-ts';
/* import DataLoader = require('dataloader'); */
import { graphql } from 'graphql/graphql';

import { graphqlBodySchema } from './schema';
import { schema } from './types';

import { validationErrors } from './validation';
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

      if (query) {
        const ErrorList = validationErrors(query);
        const isError = Boolean(ErrorList.length);
        if (isError) {
          throw fastify.httpErrors.badRequest(`Graphql limit max.`);
        }

        const loaders = new WeakMap();

        return await graphql({
          schema,
          source: query,
          variableValues: variables,
          contextValue: { fastify, loaders },
        });
      }
    }
  );
};

export default plugin;
