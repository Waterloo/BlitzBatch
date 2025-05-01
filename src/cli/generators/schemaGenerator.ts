import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function generateSchema(entityConfig: any) {
  const { name: entityName, fields } = entityConfig;
  const schemaName = entityName.charAt(0).toUpperCase() + entityName.slice(1);
  
  const schemaContent = `import Joi from 'joi';
import { SchemaRegistry } from './SchemaRegistry.js';

// ${schemaName} Schema Definition
export const ${entityName}Schema = Joi.object({
${fields.map((field:any) => generateJoiField(field)).join(',\n')}
});

// Register the schema
SchemaRegistry.register({
  name: '${entityName}',
  schema: ${entityName}Schema,
  customRules: {
${generateCustomRules(fields)}
  },
  transformers: ['${entityName}-transformer']
});

export default ${entityName}Schema;
`;

  const schemaPath = path.join(process.cwd(), 'src', 'transformers', 'schema', `${entityName}Schema.ts`);
  await fs.writeFile(schemaPath, schemaContent);
  return schemaPath;
}

function generateJoiField(field: any): string {
  let validation = `  ${field.name}: Joi.${getJoiType(field.type)}()`;
  
  // Add validations based on field type
  if (field.type === 'email') {
    validation += '.email()';
  }
  
  if (field.type === 'phone') {
    validation = `  ${field.name}: Joi.string().pattern(/^\\+?[\\d\\s()-]{10,}$/)`;
  }
  
  if (field.type === 'string') {
    validation += '.trim()';
    if (field.minLength) validation += `.min(${field.minLength})`;
    if (field.maxLength) validation += `.max(${field.maxLength})`;
  }
  
  if (field.enum) {
    validation += `.valid(${field.enum.map((v:any) => `'${v}'`).join(', ')})`;
  }
  
  if (field.required) {
    validation += '.required()';
  } else {
    validation += '.optional()';
  }
  
  if (field.defaultValue !== undefined) {
    validation += `.default('${field.defaultValue}')`;
  }
  
  return validation;
}

function generateCustomRules(fields: any[]): string {
  const rules: string[] = [];
  
  fields.forEach(field => {
    if (field.type === 'email') {
      rules.push(`    ${field.name}: (value: string) => value?.toLowerCase().trim()`);
    }
    
    if (field.type === 'phone') {
      rules.push(`    ${field.name}: (value: string) => value?.replace(/[^\\d+]/g, '')`);
    }
    
    if (field.type === 'array' && field.name === 'tags') {
      rules.push(`    ${field.name}: (value: any) => {
      if (typeof value === 'string') {
        return value.split(',').map(tag => tag.trim()).filter(Boolean);
      }
      return value;
    }`);
    }
  });
  
  return rules.join(',\n');
}

function getJoiType(type: string): string {
  const typeMap: Record<string, string> = {
    string: 'string',
    number: 'number',
    boolean: 'boolean',
    date: 'date',
    email: 'string',
    phone: 'string',
    url: 'string().uri',
    array: 'array',
    object: 'object',
  };
  return typeMap[type] || 'string';
}