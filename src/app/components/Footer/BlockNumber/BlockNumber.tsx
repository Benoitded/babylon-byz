"use client";

// src/components/BlockNumber.tsx

import React, { useEffect, useState } from "react";
import styles from "./BlockNumber.module.scss";
import { useBTCWallet } from "@/app/context/wallet/BTCWalletProvider";
import { useAppState } from "@/app/state";

const BlockNumber: React.FC = () => {
  const { currentHeight: blockNumber } = useAppState();

  // useEffect(() => {
  //   try {
  //     fetch("https://mempool.space/signet/api/blocks/tip/height")
  //       .then((res) => res.json())
  //       .then((data) => setBlockNumber(data));
  //   } catch (error) {
  //     setBlockNumber(0);
  //   }
  // }, []);
  // Render
  return (
    <footer className={styles.blockNumber}>
      {blockNumber && (
        <div className={styles.numberBloc}>
          <a href={"https://mempool.space/signet"} target="_blank">
            <div>{blockNumber.toString()}</div>
            <div></div>
          </a>
        </div>
      )}
    </footer>
  );
};

export default BlockNumber;
