import Joi from 'joi';

export interface EntitySchema {
  name: string;
  schema: Joi.Schema;
  transformers?: string[];
  customRules?: Record<string, (value: any) => any>;
}

export class SchemaRegistry {
  private static schemas: Map<string, EntitySchema> = new Map();

  static register(schema: EntitySchema): void {
    this.schemas.set(schema.name, schema);
  }

  static getSchema(name: string): EntitySchema | undefined {
    return this.schemas.get(name);
  }

  static getAllSchemas(): EntitySchema[] {
    return Array.from(this.schemas.values());
  }

  static hasSchema(name: string): boolean {
    return this.schemas.has(name);
  }
}