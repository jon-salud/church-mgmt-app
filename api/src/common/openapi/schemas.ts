import { ApiResponseOptions } from '@nestjs/swagger';

export const arrayOfObjectsResponse: ApiResponseOptions = {
  description: 'Successful response',
  schema: {
    type: 'array',
    items: {
      type: 'object',
      additionalProperties: true,
    },
  },
};

export const objectResponse: ApiResponseOptions = {
  description: 'Successful response',
  schema: {
    type: 'object',
    additionalProperties: true,
  },
};
