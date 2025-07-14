declare module 'inquirer';
declare module 'fs-extra';
declare module 'path';
declare module 'child_process';

// Declare the @openzeppelin/wizard module
declare module '@openzeppelin/wizard' {
  export type Kind =
    | 'ERC20'
    | 'ERC721'
    | 'ERC1155'
    | 'Governor'
    | 'Custom'
    | 'Stablecoin'
    | 'RealWorldAsset'
    | 'Account';

  export function sanitizeKind(kind: string | undefined): Kind;

  export interface CommonOptions {
    name: string;
    access?: 'ownable' | 'roles' | false;
    upgradeable?: 'transparent' | 'uups' | false;
    info?: {
      securityContact?: string;
      license?: string;
    };
  }

  export interface ERC20Options extends CommonOptions {
    symbol: string;
    premint?: string;
    premintChainId?: string;
    mintable?: boolean;
    burnable?: boolean;
    pausable?: boolean;
    permit?: boolean;
    votes?: 'blocknumber' | 'timestamp' | false;
    flashmint?: boolean;
    callback?: boolean;
    crossChainBridging?: 'custom' | 'superchain' | false;
  }

  export interface ERC721Options extends CommonOptions {
    symbol: string;
    baseUri: string;
    enumerable?: boolean;
    uriStorage?: boolean;
    burnable?: boolean;
    pausable?: boolean;
    mintable?: boolean;
    incremental?: boolean;
    votes?: 'blocknumber' | 'timestamp' | false;
  }

  export interface ERC1155Options extends CommonOptions {
    uri: string;
    burnable?: boolean;
    pausable?: boolean;
    mintable?: boolean;
    supply?: boolean;
    updatableUri?: boolean;
  }

  export interface GovernorOptions extends CommonOptions {
    timelock?: 'openzeppelin' | 'compound';
    votingDelay?: string;
    votingPeriod?: string;
    proposalThreshold?: string;
    quorumNumerator?: string;
  }

  export interface CustomOptions extends CommonOptions {
    pausable?: boolean;
  }

  export interface StablecoinOptions extends CommonOptions {
    // Add any specific properties for Stablecoin
    symbol: string;
    premint?: string;
  }

  export interface RealWorldAssetOptions extends CommonOptions {
    // Add any specific properties for RealWorldAsset
    symbol: string;
    premint?: string;
  }

  // export interface AccountOptions extends CommonOptions {
  //   // Add any specific properties for Account
  // }

  export interface KindedOptions {
    ERC20: { kind: 'ERC20' } & ERC20Options;
    ERC721: { kind: 'ERC721' } & ERC721Options;
    ERC1155: { kind: 'ERC1155' } & ERC1155Options;
    Governor: { kind: 'Governor' } & GovernorOptions;
    Custom: { kind: 'Custom' } & CustomOptions;
    Stablecoin: { kind: 'Stablecoin' } & StablecoinOptions;
    RealWorldAsset: { kind: 'RealWorldAsset' } & RealWorldAssetOptions;
    Account: { kind: 'Account' } & AccountOptions;
  }

  export interface Contract {
    name: string;
    license: string;
    constructorArgs: Array<{
      name: string;
      type: string;
    }>;
    upgradeable: boolean;
  }

  export function buildGeneric<K extends Kind>(opts: KindedOptions[K]): Contract;
  export function printContract(contract: Contract): string;

  export const erc20: {
    defaults: Required<ERC20Options>;
    isAccessControlRequired: (opts: Partial<ERC20Options>) => boolean;
  };

  export const erc721: {
    defaults: Required<ERC721Options>;
    isAccessControlRequired: (opts: Partial<ERC721Options>) => boolean;
  };

  export const erc1155: {
    defaults: Required<ERC1155Options>;
    isAccessControlRequired: (opts: Partial<ERC1155Options>) => boolean;
  };

  export const governor: {
    defaults: Required<GovernorOptions>;
    isAccessControlRequired: (opts: Partial<GovernorOptions>) => boolean;
  };

  export const custom: {
    defaults: Required<CustomOptions>;
    isAccessControlRequired: (opts: Partial<CustomOptions>) => boolean;
  };
}
