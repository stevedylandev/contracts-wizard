import inquirer from 'inquirer';
import type { Kind, KindedOptions } from '@openzeppelin/wizard';
import { erc20, erc721, erc1155, governor, custom } from '@openzeppelin/wizard';

export async function featureSelection(contractType: Kind): Promise<KindedOptions[Kind]> {
  switch (contractType) {
    case 'ERC20':
      return erc20Features();
    case 'ERC721':
      return erc721Features();
    case 'ERC1155':
      return erc1155Features();
    case 'Governor':
      return governorFeatures();
    case 'Custom':
      return customFeatures();
    default:
      throw new Error(`Unsupported contract type: ${contractType}`);
  }
}

async function erc20Features(): Promise<KindedOptions['ERC20']> {
  const defaults = erc20.defaults;

  const { name, symbol, premint, features } = await inquirer.prompt([
    {
      type: 'input',
      name: 'name',
      message: 'Token name:',
      default: defaults.name,
    },
    {
      type: 'input',
      name: 'symbol',
      message: 'Token symbol:',
      default: defaults.symbol,
    },
    {
      type: 'input',
      name: 'premint',
      message: 'Initial supply (premint):',
      default: '0',
    },
    {
      type: 'checkbox',
      name: 'features',
      message: 'Select features:',
      choices: [
        { name: 'Mintable', value: 'mintable', checked: defaults.mintable },
        { name: 'Burnable', value: 'burnable', checked: defaults.burnable },
        { name: 'Pausable', value: 'pausable', checked: defaults.pausable },
        { name: 'Permit', value: 'permit', checked: defaults.permit },
        { name: 'Votes', value: 'votes', checked: !!defaults.votes },
      ],
    },
  ]);

  const { access, upgradeable } = await inquirer.prompt([
    {
      type: 'list',
      name: 'access',
      message: 'Access control mechanism:',
      choices: [
        { name: 'Ownable', value: 'ownable' },
        { name: 'Roles', value: 'roles' },
        { name: 'None', value: false },
      ],
      default: defaults.access || 'ownable',
    },
    {
      type: 'list',
      name: 'upgradeable',
      message: 'Upgradeability:',
      choices: [
        { name: 'None', value: false },
        { name: 'Transparent', value: 'transparent' },
        { name: 'UUPS', value: 'uups' },
      ],
      default: defaults.upgradeable || false,
    },
  ]);

  // Process votes if selected
  let votesType = undefined;
  if (features.includes('votes')) {
    const { votesSelection } = await inquirer.prompt([
      {
        type: 'list',
        name: 'votesSelection',
        message: 'Votes type:',
        choices: [
          { name: 'Block Number', value: 'blocknumber' },
          { name: 'Timestamp', value: 'timestamp' },
        ],
        default: 'blocknumber',
      },
    ]);
    votesType = votesSelection;
  }

  return {
    kind: 'ERC20',
    name,
    symbol,
    premint: premint || '0',
    mintable: features.includes('mintable'),
    burnable: features.includes('burnable'),
    pausable: features.includes('pausable'),
    permit: features.includes('permit'),
    votes: votesType,
    access,
    upgradeable,
    info: { ...defaults.info },
  };
}

async function erc721Features(): Promise<KindedOptions['ERC721']> {
  const defaults = erc721.defaults;

  const { name, symbol, baseUri, features } = await inquirer.prompt([
    {
      type: 'input',
      name: 'name',
      message: 'Collection name:',
      default: defaults.name,
    },
    {
      type: 'input',
      name: 'symbol',
      message: 'Collection symbol:',
      default: defaults.symbol,
    },
    {
      type: 'input',
      name: 'baseUri',
      message: 'Base URI:',
      default: defaults.baseUri,
    },
    {
      type: 'checkbox',
      name: 'features',
      message: 'Select features:',
      choices: [
        { name: 'Mintable', value: 'mintable', checked: defaults.mintable },
        { name: 'Burnable', value: 'burnable', checked: defaults.burnable },
        { name: 'Pausable', value: 'pausable', checked: defaults.pausable },
        { name: 'Votes', value: 'votes', checked: !!defaults.votes },
        { name: 'URI Storage', value: 'uriStorage', checked: defaults.uriStorage },
        { name: 'Enumerable', value: 'enumerable', checked: defaults.enumerable },
        { name: 'Incremental IDs', value: 'incremental', checked: defaults.incremental },
      ],
    },
  ]);

  const { access, upgradeable } = await inquirer.prompt([
    {
      type: 'list',
      name: 'access',
      message: 'Access control mechanism:',
      choices: [
        { name: 'Ownable', value: 'ownable' },
        { name: 'Roles', value: 'roles' },
        { name: 'None', value: false },
      ],
      default: defaults.access || 'ownable',
    },
    {
      type: 'list',
      name: 'upgradeable',
      message: 'Upgradeability:',
      choices: [
        { name: 'None', value: false },
        { name: 'Transparent', value: 'transparent' },
        { name: 'UUPS', value: 'uups' },
      ],
      default: defaults.upgradeable || false,
    },
  ]);

  // Process votes if selected
  let votesType = undefined;
  if (features.includes('votes')) {
    const { votesSelection } = await inquirer.prompt([
      {
        type: 'list',
        name: 'votesSelection',
        message: 'Votes type:',
        choices: [
          { name: 'Block Number', value: 'blocknumber' },
          { name: 'Timestamp', value: 'timestamp' },
        ],
        default: 'blocknumber',
      },
    ]);
    votesType = votesSelection;
  }

  return {
    kind: 'ERC721',
    name,
    symbol,
    baseUri,
    mintable: features.includes('mintable'),
    burnable: features.includes('burnable'),
    pausable: features.includes('pausable'),
    votes: votesType,
    uriStorage: features.includes('uriStorage'),
    enumerable: features.includes('enumerable'),
    incremental: features.includes('incremental'),
    access,
    upgradeable,
    info: { ...defaults.info },
  };
}

