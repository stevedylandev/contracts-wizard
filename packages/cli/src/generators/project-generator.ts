import fs from 'fs-extra';
import path from 'path';
import type { Kind, KindedOptions, Contract } from '@openzeppelin/wizard';
import { buildGeneric, printContract } from '@openzeppelin/wizard';
import type { Environment } from '../prompts/environment-selection';

export async function generateProject(
  contractType: Kind,
  features: KindedOptions[Kind],
  environment: Environment,
): Promise<void> {
  console.log(`Generating ${contractType} project with ${environment}...`);

  try {
    // Build the contract
    const contract = buildGeneric(features);

    // Create project directory
    const projectDir = path.join(process.cwd(), contract.name);

    if (fs.existsSync(projectDir)) {
      throw new Error(`Directory ${projectDir} already exists. Please choose a different name.`);
    }

    fs.mkdirSync(projectDir, { recursive: true });

    // Generate project based on environment
    if (environment === 'hardhat') {
      await generateHardhatProject(projectDir, contract, features);
    } else {
      await generateFoundryProject(projectDir, contract, features);
    }

    console.log(`\nProject created successfully at ${projectDir}`);
    console.log(`\nTo get started:`);
    console.log(`  cd ${contract.name}`);
    console.log(`  npm install`);

    if (environment === 'hardhat') {
      console.log(`  npx hardhat test`);
    } else {
      console.log(`  bash setup.sh`);
      console.log(`  forge test`);
    }
  } catch (error) {
    console.error('Error generating project:', error);
    throw error;
  }
}

async function generateHardhatProject(
  projectDir: string,
  contract: Contract,
  opts: KindedOptions[Kind],
): Promise<void> {
  // Create directory structure
  fs.mkdirSync(path.join(projectDir, 'contracts'), { recursive: true });
  fs.mkdirSync(path.join(projectDir, 'test'), { recursive: true });

  if (contract.upgradeable) {
    fs.mkdirSync(path.join(projectDir, 'scripts'), { recursive: true });
  } else {
    fs.mkdirSync(path.join(projectDir, 'ignition/modules'), {
      recursive: true,
    });
  }

  // Write contract file
  const contractCode = printContract(contract);
  fs.writeFileSync(path.join(projectDir, `contracts/${contract.name}.sol`), contractCode);

  // Generate hardhat.config.ts
  const hardhatConfig = generateHardhatConfig(contract.upgradeable);
  fs.writeFileSync(path.join(projectDir, 'hardhat.config.ts'), hardhatConfig);

  // Generate package.json
  const packageJson = generatePackageJson(contract);
  fs.writeFileSync(path.join(projectDir, 'package.json'), JSON.stringify(packageJson, null, 2));

  // Generate tsconfig.json
  const tsConfig = generateTsConfig();
  fs.writeFileSync(path.join(projectDir, 'tsconfig.json'), tsConfig);

  // Generate test file
  const testFile = generateHardhatTest(contract, opts);
  fs.writeFileSync(path.join(projectDir, 'test/test.ts'), testFile);

  // Generate deployment file
  if (contract.upgradeable) {
    const deployScript = generateHardhatDeployScript(contract);
    fs.writeFileSync(path.join(projectDir, 'scripts/deploy.ts'), deployScript);
  } else {
    const ignitionModule = generateHardhatIgnitionModule(contract);
    fs.writeFileSync(path.join(projectDir, `ignition/modules/${contract.name}.ts`), ignitionModule);
  }

  // Generate README.md
  const readme = generateHardhatReadme(contract);
  fs.writeFileSync(path.join(projectDir, 'README.md'), readme);

  // Generate .gitignore
  const gitignore = generateGitignore();
  fs.writeFileSync(path.join(projectDir, '.gitignore'), gitignore);
}

async function generateFoundryProject(
  projectDir: string,
  contract: Contract,
  opts: KindedOptions[Kind],
): Promise<void> {
  // Create directory structure
  fs.mkdirSync(path.join(projectDir, 'src'), { recursive: true });
  fs.mkdirSync(path.join(projectDir, 'test'), { recursive: true });
  fs.mkdirSync(path.join(projectDir, 'script'), { recursive: true });

  // Write contract file
  const contractCode = printContract(contract);
  fs.writeFileSync(path.join(projectDir, `src/${contract.name}.sol`), contractCode);

  // Generate test file
  const testFile = generateFoundryTest(contract, opts);
  fs.writeFileSync(path.join(projectDir, `test/${contract.name}.t.sol`), testFile);

  // Generate script file
  const scriptFile = generateFoundryScript(contract, opts);
  fs.writeFileSync(path.join(projectDir, `script/${contract.name}.s.sol`), scriptFile);

  // Generate setup.sh
  const setupSh = generateFoundrySetupSh(contract);
  fs.writeFileSync(path.join(projectDir, 'setup.sh'), setupSh);
  fs.chmodSync(path.join(projectDir, 'setup.sh'), '755');

  // Generate README.md
  const readme = generateFoundryReadme(contract);
  fs.writeFileSync(path.join(projectDir, 'README.md'), readme);
}

