import fs from 'fs/promises';
import path from 'path';

export async function generateModel(entityConfig: any) {
  const { name: entityName, fields, virtualFields, textSearchFields, indexes } = entityConfig;
  const modelName = entityName.charAt(0).toUpperCase() + entityName.slice(1);
  
  const modelContent = `import mongoose from 'mongoose';

const ${modelName}Schema = new mongoose.Schema({
${fields.map((field: any) => generateMongooseField(field)).join(',\n')}
}, { 
  timestamps: true${indexes?.length ? ',\n  indexes: [\n' + generateIndexes(fields, indexes) + '\n  ]' : ''}
});

${generateVirtualFields(modelName, virtualFields)}

${generateTextSearch(modelName, textSearchFields)}

${generateFieldIndexes(modelName, fields)}

export const ${modelName} = mongoose.model('${modelName}', ${modelName}Schema);
`;

  const modelPath = path.join(process.cwd(), 'src', 'models', `${modelName}.ts`);
  await fs.writeFile(modelPath, modelContent);
  return modelPath;
}

function generateMongooseField(field: any): string {
  let fieldDef = `  ${field.name}: { type: ${getMongooseType(field.type)}`;
  
  if (field.required) fieldDef += ', required: true';
  if (field.unique) fieldDef += ', unique: true';
  if (field.type === 'string') fieldDef += ', trim: true';
  if (field.type === 'email') fieldDef += ', lowercase: true';
  if (field.minLength) fieldDef += `, minlength: ${field.minLength}`;
  if (field.maxLength) fieldDef += `, maxlength: ${field.maxLength}`;
  if (field.enum) fieldDef += `, enum: [${field.enum.map((v:any) => `'${v}'`).join(', ')}]`;
  if (field.defaultValue !== undefined) fieldDef += `, default: '${field.defaultValue}'`;
  
  fieldDef += ' }';
  return fieldDef;
}

function generateVirtualFields(modelName: string, virtualFields?: any[]): string {
  if (!virtualFields || virtualFields.length === 0) return '';
  
  return virtualFields.map(vf => `
// Virtual field: ${vf.name}
${modelName}Schema.virtual('${vf.name}').get(function() {
  ${vf.getter}
});`).join('\n');
}

function generateTextSearch(modelName: string, textSearchFields?: string[]): string {
  if (!textSearchFields || textSearchFields.length === 0) return '';
  
  const searchConfig = textSearchFields.map(field => `  ${field}: 'text'`).join(',\n');
  
  return `
// Add text search
${modelName}Schema.index({
${searchConfig}
});`;
}

function generateIndexes(fields: any[], indexes?: any[]): string {
  if (!indexes || indexes.length === 0) return '';
  
  return indexes.map(index => {
    const indexFields = index.fields.map((f:any) => `${f}: 1`).join(', ');
    const unique = index.unique ? ', unique: true' : '';
    return `    { ${indexFields}${unique} }`;
  }).join(',\n');
}

function generateFieldIndexes(modelName: string, fields: any[]): string {
  const indexedFields = fields.filter(f => f.indexed && !f.unique);
  if (indexedFields.length === 0) return '';
  
  return indexedFields.map(field => `
// Index for ${field.name}
${modelName}Schema.index({ ${field.name}: 1 });`).join('\n');
}

function getMongooseType(type: string): string {
  const typeMap: Record<string, string> = {
    string: 'String',
    number: 'Number',
    boolean: 'Boolean',
    date: 'Date',
    email: 'String',
    phone: 'String',
    url: 'String',
    array: '[mongoose.Schema.Types.Mixed]',
    object: 'mongoose.Schema.Types.Mixed',
  };
  return typeMap[type] || 'String';
}