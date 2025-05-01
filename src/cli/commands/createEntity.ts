import inquirer from 'inquirer';
import chalk from 'chalk';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateSchema } from '../generators/schemaGenerator.js';
import { generateTransformer } from '../generators/transformerGenerator.js';
import { generateModel } from '../generators/modelGenerator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface FieldDefinition {
  name: string;
  type: string;
  required: boolean;
  unique?: boolean;
  defaultValue?: any;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  enum?: string[];
  indexed?: boolean;
}

interface EntityConfig {
  name: string;
  fields: FieldDefinition[];
  virtualFields?: Array<{name: string, getter: string}>;
  textSearchFields?: string[];
  indexes?: Array<{fields: string[], unique?: boolean}>;
}

export async function createEntity() {
  console.log(chalk.blue.bold('\n🚀 BlitzBatch Entity Creator\n'));

  const { entityName } = await inquirer.prompt([
    {
      type: 'input',
      name: 'entityName',
      message: 'What is the name of your entity? (e.g., product, order)',
      validate: (input) => {
        if (!input) return 'Entity name is required';
        if (!/^[a-z][a-z0-9]*$/i.test(input)) {
          return 'Entity name must start with a letter and contain only letters and numbers';
        }
        return true;
      },
    },
  ]);

  const fields: FieldDefinition[] = [];
  let addMoreFields = true;

  while (addMoreFields) {
    const fieldAnswers = await inquirer.prompt([
      {
        type: 'input',
        name: 'name',
        message: 'Field name:',
        validate: (input) => {
          if (!input) return 'Field name is required';
          if (fields.some(f => f.name === input)) return 'Field already exists';
          return true;
        },
      },
      {
        type: 'list',
        name: 'type',
        message: 'Field type:',
        choices: [
          'string',
          'number',
          'boolean',
          'date',
          'email',
          'phone',
          'url',
          'array',
          'object',
          'status',
        ],
      },
      {
        type: 'confirm',
        name: 'required',
        message: 'Is this field required?',
        default: false,
      },
      {
        type: 'confirm',
        name: 'unique',
        message: 'Is this field unique?',
        default: false,
      },
      {
        type: 'confirm',
        name: 'indexed',
        message: 'Should this field be indexed?',
        default: (answers) => answers.unique || false,
      },
    ]);

    // Additional options based on field type
    const field: FieldDefinition = {
      name: fieldAnswers.name,
      type: fieldAnswers.type,
      required: fieldAnswers.required,
      unique: fieldAnswers.unique,
      indexed: fieldAnswers.indexed,
    };

    // Type-specific questions
    if (fieldAnswers.type === 'string') {
      const stringOptions = await inquirer.prompt([
        {
          type: 'number',
          name: 'minLength',
          message: 'Minimum length (leave empty for no limit):',
        },
        {
          type: 'number',
          name: 'maxLength',
          message: 'Maximum length (leave empty for no limit):',
        },
      ]);
      if (stringOptions.minLength) field.minLength = stringOptions.minLength;
      if (stringOptions.maxLength) field.maxLength = stringOptions.maxLength;
    }

    if (fieldAnswers.type === 'status') {
      const statusOptions = await inquirer.prompt([
        {
          type: 'input',
          name: 'enumValues',
          message: 'Enter status values (comma-separated):',
          default: 'active,inactive,pending',
        },
      ]);
      field.type = 'string';
      field.enum = statusOptions.enumValues.split(',').map((s:any) => s.trim());
    }

    fields.push(field);

    const { continue: shouldContinue } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'continue',
        message: 'Add another field?',
        default: true,
      },
    ]);

    addMoreFields = shouldContinue;
  }

  // Advanced options
  const advancedOptions = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'addVirtualFields',
      message: 'Add virtual fields (like computed properties)?',
      default: false,
    },
    {
      type: 'confirm',
      name: 'addTextSearch',
      message: 'Enable text search?',
      default: false,
    },
    {
      type: 'confirm',
      name: 'addCustomIndexes',
      message: 'Add custom indexes?',
      default: false,
    },
  ]);

  const entityConfig: EntityConfig = {
    name: entityName,
    fields,
  };

  // Virtual fields
  if (advancedOptions.addVirtualFields) {
    entityConfig.virtualFields = [];
    let addMoreVirtual = true;
    
    while (addMoreVirtual) {
      const virtualField = await inquirer.prompt([
        {
          type: 'input',
          name: 'name',
          message: 'Virtual field name:',
        },
        {
          type: 'input',
          name: 'getter',
          message: 'Getter function (use "this" to access document):',
          default: 'return this.field1 + this.field2;',
        },
      ]);
      
      entityConfig.virtualFields.push(virtualField);
      
      const { continue: shouldContinue } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'continue',
          message: 'Add another virtual field?',
          default: false,
        },
      ]);
      
      addMoreVirtual = shouldContinue;
    }
  }

  // Text search fields
  if (advancedOptions.addTextSearch) {
    const textSearchFields = fields
      .filter(f => f.type === 'string' || f.type === 'email')
      .map(f => f.name);
    
    const { selectedFields } = await inquirer.prompt([
      {
        type: 'checkbox',
        name: 'selectedFields',
        message: 'Select fields for text search:',
        choices: textSearchFields,
      },
    ]);
    
    entityConfig.textSearchFields = selectedFields;
  }

  // Custom indexes
  if (advancedOptions.addCustomIndexes) {
    entityConfig.indexes = [];
    let addMoreIndexes = true;
    
    while (addMoreIndexes) {
      const indexConfig = await inquirer.prompt([
        {
          type: 'checkbox',
          name: 'fields',
          message: 'Select fields for this index:',
          choices: fields.map(f => f.name),
        },
        {
          type: 'confirm',
          name: 'unique',
          message: 'Is this a unique index?',
          default: false,
        },
      ]);
      
      entityConfig.indexes.push({
        fields: indexConfig.fields,
        unique: indexConfig.unique,
      });
      
      const { continue: shouldContinue } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'continue',
          message: 'Add another index?',
          default: false,
        },
      ]);
      
      addMoreIndexes = shouldContinue;
    }
  }

  // Generate files
  console.log(chalk.yellow('\n📝 Generating files...\n'));

  try {
    // Generate schema
    const schemaPath = await generateSchema(entityConfig);
    console.log(chalk.green(`✓ Schema created: ${schemaPath}`));

    // Generate transformer
    const transformerPath = await generateTransformer(entityConfig);
    console.log(chalk.green(`✓ Transformer created: ${transformerPath}`));

    // Generate model
    const modelPath = await generateModel(entityConfig);
    console.log(chalk.green(`✓ Model created: ${modelPath}`));

    console.log(chalk.green.bold(`\n✨ Entity "${entityName}" created successfully!\n`));
    
    // Show next steps
    console.log(chalk.cyan('Next steps:'));
    console.log(chalk.cyan('1. Review the generated files'));
    console.log(chalk.cyan('2. Restart your application to register the new entity'));
    console.log(chalk.cyan(`3. You can now use "${entityName}" in your bulk operations\n`));

  } catch (error) {
    console.error(chalk.red('Error creating entity:'), error);
  }
}