// Helper functions to generate file contents
function generateHardhatConfig(upgradeable: boolean): string {
  return `import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
${upgradeable ? `import "@openzeppelin/hardhat-upgrades";` : ''}

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
      },
    },
  },
};

export default config;
`;
}

function generateTsConfig(): string {
  return `{
  "compilerOptions": {
    "target": "es2020",
    "module": "commonjs",
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "skipLibCheck": true,
    "resolveJsonModule": true
  }
}
`;
}

function generateGitignore(): string {
  return `node_modules
.env
coverage
coverage.json
typechain
typechain-types

# Hardhat files
cache
artifacts
`;
}

function generatePackageJson(contract: Contract) {
  const dependencies: Record<string, string> = {
    '@openzeppelin/contracts': '^5.0.0',
  };

  if (contract.upgradeable) {
    dependencies['@openzeppelin/contracts-upgradeable'] = '^5.0.0';
    dependencies['@openzeppelin/hardhat-upgrades'] = '^2.3.3';
  }

  return {
    name: contract.name.toLowerCase(),
    version: '1.0.0',
    description: `Smart contract for ${contract.name}`,
    main: 'index.js',
    scripts: {
      test: 'hardhat test',
    },
    keywords: [],
    author: '',
    license: contract.license,
    devDependencies: {
      '@nomicfoundation/hardhat-toolbox': '^4.0.0',
      hardhat: '^2.19.1',
    },
    dependencies,
  };
}

function generateHardhatTest(contract: Contract, opts: KindedOptions[Kind]): string {
  const addressArgs = getAddressArgs(contract);

  let expectsCode = '';

  // Safe way to check for properties
  if (opts && typeof opts === 'object') {
    if ('name' in opts && typeof opts.name === 'string') {
      expectsCode = `    expect(await instance.name()).to.equal("${opts.name}");`;
    } else if ('uri' in opts && typeof opts.uri === 'string' && opts.kind === 'ERC1155') {
      expectsCode = `    expect(await instance.uri(0)).to.equal("${opts.uri}");`;
    }
  }

  const deploymentCall = contract.upgradeable
    ? `upgrades.deployProxy(ContractFactory, [${addressArgs.join(', ')}])`
    : `ContractFactory.deploy(${addressArgs.join(', ')})`;

  return `import { expect } from "chai";
import { ethers${contract.upgradeable ? ', upgrades' : ''} } from "hardhat";

describe("${contract.name}", function () {
  it("Test contract", async function () {
    const ContractFactory = await ethers.getContractFactory("${contract.name}");
    ${addressArgs.map((arg, i) => `const ${arg} = (await ethers.getSigners())[${i}].address;`).join('\n    ')}

    const instance = await ${deploymentCall};
    await instance.waitForDeployment();

    ${expectsCode}
  });
});
`;
}

function generateHardhatDeployScript(contract: Contract): string {
  const addressArgs = getAddressArgs(contract);

  const deploymentCall = contract.upgradeable
    ? `upgrades.deployProxy(ContractFactory, [${addressArgs.join(', ')}])`
    : `ContractFactory.deploy(${addressArgs.join(', ')})`;

  return `import { ethers${contract.upgradeable ? ', upgrades' : ''} } from "hardhat";

async function main() {
  const ContractFactory = await ethers.getContractFactory("${contract.name}");

  ${addressArgs.length > 0 ? '// TODO: Set addresses for the contract arguments below' : ''}
  const instance = await ${deploymentCall};
  await instance.waitForDeployment();

  console.log(\`${contract.upgradeable ? 'Proxy' : 'Contract'} deployed to \${await instance.getAddress()}\`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
`;
}

function generateHardhatIgnitionModule(contract: Contract): string {
  const deployArguments = getAddressArgs(contract);
  const contractVariableName = contract.name.charAt(0).toLowerCase() + contract.name.slice(1);

  return `import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("${contract.name}Module", (m) => {

  ${deployArguments.length > 0 ? '// TODO: Set addresses for the contract arguments below' : ''}
  const ${contractVariableName} = m.contract("${contract.name}", [${deployArguments.join(', ')}]);

  return { ${contractVariableName} };
});
`;
}

