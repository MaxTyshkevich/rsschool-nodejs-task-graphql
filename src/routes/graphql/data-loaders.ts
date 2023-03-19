/* import { JsonSchemaToTsProvider } from '@fastify/type-provider-json-schema-to-ts';
import DataLoader from 'dataloader';
import { FastifyInstance, RawServerDefault, FastifyBaseLogger } from 'fastify';
import { IncomingMessage, ServerResponse } from 'http';
import { FromSchemaDefaultOptions } from 'json-schema-to-ts';

export const createDataLoadersObj = (fastify: FastifyInstance<RawServerDefault, IncomingMessage, ServerResponse<IncomingMessage>, FastifyBaseLogger, JsonSchemaToTsProvider<FromSchemaDefaultOptions>>) => {
  async function getUser(keys :DataLoader.BatchLoadFn<unknown, unknown>, options?: DataLoader.Options<unknown, unknown, unknown> | undefined) {
    const userList = await fastify.db.users.findOne({key:'id' , equals: });
    const results = await db.fetchAllKeys(keys);
    return keys.map((key) => results[key] || new Error(`No result for ${key}`));
  }

  const dataLoaderList = {
    userById: new DataLoader(getUser),
  };
};
 */
