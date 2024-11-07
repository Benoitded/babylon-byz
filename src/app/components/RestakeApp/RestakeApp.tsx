// src/components/RestakeApp.tsx
import React, { useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import styles from "./RestakeApp.module.scss";
import SwitchArrowsIcon from "@/assets/icons/switchArrows.svg";
import Bitcoin from "@/assets/bitcoin.svg";

import { BTC_PRICE, RATIO } from "@/app/context/ContextProvider";
import { useBTCWallet } from "@/app/context/wallet/BTCWalletProvider";
import { useWalletConnection } from "@/app/context/wallet/WalletConnectionProvider";
import { useVersions } from "@/app/hooks/api/useVersions";
import { useAppState } from "@/app/state";

import { getFeeRateFromMempool } from "@/utils/getFeeRateFromMempool";
import { getNetworkFees } from "@/utils/mempool_api";
import { AddressLink } from "@/utils/AddressLink/AddressLink";
import {
  createStakingTx,
  signStakingTx,
} from "@/utils/delegations/signStakingTx";

import {
  OVERFLOW_HEIGHT_WARNING_THRESHOLD,
  OVERFLOW_TVL_WARNING_THRESHOLD,
  UTXO_KEY,
} from "@/app/common/constants";

import { GlobalParamsVersion } from "@/app/types/globalParams";
import { Psbt } from "bitcoinjs-lib";

// import strategyVaultETHImplementationABI from "@/ABI/strategyVaultETHImplementationABI.json";

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

  // const [amountBtcOfUser, setAmountBtcOfUser] = useState<number>(0.0007);
  const [numberDaysOfUser, setNumberDaysOfUser] = useState<number>(60);
  const [timeStakeOfUser, setTimeStakeOfUser] = useState<number>(0);

  useEffect(() => {
    //You can convert the number of days to blocks, knowing that 1 block = 10 minutes
    setTimeStakeOfUser(numberDaysOfUser * 24 * 6);
  }, [numberDaysOfUser]);

  const [currentBalance, setCurrentBalance] = useState(0);
  const [stakeAmount, setStakeAmount] = useState<number | undefined>(() => {
    const amount = searchParams.get("amount");
    return amount ? parseFloat(amount) : undefined;
  });
  const [feeRate, setFeeRate] = useState<number | null>(null);

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
    console.log("Switch arrows");
    toast.error(<div>It's not possible to withdraw at this time.</div>);
  }

  async function handleRestake() {
    if (!stakeAmount) return;
    const txHash = await handleSign(
      stakeAmount * 10 ** 8,
      timeStakeOfUser,
      finalityProviderPK[0]
      // "f4940b238dcd00535fde9730345bab6ff4ea6d413cc3602c4033c10f251c7e81"
    );

    if (txHash) {
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
    }
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
      const { stakingTxHex, stakingTerm, txHash } = await signStakingTx(
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
      return txHash;
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

    // console.log("currentVersion", currentVersion);
    // console.log("btcWallet.network", btcWallet.network);
    // console.log("btcWallet.address", btcWallet.address);
    // console.log("btcWallet.publicKeyNoCoord", btcWallet.publicKeyNoCoord);
    // console.log("memoizedFeeRate", memoizedFeeRate);
    // console.log("availableUTXOs", availableUTXOs);
    // console.log("--------------------------------");
    // console.log("stakingAmountSat", stakingAmountSat);
    // console.log("stakingTimeBlocks", stakingTimeBlocks);
    // console.log("finalityProviderPK", finalityProviderPK);

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
      const { stakingFeeSat } = createStakingTx(
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
      setFeeRate(stakingFeeSat);

      return stakingFeeSat;
    } catch (error) {
      console.error("Error getting fees", error);
      setFeeRate(null);
      return 0;
    }
  };

  useEffect(() => {
    // const stakingTxHex =
    //   "02000000000101f7ca7e754294239e958fc3f59c718bad6342767db3acc33debe9efc2baabeecd0200000000fdffffff0380380100000000002251205a53c030ee721fbe06df2720c0befe00c50d2ecc7b0bd379a83898de523d15f30000000000000000496a476262743400afd7f1dfc19eaa6cac99b7feda52e6199a8be829db750c4de0b20c50b8c3c1bdf4940b238dcd00535fde9730345bab6ff4ea6d413cc3602c4033c10f251c7e81fa00f212480000000000225120818cf43f742d8462a78ee17338a8f59e8a11196e2fd76e77546f8a378f942b1f014033e4f64dd60c52f0b382a41be43d2400ff6b9b2339a54071c49f43f786335c0b98fb4300e684d990a8f22c3f0c36f787d6c9930d414ceb6950d44e72bb4b12a4dc5d0300";
    // const tx = Psbt.fromHex(stakingTxHex).extractTransaction();
    // const txid = tx.getId();
    // console.log("txid:", txid);
    if (stakeAmount) {
      getTransactionScript(
        stakeAmount * 10 ** 8,
        timeStakeOfUser,
        finalityProviderPK[0]
        // "2ba550f80f9a63cd0d00d306e96a3f73c09be93169a3ed4e1903e9e5c3867cf0"
      );
    }
  }, [
    currentVersion,
    btcWallet.network,
    btcWallet.address,
    btcWallet.publicKeyNoCoord,
    availableUTXOs,
    stakeAmount,
    finalityProviderPK,
    // timeStakeOfUser, //remove because otherwise it fetch too much
  ]);

  //tu check si > 0.0007, et < 0.05
  const isAmountEnough = stakeAmount && stakeAmount > 0.0007;
  const isAmountNotTooHigh = stakeAmount && stakeAmount < 0.05;
  const isRestakeButtonDisabled = !isAmountEnough || !isAmountNotTooHigh;

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
                Deposited
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

      {/* Select duration */}
      <div className={`${styles.inputContainer} ${styles.selectDuration}`}>
        <div className={styles.label}>Select duration</div>
        <div className={styles.lineInput}>
          <div className={styles.topInput}>
            <div className={styles.unit}>days</div>
            <div className={styles.number}>{numberDaysOfUser}</div>
          </div>
          <div className={styles.bottomInput}>
            {/* input range */}
            <input
              type="range"
              step="1"
              min="60"
              max="730"
              value={numberDaysOfUser}
              onChange={(e) => setNumberDaysOfUser(Number(e.target.value))}
            />
          </div>
        </div>
      </div>

      {/* Restake button */}
      {btcWallet.connected ? (
        stakeAmount === undefined ? (
          <button
            className={`${styles.restakeBtn} ${styles.disabled}`}
            onClick={() => {
              setStakeAmount(0.0007);
              toast.success("We set the minimum stake for you.");
            }}
          >
            Please select an amount
          </button>
        ) : stakeAmount < 0.0007 ? (
          <button
            className={`${styles.restakeBtn} ${styles.disabled}`}
            onClick={() => {
              setStakeAmount(0.0007);
              toast.success("We set the minimum stake for you.");
            }}
          >
            Min stake is 0.0007 BTC
          </button>
        ) : stakeAmount > 0.05 ? (
          <button
            className={`${styles.restakeBtn} ${styles.disabled}`}
            onClick={() => {
              setStakeAmount(0.05);
              toast.success("We set the maximum stake for you.");
            }}
          >
            Max stake is 0.05BTC
          </button>
        ) : (
          <button className={styles.restakeBtn} onClick={handleRestake}>
            Restake
          </button>
        )
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
        {/* <div className={styles.infoLine}>
          Validator activation:{" "}
          <span className={styles.highlight}>~0.4 jours</span>
        </div> */}
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
