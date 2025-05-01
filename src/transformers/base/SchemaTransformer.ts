import { BaseTransformer } from './BaseTransformer.js';
import { TransformResult, TransformerOptions, TransformError } from '../types.js';
import { EntitySchema } from '../schema/SchemaRegistry.js';

export abstract class SchemaTransformer<T = any> extends BaseTransformer<T[], T[]> {
  constructor(protected entitySchema: EntitySchema) {
    super();
  }

  canHandle(input: any): boolean {
    return Array.isArray(input);
  }

  protected abstract applySchemaRules(item: T): T;
  
  protected async doTransform(
    input: T[], 
    options?: TransformerOptions
  ): Promise<TransformResult<T>> {
    const transformed: T[] = [];
    const errors: TransformError[] = [];

    for (let i = 0; i < input.length; i++) {
      try {
        // Apply schema-specific transformations
        let item = this.applySchemaRules(input[i]);
        
        // Apply custom rules if defined
        if (this.entitySchema.customRules) {
          for (const [field, rule] of Object.entries(this.entitySchema.customRules)) {
            if (item[field] !== undefined) {
              item[field] = rule(item[field]);
            }
          }
        }
        
        // Validate against schema
        const { error, value } = this.entitySchema.schema.validate(item);
        
        if (error) {
          errors.push({
            row: i,
            message: error.message,
            value: item,
          });
        } else {
          transformed.push(value);
        }

        // Report progress if callback provided
        if (options?.onProgress) {
          options.onProgress((i + 1) / input.length * 100);
        }
      } catch (error) {
        errors.push({
          row: i,
          message: error.message,
          value: input[i],
        });
      }
    }

    return {
      data: transformed,
      errors,
      metadata: {
        totalRecords: input.length,
        successfulRecords: transformed.length,
        failedRecords: errors.length,
        skippedRecords: 0,
      },
    };
  }
}