export const schemaTemplate = `import Joi from 'joi';
import { SchemaRegistry } from '../SchemaRegistry.js';

export const {{entityName}}Schema = Joi.object({
  {{fields}}
});

SchemaRegistry.register({
  name: '{{entityName}}',
  schema: {{entityName}}Schema,
  customRules: {
    {{customRules}}
  },
  transformers: ['{{entityName}}-transformer']
});

export default {{entityName}}Schema;
`;