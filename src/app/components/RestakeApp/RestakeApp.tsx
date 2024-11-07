// src/components/RestakeApp.tsx
import React, { useRef, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AddressLink } from "@/utils/AddressLink/AddressLink";

// import strategyVaultETHImplementationABI from "@/ABI/strategyVaultETHImplementationABI.json";

import toast from "react-hot-toast";

import SwitchArrowsIcon from "@/assets/icons/switchArrows.svg";
import styles from "./RestakeApp.module.scss";
import Bitcoin from "@/assets/bitcoin.svg";

import { BTC_PRICE, RATIO } from "@/app/context/ContextProvider";
import { useBTCWallet } from "@/app/context/wallet/BTCWalletProvider";
import { useWalletConnection } from "@/app/context/wallet/WalletConnectionProvider";
import { useVersions } from "@/app/hooks/api/useVersions";
import { useAppState } from "@/app/state";
import { getFeeRateFromMempool } from "@/utils/getFeeRateFromMempool";
import { getNetworkFees } from "@/utils/mempool_api";

import {
  OVERFLOW_HEIGHT_WARNING_THRESHOLD,
  OVERFLOW_TVL_WARNING_THRESHOLD,
  UTXO_KEY,
} from "@/app/common/constants";

import {
  createStakingTx,
  signStakingTx,
} from "@/utils/delegations/signStakingTx";
import { GlobalParamsVersion } from "@/app/types/globalParams";
import { Psbt } from "bitcoinjs-lib";

interface RestakeAppProps {
  finalityProviderPK: string[];
  contractAddress: string;
}

const CHAIN_ID = 17000;

