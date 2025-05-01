import fs from 'fs/promises';
import path from 'path';

export async function generateTransformer(entityConfig: any) {
  const { name: entityName, fields } = entityConfig;
  const className = entityName.charAt(0).toUpperCase() + entityName.slice(1) + 'Transformer';
  
  const transformerContent = `import { SchemaTransformer } from '../base/SchemaTransformer.js';
import { SchemaRegistry } from '../schema/SchemaRegistry.js';
import { SchemaTransformerFactory } from '../SchemaTransformerFactory.js';

export class ${className} extends SchemaTransformer {
  constructor() {
    super(SchemaRegistry.getSchema('${entityName}')!);
  }

  protected applySchemaRules(item: any): any {
    const transformed = { ...item };
    
    // Apply entity-specific transformation rules
    ${generateTransformationRules(fields)}
    
    return transformed;
  }
  
  ${generateHelperMethods(fields)}
}

// Register the transformer
SchemaTransformerFactory.registerTransformer('${entityName}', () => new ${className}());
`;

  const transformerPath = path.join(process.cwd(), 'src', 'transformers', 'impl', `${className}.ts`);
  await fs.writeFile(transformerPath, transformerContent);
  return transformerPath;
}

function generateTransformationRules(fields: any[]): string {
  const rules: string[] = [];
  
  // Check for name fields
  const hasFirstName = fields.some(f => f.name === 'firstName');
  const hasLastName = fields.some(f => f.name === 'lastName');
  
  if (hasFirstName && hasLastName) {
    rules.push(`
    // Handle full name if provided
    if (transformed.fullName && !transformed.firstName) {
      const nameParts = transformed.fullName.trim().split(/\\s+/);
      transformed.firstName = nameParts[0];
      transformed.lastName = nameParts.slice(1).join(' ') || transformed.firstName;
      delete transformed.fullName;
    }`);
  }
  
  fields.forEach(field => {
    if (field.type === 'email') {
      rules.push(`
    // Normalize email
    if (transformed.${field.name}) {
      transformed.${field.name} = transformed.${field.name}.toLowerCase().trim();
    }`);
    }
    
    if (field.type === 'phone') {
      rules.push(`
    // Normalize phone number
    if (transformed.${field.name}) {
      transformed.${field.name} = this.normalizePhoneNumber(transformed.${field.name});
    }`);
    }
    
    if (field.type === 'date') {
      rules.push(`
    // Convert date strings to Date objects
    if (transformed.${field.name} && typeof transformed.${field.name} === 'string') {
      transformed.${field.name} = new Date(transformed.${field.name});
    }`);
    }
    
    if (field.type === 'array' && field.name === 'tags') {
      rules.push(`
    // Parse tags if string
    if (typeof transformed.${field.name} === 'string') {
      transformed.${field.name} = transformed.${field.name}.split(',').map(tag => tag.trim()).filter(Boolean);
    }`);
    }
  });
  
  return rules.length > 0 ? rules.join('\n    ') : '// No specific transformation rules';
}

function generateHelperMethods(fields: any[]): string {
  const methods: string[] = [];
  
  if (fields.some(f => f.type === 'phone')) {
    methods.push(`
  private normalizePhoneNumber(phone: string): string {
    // Remove all non-digit characters except '+'
    const cleaned = phone.replace(/[^\\d+]/g, '');
    
    // Add country code if missing (assuming US)
    if (!cleaned.startsWith('+') && cleaned.length === 10) {
      return '+1' + cleaned;
    }
    
    return cleaned;
  }`);
  }
  
  return methods.join('\n');
}