function generateHardhatReadme(contract: Contract): string {
  return `# ${contract.name} Project

This project demonstrates a basic Hardhat use case. It comes with a contract generated by OpenZeppelin Wizard, a test for that contract, ${contract.upgradeable ? 'and a script that deploys that contract' : 'and a Hardhat Ignition module that deploys that contract'}.

## Installing dependencies

\`\`\`
npm install
\`\`\`

## Testing the contract

\`\`\`
npm test
\`\`\`

## Deploying the contract

You can target any network from your Hardhat config using:

\`\`\`
${contract.upgradeable ? 'npx hardhat run --network <network-name> scripts/deploy.ts' : `npx hardhat ignition deploy ignition/modules/${contract.name}.ts --network <network-name>`}
\`\`\`
`;
}

function generateFoundryTest(contract: Contract, opts: KindedOptions[Kind]): string {
  const addressArgs = getAddressArgs(contract);

  let testFunctionCode = '';

  // Safe way to check for properties
  if (opts && typeof opts === 'object') {
    if ('name' in opts && typeof opts.name === 'string') {
      testFunctionCode = `
    function testName() public view {
        assertEq(instance.name(), "${opts.name}");
    }`;
    } else if ('uri' in opts && typeof opts.uri === 'string' && opts.kind === 'ERC1155') {
      testFunctionCode = `
    function testUri() public view {
        assertEq(instance.uri(0), "${opts.uri}");
    }`;
    } else {
      testFunctionCode = `
    function testSomething() public {
        // Add your test here
    }`;
    }
  } else {
    testFunctionCode = `
    function testSomething() public {
        // Add your test here
    }`;
  }

  let deploymentCode = '';
  if (contract.upgradeable) {
    if (opts && typeof opts === 'object' && 'upgradeable' in opts && opts.upgradeable === 'transparent') {
      deploymentCode = `
        address proxy = Upgrades.deployTransparentProxy(
            "${contract.name}.sol",
            initialOwner,
            abi.encodeCall(${contract.name}.initialize, (${addressArgs.join(', ')}))
        );
        instance = ${contract.name}(proxy);`;
    } else {
      deploymentCode = `
        address proxy = Upgrades.deployUUPSProxy(
            "${contract.name}.sol",
            abi.encodeCall(${contract.name}.initialize, (${addressArgs.join(', ')}))
        );
        instance = ${contract.name}(proxy);`;
    }
  } else {
    deploymentCode = `
        instance = new ${contract.name}(${addressArgs.join(', ')});`;
  }

  let addressVarsCode = '';
  let i = 1; // private key index starts from 1 since it must be non-zero
  if (
    contract.upgradeable &&
    opts &&
    typeof opts === 'object' &&
    'upgradeable' in opts &&
    opts.upgradeable === 'transparent' &&
    !addressArgs.includes('initialOwner')
  ) {
    addressVarsCode += `
        address initialOwner = vm.addr(${i++});`;
  }
  for (const arg of addressArgs) {
    addressVarsCode += `
        address ${arg} = vm.addr(${i++});`;
  }

  return `// SPDX-License-Identifier: ${contract.license}
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
${contract.upgradeable ? 'import {Upgrades} from "openzeppelin-foundry-upgrades/Upgrades.sol";' : ''}
import {${contract.name}} from "src/${contract.name}.sol";

contract ${contract.name}Test is Test {
    ${contract.name} public instance;

    function setUp() public {${addressVarsCode}${deploymentCode}
    }${testFunctionCode}
}
`;
}

function generateFoundryScript(contract: Contract, opts: KindedOptions[Kind]): string {
  const addressArgs = getAddressArgs(contract);

  let deploymentCode = '';
  if (contract.upgradeable) {
    if (opts && typeof opts === 'object' && 'upgradeable' in opts && opts.upgradeable === 'transparent') {
      deploymentCode = `
        address proxy = Upgrades.deployTransparentProxy(
            "${contract.name}.sol",
            initialOwner,
            abi.encodeCall(${contract.name}.initialize, (${addressArgs.join(', ')}))
        );
        ${contract.name} instance = ${contract.name}(proxy);`;
    } else {
      deploymentCode = `
        address proxy = Upgrades.deployUUPSProxy(
            "${contract.name}.sol",
            abi.encodeCall(${contract.name}.initialize, (${addressArgs.join(', ')}))
        );
        ${contract.name} instance = ${contract.name}(proxy);`;
    }
  } else {
    deploymentCode = `
        ${contract.name} instance = new ${contract.name}(${addressArgs.join(', ')});`;
  }

  let addressVarsCode = '';
  if (
    contract.upgradeable &&
    opts &&
    typeof opts === 'object' &&
    'upgradeable' in opts &&
    opts.upgradeable === 'transparent' &&
    !addressArgs.includes('initialOwner')
  ) {
    addressVarsCode += `
        address initialOwner = <Set initialOwner address here>;`;
  }
  for (const arg of addressArgs) {
    addressVarsCode += `
        address ${arg} = <Set ${arg} address here>;`;
  }

  let deploymentLines = `
        vm.startBroadcast();${addressVarsCode}${deploymentCode}
        console.log("${contract.upgradeable ? 'Proxy' : 'Contract'} deployed to %s", address(instance));
        vm.stopBroadcast();`;

  if (addressArgs.length > 0) {
    deploymentLines = `
        // TODO: Set addresses for the variables below, then uncomment the following section:
        /*${deploymentLines}
        */`;
  }

  return `// SPDX-License-Identifier: ${contract.license}
pragma solidity ^0.8.20;

import {Script} from "forge-std/Script.sol";
import {console} from "forge-std/console.sol";
${contract.upgradeable ? 'import {Upgrades} from "openzeppelin-foundry-upgrades/Upgrades.sol";' : ''}
import {${contract.name}} from "src/${contract.name}.sol";

contract ${contract.name}Script is Script {
    function setUp() public {}

    function run() public {${deploymentLines}
    }
}
`;
}

