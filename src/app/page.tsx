"use client";

import Image from "next/image";
import styles from "./page.module.scss";
import { Link } from "next-view-transitions";
import { useEffect } from "react";
import MainStruct from "@/app/components/MainStruct/MainStruct";
// import ContentVaults from "@/app/components/ContentVaults/ContentVaults";

import { useDataAVS } from "@/app/context/ContextProvider";
import ContentVaults from "@/app/components/ContentVaults/ContentVaults";

export default function Home() {
  const { dataVaults, isLoadingVaults } = useDataAVS();
  return (
    <MainStruct mainTitle="Restake">
      <ContentVaults
        title="Public vaults"
        listVaults={dataVaults}
        isSearchBar
        isCreateVaultButton
        isLoading={isLoadingVaults}
      />
    </MainStruct>
  );
}
