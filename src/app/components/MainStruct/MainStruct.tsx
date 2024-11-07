"use client";

// @/src/components/MainStruct/MainStruct.tsx

// Core imports
import React from "react";
import { useTransitionRouter } from "next-view-transitions";
import { useRouter } from "next/navigation";
import { SpinnerPedro } from "@/utils/SpinnerPedro/SpinnerPedro";

// Styles and assets
import styles from "./MainStruct.module.scss";

// Props
interface MainStructProps {
  children: React.ReactNode;
  mainTitle?: string;
  isBackButton?: boolean;
  isLoading?: boolean;
}

const MainStruct: React.FC<MainStructProps> = ({
  children,
  mainTitle,
  isBackButton = false,
  isLoading = false,
}) => {
  const router = useRouter();

  return (
    <div className={styles.mainStruct}>
      {isBackButton && (
        <button onClick={() => router.back()} className={styles.backBtn}>
          Back
        </button>
      )}
      {mainTitle && <h1 className={styles.mainTitle}>{mainTitle}</h1>}
      {isLoading ? (
        <div className={styles.loading}>
          <div>Loading...</div>
          <SpinnerPedro />
        </div>
      ) : (
        children
      )}
    </div>
  );
};

export default MainStruct;
