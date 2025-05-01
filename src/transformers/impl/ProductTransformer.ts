import { SchemaTransformer } from '../base/SchemaTransformer.js';
import { SchemaRegistry } from '../schema/SchemaRegistry.js';
import { SchemaTransformerFactory } from '../SchemaTransformerFactory.js';

export class ProductTransformer extends SchemaTransformer {
  constructor() {
    super(SchemaRegistry.getSchema('product')!);
  }

  protected applySchemaRules(item: any): any {
    const transformed = { ...item };
    
    // Apply entity-specific transformation rules
    // No specific transformation rules
    
    return transformed;
  }
  
  
}

// Register the transformer
SchemaTransformerFactory.registerTransformer('product', () => new ProductTransformer());
