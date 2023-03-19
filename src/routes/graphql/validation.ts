import { schema } from './types';

import depthLimit from 'graphql-depth-limit';
import { validate } from 'graphql/validation';
import { GraphQLError, parse, Source } from 'graphql';

const MAX_DEPTH_LIMIT = 6;

export const validationErrors = function validationErrors(
  query: string
): readonly GraphQLError[] {
  const source = new Source(query);
  const ast = parse(source);
  return validate(schema, ast, [depthLimit(MAX_DEPTH_LIMIT)]);
};
