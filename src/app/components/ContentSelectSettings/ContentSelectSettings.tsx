// src/components/ContentSelectSettings.tsx
import React, { useRef, useEffect, useState } from "react";
// import Link from "next/link";
import { useTransitionRouter } from "next-view-transitions";

import styles from "./ContentSelectSettings.module.scss";
import ArrowDownIcon from "@/assets/icons/arrowDown.svg";
import Bitcoin from "@/assets/bitcoin.svg";

import { SettingsCreateVault } from "@/app/types/vaultsData";
import { useRouter, useSearchParams } from "next/navigation";

interface ContentSelectSettingsProps {
  settings: SettingsCreateVault;
  setSettings: React.Dispatch<React.SetStateAction<SettingsCreateVault>>;
}

const ContentSelectSettings: React.FC<ContentSelectSettingsProps> = ({
  settings,
  setSettings,
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const handleChange = (
    key: keyof SettingsCreateVault,
    value: string | boolean | number
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className={styles.contentSelectSettings}>
      <div className={styles.lineSettings}>
        <div className={styles.labelSettings}>Vault name</div>
        <div className={styles.rightSettings}>
          <input
            type="text"
            placeholder="Vault name"
            value={settings.name}
            onChange={(e) => handleChange("name", e.target.value)}
          />
        </div>
      </div>
      <div className={styles.lineSettings}>
        <div className={styles.labelSettings}>Vault description</div>
        <div className={styles.rightSettings}>
          <input
            type="text"
            placeholder="Vault description"
            value={settings.description}
            onChange={(e) => handleChange("description", e.target.value)}
          />
        </div>
      </div>
    </div>
  );
};

export default ContentSelectSettings;
