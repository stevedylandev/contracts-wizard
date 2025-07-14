import inquirer from 'inquirer';

export type Environment = 'hardhat' | 'foundry';

export async function environmentSelection(): Promise<Environment> {
  const { environment } = await inquirer.prompt([
    {
      type: 'list',
      name: 'environment',
      message: 'Select the development environment:',
      choices: [
        { name: 'Hardhat', value: 'hardhat' },
        { name: 'Foundry', value: 'foundry' },
      ],
      default: 'hardhat',
    },
  ]);

  return environment;
}
