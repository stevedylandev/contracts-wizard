#!/usr/bin/env node

import { Command } from 'commander';
import { createCommand } from './commands/create';

const program = new Command();

program.name('wizard').description('OpenZeppelin Contracts Wizard CLI').version('0.1.0');

program.addCommand(createCommand);

program.parse(process.argv);
