import inquirer from 'inquirer';
import type { Kind } from '@openzeppelin/wizard';
import { sanitizeKind } from '@openzeppelin/wizard';

export async function contractSelection(): Promise<Kind> {
  const { contractType } = await inquirer.prompt([
    {
      type: 'list',
      name: 'contractType',
      message: 'Select the type of contract you want to create:',
      choices: [
        { name: 'ERC20 Token', value: 'ERC20' },
        { name: 'ERC721 NFT', value: 'ERC721' },
        { name: 'ERC1155 Multi-Token', value: 'ERC1155' },
        { name: 'Governor', value: 'Governor' },
        { name: 'Custom', value: 'Custom' },
      ],
    },
  ]);

  return sanitizeKind(contractType);
}
