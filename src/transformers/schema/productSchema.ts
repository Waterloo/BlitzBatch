import Joi from 'joi';
import { SchemaRegistry } from './SchemaRegistry.js';

// Product Schema Definition
export const productSchema = Joi.object({
  productName: Joi.string().trim().min(50).max(50).required(),
  price: Joi.number().required()
});

// Register the schema
SchemaRegistry.register({
  name: 'product',
  schema: productSchema,
  customRules: {

  },
  transformers: ['product-transformer']
});

export default productSchema;
