"use client";

// src/components/BlockNumber.tsx

import React, { useEffect, useState } from "react";
import styles from "./BlockNumber.module.scss";

const BlockNumber: React.FC = () => {
  const [blockNumber, setBlockNumber] = useState<number>(0);

  useEffect(() => {
    try {
      fetch("https://mempool.space/signet/api/blocks/tip/height")
        .then((res) => res.json())
        .then((data) => setBlockNumber(data));
    } catch (error) {
      setBlockNumber(0);
    }
  }, []);
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
