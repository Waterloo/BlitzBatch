#!/usr/bin/env node
import { Command } from 'commander';
import { createEntity } from './commands/createEntity.js';
import { listEntities } from './commands/listEntities.js';

const program = new Command();

program
  .name('blitzbatch-cli')
  .description('BlitzBatch CLI for managing entities and operations')
  .version('1.0.0');

// Entity command with subcommands
const entityCommand = program
  .command('entity')
  .description('Manage entities');

entityCommand
  .command('create')
  .description('Create a new entity')
  .action(createEntity);

entityCommand
  .command('list')
  .description('List all entities')
  .action(listEntities);

program.parse();