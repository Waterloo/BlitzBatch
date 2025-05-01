import chalk from 'chalk';
import fs from 'fs/promises';
import path from 'path';

export async function listEntities() {
  console.log(chalk.blue.bold('\n📋 Registered Entities\n'));
  
  try {
    const schemaDir = path.join(process.cwd(), 'src', 'transformers', 'schema');
    const files = await fs.readdir(schemaDir);
    
    const entities = files
      .filter(file => file.endsWith('Schema.ts'))
      .map(file => file.replace('Schema.ts', ''));
    
    if (entities.length === 0) {
      console.log(chalk.yellow('No entities found.'));
    } else {
      entities.forEach((entity, index) => {
        console.log(chalk.green(`${index + 1}. ${entity}`));
      });
    }
    
    console.log('\n');
  } catch (error) {
    console.error(chalk.red('Error listing entities:'), error);
  }
}