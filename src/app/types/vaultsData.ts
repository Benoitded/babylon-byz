// src/app/types/vaultsData.ts

export type Protocol = "Babylon" | "Symbiotic";

export interface PoSChain {
  address: string; // Actually public key
  name: string;
  description?: string;
  apy: number;
  commission: number;
  total_stake: number;
  image_url?: string; // image url or blockies with the address
  protocol: Protocol;
}

export type VaultsRaw = {
  address: string; // btc address of the vault
  name: string;
  description?: string;
  total_stake: number;
  apy: number;
  restaking_protocol: Protocol[];
  pos_chains: string[]; //with only the addresses
  avs_symbiotic: string[]; //with only the addresses
  timestamp: number;
  hash: string;
};

export type VaultToDisplay = {
  address: string; // btc address of the vault
  name: string;
  description?: string;
  total_stake: number;
  apy: number;
  avg_commission: number;
  restaking_protocol: Protocol[];
  pos_chains: PoSChain[];
  avs_symbiotic: PoSChain[];
  timestamp: number;
  hash: string;
};

export interface FinalityProviderFromAPI {
  description: {
    moniker: string;
    identity: string;
    website: string;
    security_contact: string;
    details: string;
  };
  commission: string;
  addr: string;
  btc_pk: string;
  pop: {
    btc_sig_type: string;
    btc_sig: string;
  };
  slashed_babylon_height: string;
  slashed_btc_height: string;
  height: string;
  voting_power: string;
  jailed: boolean;
}

export interface ConsumerChainFromAPI {
  description: {
    moniker: string;
    identity: string;
    website: string;
    security_contact: string;
    details: string;
  };
  commission: string;
  btc_pk: string;
  active_tvl: number;
  total_tvl: number;
  active_delegations: number;
  total_delegations: number;
}
