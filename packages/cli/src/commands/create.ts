import { Command } from 'commander';
import inquirer from 'inquirer';
import { contractSelection } from '../prompts/contract-selection';
import { featureSelection } from '../prompts/feature-selection';
import { environmentSelection } from '../prompts/environment-selection';
import { generateProject } from '../generators/project-generator';

export const createCommand = new Command('create')
  .description('Create a new smart contract project')
  .action(async () => {
    try {
      // Step 1: Select contract type
      const contractType = await contractSelection();

      // Step 2: Configure contract features
      const features = await featureSelection(contractType);

      // Step 3: Select environment (Hardhat/Foundry)
      const environment = await environmentSelection();

      // Step 4: Generate project
      await generateProject(contractType, features, environment);
    } catch (error) {
      console.error('Error creating project:', error);
      process.exit(1);
    }
  });
