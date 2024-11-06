"use client";
import Image from "next/image";
import styles from "./page.module.scss";
import { Link } from "next-view-transitions";
import { signStakingTx, createStakingTx } from "@/utils/delegation/signStakingTx";
import { useBTCWallet } from "@/app/context/wallet/BTCWalletProvider";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Network } from "@/utils/wallet/btc_wallet_provider";

export default function Home() {

  const btcWallet = useBTCWallet();

  const covenant_pks: string[] = [
    "ffeaec52a9b407b355ef6967a7ffc15fd6c3fe07de2844d61550475e7a5233e5",
    "a5c60c2188e833d39d0fa798ab3f69aa12ed3dd2f3bad659effa252782de3c31",
    "59d3532148a597a2d05c0395bf5f7176044b1cd312f37701a9b4d0aad70bc5a4",
    "57349e985e742d5131e1e2b227b5170f6350ac2e2feb72254fcc25b3cee21a18",
    "c8ccb03c379e452f10c81232b41a1ca8b63d0baf8387e57d302c987e5abb8527"
  ];
  
  const covenantPks: Buffer[] = covenant_pks.map((pk) => Buffer.from(pk, "hex"));
  const covenantThreshold: number = 3;
  const minUnbondingTime: number = 101;
  const magicBytes: Buffer = Buffer.from("62627434", "hex"); // "bbt4" tag
  // Optional field. Value coming from current global param activationHeight
  const lockHeight: number = 0;
  
  // 2. Define the user selected parameters of the staking contract:
  //    - `stakerPk: Buffer`: The public key without the coordinate of the
  //       staker.
  //    - `finalityProviders: Buffer[]`: A list of public keys without the
  //       coordinate corresponding to the finality providers. Currently,
  //       a delegation to only a single finality provider is allowed,
  //       so the list should contain only a single item.
  //    - `stakingDuration: number`: The staking period in BTC blocks.
  //    - `stakingAmount: number`: The amount to be staked in satoshis.
  //    - `unbondingTime: number`: The unbonding time. Should be `>=` the
  //      `minUnbondingTime`.
  
  const finalityProvider = {
      btc_pk_hex: "c333bf065809ed12b162dc3c849f8cf65219125fdfde98770c2b285f04ff9960"
  };
  const finalityProviders: Buffer[] = [
    Buffer.from(finalityProvider.btc_pk_hex, "hex"),
  ];
  
  const [stakerPk, setStakerPk] = useState<string>();
  const [address, setAddress] = useState<string>();
  const [network, setNetwork] = useState<Network>();
  const [btcHeight, setBtcHeight] = useState<number>();
  const [isWalletLoading, setIsWalletLoading] = useState(false);

  useEffect(() => {
    const fetchWalletData = async () => {
      if (!btcWallet) return;
      
      setIsWalletLoading(true);
      try {
        const stakerPk = await btcWallet.getPublicKeyHex();
        const address = await btcWallet.getAddress();
        const network = await btcWallet.getNetwork();
        const btcHeight = await btcWallet.getBTCTipHeight();
        
        setStakerPk(stakerPk);
        setAddress(address);
        setNetwork(network);
        setBtcHeight(btcHeight);
      } catch (error) {
        console.error("Error fetching wallet data:", error);
      } finally {
        setIsWalletLoading(false);
      }
    };

    fetchWalletData();
  }, [btcWallet]);

  console.log("stakerPk:", stakerPk);
  console.log("address:", address);
  console.log("network:", network);
  console.log("btcHeight:", btcHeight);

  const stakingDuration: number = 144;
  const stakingAmount: number = 1000;
  const unbondingTime: number = minUnbondingTime;
  
  // 3. Define the parameters for the staking transaction that will contain the
  //    staking contract:
  //    - `inputUTXOs: UTXO[]`: The list of UTXOs that will be used as an input
  //       to fund the staking transaction.
  //    - `feeRate: number`: The fee per tx byte in satoshis.
  //    - `changeAddress: string`: BTC wallet change address, Taproot or Native
  //       Segwit.
  //    - `network: network to work with, either networks.testnet
  //       for BTC Testnet and BTC Signet, or networks.bitcoin for BTC Mainnet.
  
  // Each object in the inputUTXOs array represents a single UTXO with the following properties:
  // - txid: transaction ID, string
  // - vout: output index, number
  // - value: value of the UTXO, in satoshis, number
  // - scriptPubKey: script which provides the conditions that must be fulfilled for this UTXO to be spent, string
  const inputUTXOs = [
    {
      txid: "e472d65b0c9c1bac9ffe53708007e57ab830f1bf09af4bfbd17e780b641258fc",
      vout: 2,
      value: 9265692,
      scriptPubKey: "0014505049839bc32f869590adc5650c584e17c917fc",
    },
  ];

  // Fetch all UTXOs
  const {
    data: availableUTXOs,
    error: availableUTXOsError,
    isError: hasAvailableUTXOsError,
    refetch: refetchAvailableUTXOs,
  } = useQuery({
    queryKey: ["UTXOs", address],
    queryFn: async () => {
      if (btcWallet?.getUtxos && address) {
        // all confirmed UTXOs from the wallet
        const mempoolUTXOs = await btcWallet.getUtxos(address);
        return mempoolUTXOs;
      }
    },
    enabled: true,
    refetchInterval: 5000, // 5 seconds
  });

  console.log("availableUTXOOOOOOOOOOOOOOOOOOOs:", availableUTXOs);

  // const { unsignedStakingPsbt, stakingTerm, stakingFeeSat } = createStakingTx(
  //   globalParamsVersion,
  //   stakingAmount,
  //   stakingDuration,
  //   finalityProviderPublicKey,
  //   network,
  //   changeAddress,
  //   stakerPk,
  //   feeRate,
  //   inputUTXOs,
  // );

  const feeRate: number = 18;


  
  
  
  // const stakingScriptData = new StakingScriptData(
  //   stakerPk,
  //   finalityProviders,
  //   covenantPks,
  //   covenantThreshold,
  //   stakingDuration,
  //   minUnbondingTime,
  //   magicBytes,
  // );
  
  // const {
  //   timelockScript,
  //   unbondingScript,
  //   slashingScript,
  //   dataEmbedScript,
  //   unbondingTimelockScript,
  // } = stakingScriptData.buildScripts();
  
  
  // // stakingTransaction constructs an unsigned BTC Staking transaction
  // const unsignedStakingPsbt: {psbt: Psbt, fee: number} = stakingTransaction(
  //   {
  //     timelockScript,
  //     unbondingScript,
  //     slashingScript,
  //     dataEmbedScript
  //   },
  //   stakingAmount,
  //   "tb1p7pplvcsr70akm3jvlhdnmfzwh0zuae55ng6wgpyaxg9qtfelzh0qsayvr2",
  //   inputUTXOs,
  //   networks.testnet,
  //   feeRate,
  //   btcWallet.isTaproot ? btcWallet.publicKeyNoCoord() : undefined,
  //   lockHeight,
  // );
  
  // const signedStakingPsbt = await btcWallet.signPsbt(unsignedStakingPsbt.psbt.toHex());
  // const stakingTx = Psbt.fromHex(signedStakingPsbt).extractTransaction();

  return (
    <div className={styles.page}>
      <h1>Your project start here!</h1>
      Don't forget to:
      <ul>
        <li>
          Add the metadata with name, description, keywords, etc. in .layout.tsx
        </li>
        <li>Add the metadata with name, description, url in the reown.tsx</li>
        <li>Change the logo for the header in the assets/ folder</li>
        <li> Change the logo for the icon in the public/ folder</li>
        <li>Define your colors in the globals.css file</li>
        <li>Add the pages in the app/ folder</li>
        <li>Add the components in the components/ folder</li>
        <li>Add the API routes in the src/api/ folder</li>
        <Link href="/second" className={styles.link}>
          Go to second page
        </Link>
      </ul>
    </div>
  );
}
