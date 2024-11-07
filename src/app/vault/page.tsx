"use client";

// @/src/app/avs/strategy/page.tsx

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import styles from "./page.module.scss";

import { SpinnerPedro } from "@/utils/SpinnerPedro/SpinnerPedro";

function Page() {
  const router = useRouter();

  useEffect(() => {
    router.push("/");
  }, [router]);

  return (
    <div className={styles.contentAVS}>
      <div className={styles.problem}>
        <div>Loading...</div>
        <SpinnerPedro />
      </div>
    </div>
  );
}

export default Page;