function generateFoundrySetupSh(contract: Contract): string {
  return `#!/usr/bin/env bash

# Check if git is installed
if ! which git &> /dev/null
then
  echo "git command not found. Install git and try again."
  exit 1
fi

# Check if Foundry is installed
if ! which forge &> /dev/null
then
  echo "forge command not found. Install Foundry and try again. See https://book.getfoundry.sh/getting-started/installation"
  exit 1
fi

# Setup Foundry project
if ! [ -f "foundry.toml" ]
then
  echo "Initializing Foundry project..."

  # Backup Wizard template readme to avoid it being overwritten
  mv README.md README-oz.md

  # Initialize sample Foundry project
  forge init --force --quiet

${
  contract.upgradeable
    ? `
  # Install OpenZeppelin Contracts and Upgrades
  forge install OpenZeppelin/openzeppelin-contracts-upgradeable@v5.0.0 --quiet
  forge install OpenZeppelin/openzeppelin-foundry-upgrades --quiet
`
    : `
  # Install OpenZeppelin Contracts
  forge install OpenZeppelin/openzeppelin-contracts@v5.0.0 --quiet
`
}

  # Remove unneeded Foundry template files
  rm src/Counter.sol
  rm script/Counter.s.sol
  rm test/Counter.t.sol
  rm README.md

  # Restore Wizard template readme
  mv README-oz.md README.md

  # Add remappings
  if [ -f "remappings.txt" ]
  then
    echo "" >> remappings.txt
  fi
${
  contract.upgradeable
    ? `
  echo "@openzeppelin/contracts/=lib/openzeppelin-contracts-upgradeable/lib/openzeppelin-contracts/contracts/" >> remappings.txt
  echo "@openzeppelin/contracts-upgradeable/=lib/openzeppelin-contracts-upgradeable/contracts/" >> remappings.txt

  # Add settings in foundry.toml
  echo "" >> foundry.toml
  echo "ffi = true" >> foundry.toml
  echo "ast = true" >> foundry.toml
  echo "build_info = true" >> foundry.toml
  echo "extra_output = [\\"storageLayout\\"]" >> foundry.toml
`
    : `
  echo "@openzeppelin/contracts/=lib/openzeppelin-contracts/contracts/" >> remappings.txt
`
}

  # Perform initial git commit
  git add .
  git commit -m "openzeppelin: add wizard output" --quiet

  echo "Done."
else
  echo "Foundry project already initialized."
fi
`;
}

function generateFoundryReadme(contract: Contract): string {
  return `# ${contract.name} Project

This project demonstrates a basic Foundry use case. It comes with a contract generated by OpenZeppelin Wizard, a test for that contract, and a script that deploys that contract.

## Installing Foundry

See [Foundry installation guide](https://book.getfoundry.sh/getting-started/installation).

## Initializing the project

\`\`\`
bash setup.sh
\`\`\`

## Testing the contract

\`\`\`
forge test${contract.upgradeable ? ' --force' : ''}
\`\`\`

## Deploying the contract

You can simulate a deployment by running the script:

\`\`\`
forge script script/${contract.name}.s.sol${contract.upgradeable ? ' --force' : ''}
\`\`\`

See [Solidity scripting guide](https://book.getfoundry.sh/guides/scripting-with-solidity) for more information.
`;
}

function getAddressArgs(contract: Contract): string[] {
  const args = [];
  for (const constructorArg of contract.constructorArgs) {
    if (constructorArg.type === 'address') {
      args.push(constructorArg.name);
    }
  }
  return args;
}