const RestakeApp: React.FC<RestakeAppProps> = ({
  finalityProviderPK,
  contractAddress,
}) => {
  const searchParams = useSearchParams();

  const { disconnect, open } = useWalletConnection();
  const btcWallet = useBTCWallet();

  const {
    data: mempoolFeeRates,
    isLoading: areMempoolFeeRatesLoading,
    error: mempoolFeeRatesError,
    isError: hasMempoolFeeRatesError,
    refetch: refetchMempoolFeeRates,
  } = useQuery({
    queryKey: ["mempool fee rates"],
    queryFn: getNetworkFees,
    enabled: btcWallet.connected && Boolean(getNetworkFees),
    refetchInterval: 60000, // 1 minute
    // retry: (failureCount) => {
    //   return !isErrorOpen && failureCount <= 3;
    // },
  });

  useEffect(() => {
    console.log("mempoolFeeRates", mempoolFeeRates);
  }, [mempoolFeeRates]);

  const { minFeeRate, defaultFeeRate } = getFeeRateFromMempool(mempoolFeeRates);

  useEffect(() => {
    console.log("minFeeRate", minFeeRate);
    console.log("defaultFeeRate", defaultFeeRate);
  }, [minFeeRate, defaultFeeRate]);

  const {
    availableUTXOs,
    currentHeight: btcHeight,
    currentVersion,
    totalBalance: btcWalletBalanceSat,
    firstActivationHeight,
    isApprochingNextVersion,
    isError,
    isLoading,
  } = useAppState();
  const [isLoadingTx, setIsLoadingTx] = useState<boolean>(false);

  const balanceOfVault = 0; // TODO change

  const balanceToken = 0; // TODO change

  // const [amountBtcOfUser, setAmountBtcOfUser] = useState<number>(0.0007);
  const [timeStakeOfUser, setTimeStakeOfUser] = useState<number>(0);

  const [currentBalance, setCurrentBalance] = useState(0);
  const [stakeAmount, setStakeAmount] = useState<number | undefined>(() => {
    const amount = searchParams.get("amount");
    return amount ? parseFloat(amount) : undefined;
  });
  const [feeRate, setFeeRate] = useState<number | null>(null);
  const [unsignedStakingPsbt, setUnsignedStakingPsbt] = useState<Psbt>();
  const [stakingTerm, setStakingTerm] = useState<number | null>(null);

  const queryClient = useQueryClient();

  // Set the current balance
  useEffect(() => {
    const fetchBalance = async () => {
      const balance = await btcWallet.getBalance();
      console.log("balance", balance);
      setCurrentBalance(balance / 10 ** 8 || 0);
    };

    fetchBalance();
  }, []);

  function handleSwitchArrows() {
    toast.error(<div>It's not possible to withdraw at this time.</div>);
  }

  async function handleRestake() {
    if (!stakeAmount) return;
    const txHash = await handleSign(
      stakeAmount * 10 ** 8,
      timeStakeOfUser,
      "f4940b238dcd00535fde9730345bab6ff4ea6d413cc3602c4033c10f251c7e81"
    );
    toast.success(
      <div className="confirmedTransaction">
        Transaction hash confirmed!
        <a
          href={`https://mempool.space/signet/tx/${txHash}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          View on Mempool
        </a>
      </div>,
      { id: txHash, duration: 10000 }
    );
    return;
  }

  const handleSign = async (
    stakingAmountSat: number,
    stakingTimeBlocks: number,
    finalityProviderPK: string
  ) => {
    try {
      // Prevent the modal from closing
      setIsLoadingTx(true);
      // Initial validation
      if (!btcWallet.connected) throw new Error("Wallet is not connected");
      if (!btcWallet.address) throw new Error("Address is not set");
      if (!btcWallet.network)
        throw new Error("Wallet network is not connected");
      if (!finalityProviderPK)
        throw new Error("Finality provider is not selected");
      if (!currentVersion) throw new Error("Global params not loaded");
      if (!feeRate) throw new Error("Fee rates not loaded");
      if (!availableUTXOs || availableUTXOs.length === 0)
        throw new Error("No available balance");

      // Sign the staking transaction
      const { stakingTxHex, stakingTerm } = await signStakingTx(
        btcWallet.signPsbt,
        btcWallet.pushTx,
        currentVersion,
        stakingAmountSat,
        stakingTimeBlocks,
        finalityProviderPK,
        btcWallet.network,
        btcWallet.address,
        btcWallet.publicKeyNoCoord,
        feeRate,
        availableUTXOs
      );
      // Invalidate UTXOs
      queryClient.invalidateQueries({
        queryKey: [UTXO_KEY, btcWallet.address],
      });
      // UI // TODO, see if it's useless to put them back
      // handleFeedbackModal("success");
      // handleLocalStorageDelegations(stakingTxHex, stakingTerm);
      // handleResetState();
      return stakingTxHex;
    } catch (error: Error | any) {
      toast.error(error.message);
    } finally {
      setIsLoadingTx(false);
    }
  };

  const getTransactionScript = async (
    stakingAmountSat: number,
    stakingTimeBlocks: number,
    finalityProviderPK: string
  ) => {
    console.log("Going to get Fees");
    // const memoizedFeeRate = selectedFeeRate || defaultFeeRate;
    const memoizedFeeRate = defaultFeeRate;

    console.log("currentVersion", currentVersion);
    console.log("btcWallet.network", btcWallet.network);
    console.log("btcWallet.address", btcWallet.address);
    console.log("btcWallet.publicKeyNoCoord", btcWallet.publicKeyNoCoord);
    console.log("memoizedFeeRate", memoizedFeeRate);
    console.log("availableUTXOs", availableUTXOs);
    console.log("--------------------------------");
    console.log("stakingAmountSat", stakingAmountSat);
    console.log("stakingTimeBlocks", stakingTimeBlocks);
    console.log("finalityProviderPK", finalityProviderPK);

    if (
      !currentVersion ||
      !btcWallet.network ||
      !btcWallet.address ||
      !btcWallet.publicKeyNoCoord ||
      !memoizedFeeRate ||
      !availableUTXOs
    ) {
      console.log("Not enough data to get fees");
      return;
    }

    try {
      const { unsignedStakingPsbt, stakingTerm, stakingFeeSat } =
        createStakingTx(
          currentVersion,
          stakingAmountSat,
          stakingTimeBlocks,
          finalityProviderPK,
          btcWallet.network,
          btcWallet.address,
          btcWallet.publicKeyNoCoord,
          memoizedFeeRate,
          availableUTXOs
        );

      console.log("stakingFeeSat", stakingFeeSat);
      console.log("unsignedStakingPsbt", unsignedStakingPsbt);
      console.log("stakingTerm", stakingTerm);
      setFeeRate(stakingFeeSat);
      setUnsignedStakingPsbt(unsignedStakingPsbt);
      setStakingTerm(stakingTerm);

      return stakingFeeSat;
    } catch (error) {
      console.error("Error getting fees", error);
      setFeeRate(null);
      setStakingTerm(null);
      return 0;
    }
  };

  useEffect(() => {
    if (stakeAmount) {
      getTransactionScript(
        stakeAmount * 10 ** 8,
        timeStakeOfUser,
        "2ba550f80f9a63cd0d00d306e96a3f73c09be93169a3ed4e1903e9e5c3867cf0"
      );
    }
  }, [
    currentVersion,
    btcWallet.network,
    btcWallet.address,
    btcWallet.publicKeyNoCoord,
    availableUTXOs,
    stakeAmount,
    timeStakeOfUser,
  ]);

  return (
    <div className={styles.restakeApp}>
      {/* Tokens to restake */}
      <div className={styles.inputContainer}>
        <div className={styles.label}>Restake</div>
        <div className={styles.lineInput}>
          <div className={styles.leftInput}>
            <div className={styles.tokenDiv}>
              <Bitcoin />
              <span className={styles.tokenSymbol}>BTC</span>
            </div>

            <div
              className={styles.balance}
              onClick={() => setStakeAmount(currentBalance)}
            >
              <span>Balance: {currentBalance.toFixed(8)}</span>
            </div>
          </div>
          <div className={styles.rightInput}>
            <input
              type="number"
              value={stakeAmount === null ? "" : stakeAmount}
              onChange={(e) =>
                setStakeAmount(
                  e.target.value === "" ? undefined : Number(e.target.value)
                )
              }
              placeholder="0"
            />

            <div className={styles.price}>
              <span>
                ${stakeAmount ? (stakeAmount * BTC_PRICE).toFixed(2) : 0}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Switch arrows */}
      <div className={styles.switchArrows} onClick={handleSwitchArrows}>
        <SwitchArrowsIcon />
      </div>

      {/* Receive tokens */}
      <div className={styles.inputContainer}>
        <div className={styles.label}>Receive</div>
        <div className={styles.lineInput}>
          <div className={styles.leftInput}>
            <div className={styles.tokenDiv}>
              {/* <div className={styles.waitingImg} /> */}
              <span className={`${styles.tokenSymbol} ${styles.vaultShare}`}>
                BTC deposited
              </span>
            </div>

            <div className={`${styles.balance} ${styles.vaultShareBalance}`}>
              <span>Balance: {(Number(balanceOfVault) / 1e18).toFixed(8)}</span>
            </div>
          </div>
          <div className={styles.rightInput}>
            <div className={styles.resultAmount}>
              <div>
                {stakeAmount
                  ? (stakeAmount * RATIO).toFixed(6).replace(/\.?0+$/, "")
                  : 0}
              </div>
            </div>
            <div className={styles.price}>
              <span>
                ${stakeAmount ? (stakeAmount * BTC_PRICE).toFixed(2) : 0}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Restake button */}
      {btcWallet.connected ? (
        <button className={styles.restakeBtn} onClick={handleRestake}>
          Restake
        </button>
      ) : (
        <button className={styles.restakeBtn} onClick={() => open()}>
          Connect wallet
        </button>
      )}

      {/* Information section */}
      <div className={styles.infoSection}>
        {/* <div className={styles.infoLine}>
          Reward rate: <span className={styles.highlight}>+3.9%</span>
        </div> */}
        <div className={styles.infoLine}>
          Validator activation:{" "}
          <span className={styles.highlight}>~0.4 jours</span>
        </div>
        <div className={styles.infoLine}>
          Service fees: <span>0%</span>
        </div>
        <div className={styles.infoLine}>
          Gas fees:{" "}
          <span>~${((Number(feeRate) / 10 ** 8) * BTC_PRICE).toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};

export default RestakeApp;
