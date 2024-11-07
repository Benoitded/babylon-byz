// src/components/RestakeApp.tsx
import React, { useRef, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

// import strategyVaultETHImplementationABI from "@/ABI/strategyVaultETHImplementationABI.json";

import toast from "react-hot-toast";

import SwitchArrowsIcon from "@/assets/icons/switchArrows.svg";
import styles from "./RestakeApp.module.scss";
import Bitcoin from "@/assets/bitcoin.svg";

import { BTC_PRICE, RATIO } from "@/app/context/ContextProvider";
import { useBTCWallet } from "@/app/context/wallet/BTCWalletProvider";
import { useWalletConnection } from "@/app/context/wallet/WalletConnectionProvider";

interface RestakeAppProps {
  contractAddress: string;
}

const CHAIN_ID = 17000;

const RestakeApp: React.FC<RestakeAppProps> = ({ contractAddress }) => {
  const searchParams = useSearchParams();

  const { disconnect, open } = useWalletConnection();
  const { address, connected, getBalance } = useBTCWallet();

  const balance = getBalance();
  console.log("balance", balance);

  const balanceOfVault = 0; // TODO change

  const feeData = 0; // TODO change

  const balanceToken = 0; // TODO change

  const [currentBalance, setCurrentBalance] = useState(0);
  const [stakeAmount, setStakeAmount] = useState<number | undefined>(() => {
    const amount = searchParams.get("amount");
    return amount ? parseFloat(amount) : undefined;
  });

  // Set the current balance
  useEffect(() => {
    const fetchBalance = async () => {
      const balance = await getBalance();
      console.log("balance", balance);
      setCurrentBalance(balance / 10 ** 8 || 0);
    };

    fetchBalance();
  }, [balance]);

  function handleSwitchArrows() {
    toast.error(<div>It's not possible to withdraw at this time.</div>);
  }

  async function handleRestake() {
    toast.error("Restake not available at this time.");
    return;
  }

  // useEffect(() => {
  //   console.log("feeData", feeData);
  //   //convert to eth
  //   const gasFeesInEth = Number(feeData) / 10 ** 8;
  //   console.log("gasFeesInEth", gasFeesInEth);

  //   //convert to usd
  //   const gasFeesInUsd = gasFeesInEth * 2450;
  //   console.log("gasFeesInUsd", gasFeesInUsd);
  // }, [feeData]);

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
      {connected ? (
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
          <span>~${((Number(feeData) / 10 ** 8) * BTC_PRICE).toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};

export default RestakeApp;
