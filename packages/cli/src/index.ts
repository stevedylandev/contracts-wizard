#!/usr/bin/env node

import { Command } from 'commander';
import { createCommand } from './commands/create';
import gradient from 'gradient-string';

// Display welcome banner
const displayBanner = () => {

  const blueGradient = gradient(['#4F56FA', '#2D99FF', '#08C2FF']);

  console.log(
    blueGradient(`
  ██╗    ██╗██╗███████╗ █████╗ ██████╗ ██████╗
  ██║    ██║██║╚══███╔╝██╔══██╗██╔══██╗██╔══██╗
  ██║ █╗ ██║██║  ███╔╝ ███████║██████╔╝██║  ██║
  ██║███╗██║██║ ███╔╝  ██╔══██║██╔══██╗██║  ██║
  ╚███╔███╔╝██║███████╗██║  ██║██║  ██║██████╔╝
   ╚══╝╚══╝ ╚═╝╚══════╝╚═╝  ╚═╝╚═╝  ╚═╝╚═════╝
  `),
  );
  console.log('  Welcome to the OpenZeppelin Contracts Wizard CLI!');
  console.log('  Create secure smart contracts with ease.\n');
};

const program = new Command();

program.name('wizard').description('OpenZeppelin Contracts Wizard CLI').version('0.0.1');

program.addCommand(createCommand);

// If no command is provided, run the create command by default
if (process.argv.length <= 2) {
  displayBanner();
  createCommand.parseAsync(process.argv);
} else {
  program.parse(process.argv);
}
