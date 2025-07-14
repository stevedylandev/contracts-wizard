#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { createCommand } from './commands/create';

// Display welcome banner
const displayBanner = () => {
  console.log(
    chalk.bold.blue(`
  ██████╗ ██████╗ ███████╗███╗   ██╗███████╗███████╗██████╗ ██████╗ ███████╗██╗     ██╗███╗   ██╗
  ██╔═══██╗██╔══██╗██╔════╝████╗  ██║╚══███╔╝██╔════╝██╔══██╗██╔══██╗██╔════╝██║     ██║████╗  ██║
  ██║   ██║██████╔╝█████╗  ██╔██╗ ██║  ███╔╝ █████╗  ██████╔╝██████╔╝█████╗  ██║     ██║██╔██╗ ██║
  ██║   ██║██╔═══╝ ██╔══╝  ██║╚██╗██║ ███╔╝  ██╔══╝  ██╔═══╝ ██╔═══╝ ██╔══╝  ██║     ██║██║╚██╗██║
  ╚██████╔╝██║     ███████╗██║ ╚████║███████╗███████╗██║     ██║     ███████╗███████╗██║██║ ╚████║
   ╚═════╝ ╚═╝     ╚══════╝╚═╝  ╚═══╝╚══════╝╚══════╝╚═╝     ╚═╝     ╚══════╝╚══════╝╚═╝╚═╝  ╚═══╝

   ██████╗ ██████╗ ███╗   ██╗████████╗██████╗  █████╗  ██████╗████████╗███████╗
  ██╔════╝██╔═══██╗████╗  ██║╚══██╔══╝██╔══██╗██╔══██╗██╔════╝╚══██╔══╝██╔════╝
  ██║     ██║   ██║██╔██╗ ██║   ██║   ██████╔╝███████║██║        ██║   ███████╗
  ██║     ██║   ██║██║╚██╗██║   ██║   ██╔══██╗██╔══██║██║        ██║   ╚════██║
  ╚██████╗╚██████╔╝██║ ╚████║   ██║   ██║  ██║██║  ██║╚██████╗   ██║   ███████║
   ╚═════╝ ╚═════╝ ╚═╝  ╚═══╝   ╚═╝   ╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝   ╚═╝   ╚══════╝

  ██╗    ██╗██╗███████╗ █████╗ ██████╗ ██████╗
  ██║    ██║██║╚══███╔╝██╔══██╗██╔══██╗██╔══██╗
  ██║ █╗ ██║██║  ███╔╝ ███████║██████╔╝██║  ██║
  ██║███╗██║██║ ███╔╝  ██╔══██║██╔══██╗██║  ██║
  ╚███╔███╔╝██║███████╗██║  ██║██║  ██║██████╔╝
   ╚══╝╚══╝ ╚═╝╚══════╝╚═╝  ╚═╝╚═╝  ╚═╝╚═════╝
  `),
  );
  console.log(chalk.yellow('  Welcome to the OpenZeppelin Contracts Wizard CLI!'));
  console.log(chalk.yellow('  Create secure smart contracts with ease.\n'));
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
