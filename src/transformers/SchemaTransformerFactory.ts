import { ITransformer } from './types.js';

export class SchemaTransformerFactory {
  private static transformers: Map<string, () => ITransformer> = new Map();

  static registerTransformer(schemaName: string, factory: () => ITransformer): void {
    this.transformers.set(schemaName, factory);
  }

  static getTransformer(schemaName: string): ITransformer | null {
    const factory = this.transformers.get(schemaName);
    
    if (factory) {
      return factory();
    }
    
    console.warn(`No transformer registered for schema: ${schemaName}`);
    return null;
  }

  static hasTransformer(schemaName: string): boolean {
    return this.transformers.has(schemaName);
  }

  static getAllTransformerNames(): string[] {
    return Array.from(this.transformers.keys());
  }
}