async function erc1155Features(): Promise<KindedOptions['ERC1155']> {
  const defaults = erc1155.defaults;

  const { name, uri, features } = await inquirer.prompt([
    {
      type: 'input',
      name: 'name',
      message: 'Contract name:',
      default: defaults.name,
    },
    {
      type: 'input',
      name: 'uri',
      message: 'URI:',
      default: defaults.uri,
    },
    {
      type: 'checkbox',
      name: 'features',
      message: 'Select features:',
      choices: [
        { name: 'Mintable', value: 'mintable', checked: defaults.mintable },
        { name: 'Burnable', value: 'burnable', checked: defaults.burnable },
        { name: 'Pausable', value: 'pausable', checked: defaults.pausable },
        { name: 'Supply Tracking', value: 'supply', checked: defaults.supply },
        { name: 'Updatable URI', value: 'updatableUri', checked: defaults.updatableUri },
      ],
    },
  ]);

  const { access, upgradeable } = await inquirer.prompt([
    {
      type: 'list',
      name: 'access',
      message: 'Access control mechanism:',
      choices: [
        { name: 'Ownable', value: 'ownable' },
        { name: 'Roles', value: 'roles' },
        { name: 'None', value: false },
      ],
      default: defaults.access || 'ownable',
    },
    {
      type: 'list',
      name: 'upgradeable',
      message: 'Upgradeability:',
      choices: [
        { name: 'None', value: false },
        { name: 'Transparent', value: 'transparent' },
        { name: 'UUPS', value: 'uups' },
      ],
      default: defaults.upgradeable || false,
    },
  ]);

  return {
    kind: 'ERC1155',
    name,
    uri,
    mintable: features.includes('mintable'),
    burnable: features.includes('burnable'),
    pausable: features.includes('pausable'),
    supply: features.includes('supply'),
    updatableUri: features.includes('updatableUri'),
    access,
    upgradeable,
    info: { ...defaults.info },
  };
}

async function governorFeatures(): Promise<KindedOptions['Governor']> {
  const defaults = governor.defaults;

  const { name, features } = await inquirer.prompt([
    {
      type: 'input',
      name: 'name',
      message: 'Governor name:',
      default: defaults.name,
    },
    {
      type: 'checkbox',
      name: 'features',
      message: 'Select features:',
      choices: [{ name: 'Timelock', value: 'timelock', checked: !!defaults.timelock }],
    },
  ]);

  // Process timelock if selected
  let timelockType = undefined;
  if (features.includes('timelock')) {
    const { timelockSelection } = await inquirer.prompt([
      {
        type: 'list',
        name: 'timelockSelection',
        message: 'Timelock type:',
        choices: [
          { name: 'Compound', value: 'compound' },
          { name: 'OpenZeppelin', value: 'openzeppelin' },
        ],
        default: 'openzeppelin',
      },
    ]);
    timelockType = timelockSelection;
  }

  // Get voting settings
  const { delay, period, threshold, quorum } = await inquirer.prompt([
    {
      type: 'input',
      name: 'delay',
      message: 'Voting delay (blocks):',
      default: '1',
    },
    {
      type: 'input',
      name: 'period',
      message: 'Voting period (blocks):',
      default: '45818',
    },
    {
      type: 'input',
      name: 'threshold',
      message: 'Proposal threshold:',
      default: '0',
    },
    {
      type: 'input',
      name: 'quorum',
      message: 'Quorum percentage:',
      default: '4',
    },
  ]);

  return {
    kind: 'Governor',
    name,
    timelock: timelockType,
    votingDelay: delay,
    votingPeriod: period,
    proposalThreshold: threshold,
    quorumNumerator: quorum,
    info: { ...defaults.info },
  };
}

async function customFeatures(): Promise<KindedOptions['Custom']> {
  const defaults = custom.defaults;

  const { name, features } = await inquirer.prompt([
    {
      type: 'input',
      name: 'name',
      message: 'Contract name:',
      default: defaults.name,
    },
    {
      type: 'checkbox',
      name: 'features',
      message: 'Select features:',
      choices: [{ name: 'Pausable', value: 'pausable', checked: defaults.pausable }],
    },
  ]);

  const { access, upgradeable } = await inquirer.prompt([
    {
      type: 'list',
      name: 'access',
      message: 'Access control mechanism:',
      choices: [
        { name: 'Ownable', value: 'ownable' },
        { name: 'Roles', value: 'roles' },
        { name: 'None', value: false },
      ],
      default: defaults.access || 'ownable',
    },
    {
      type: 'list',
      name: 'upgradeable',
      message: 'Upgradeability:',
      choices: [
        { name: 'None', value: false },
        { name: 'Transparent', value: 'transparent' },
        { name: 'UUPS', value: 'uups' },
      ],
      default: defaults.upgradeable || false,
    },
  ]);

  return {
    kind: 'Custom',
    name,
    pausable: features.includes('pausable'),
    access,
    upgradeable,
    info: { ...defaults.info },
  };
}
