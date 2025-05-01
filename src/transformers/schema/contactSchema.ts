import Joi from 'joi';
import { SchemaRegistry } from '../SchemaRegistry.js';

// Contact Schema Definition
export const contactSchema = Joi.object({
  firstName: Joi.string().required().trim().min(1).max(50),
  lastName: Joi.string().required().trim().min(1).max(50),
  email: Joi.string().email().required().lowercase(),
  phone: Joi.string().pattern(/^\+?[\d\s()-]{10,}$/).allow('').optional(),
  company: Joi.string().trim().max(100).allow('').optional(),
  status: Joi.string().valid('active', 'inactive', 'pending').default('active'),
  tags: Joi.array().items(Joi.string().trim()).optional(),
  lastContactedAt: Joi.date().iso().optional()
});

// Register the schema
SchemaRegistry.register({
  name: 'contact',
  schema: contactSchema,
  customRules: {
    email: (value: string) => value?.toLowerCase().trim(),
    phone: (value: string) => value?.replace(/[^\d+]/g, ''), // Keep only digits and +
    tags: (value: any) => {
      if (typeof value === 'string') {
        return value.split(',').map(tag => tag.trim()).filter(Boolean);
      }
      return value;
    }
  },
  transformers: ['contact-transformer']
});

export default contactSchema;