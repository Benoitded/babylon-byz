"use client";

// src/components/Header.tsx
import React, { useRef, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
// import Link from "next/link";
import { Link } from "next-view-transitions";
import Image from "next/image";
import { saveAs } from "file-saver";
import Menu from "./Menu/Menu";

import styles from "./Header.module.scss";

import Logo from "@/assets/logo.png";
import { useAccount, useDisconnect, useEnsName } from "wagmi";

import CopyIcon from "@/assets/icons/copy.svg";
import DownloadIcon from "@/assets/icons/download.svg";
import OpenIcon from "@/assets/icons/open.svg";
import { useAppKit } from "@reown/appkit/react";

import { OKXUniversalConnectUI } from "@okxconnect/ui";
import { THEME } from "@okxconnect/ui";
import { OKXBtcProvider } from "@okxconnect/universal-provider";

import { OKXUniversalProvider } from "@okxconnect/universal-provider";
import { usePhantomWallet } from "@/app/context/PhantomWallet";
import { useWalletConnection } from "@/app/context/wallet/WalletConnectionProvider";
import { useBTCWallet } from "@/app/context/wallet/BTCWalletProvider";
// import { useAppState } from "@/app/state";

const Header: React.FC = () => {
  const router = useRouter();
  // const { address, isConnected, open, disconnect } = usePhantomWallet();
  const { disconnect, open } = useWalletConnection();
  const { address } = useBTCWallet();
  // const { totalBalance, isLoading: loading } = useAppState();

  const menuRef = useRef<HTMLDivElement>(null);
  const [showLogoMenu, setShowLogoMenu] = useState(false);
  const logoMenuRef = useRef<HTMLDivElement>(null);

  // console.log("isConnected", isConnected);
  console.log("address:", address);

  const handleCopyLogo = async () => {
    try {
      const response = await fetch(Logo.src);
      const blob = await response.blob();
      await navigator.clipboard.write([
        new ClipboardItem({
          [blob.type]: blob,
        }),
      ]);
      console.log("Logo copied to clipboard");
    } catch (err) {
      console.error("Error while copying the logo:", err);
    }
    setShowLogoMenu(false);
  };

  const handleDownloadLogo = () => {
    // Utiliser file-saver pour télécharger l'image
    saveAs(Logo.src, "byzantine-finance-logo.png");
    setShowLogoMenu(false);
  };

  const handleOpenMediaKit = () => {
    window.open(
      "https://docs.byzantine.fi/partnerships-and-media/media-kit",
      "_blank"
    );
    setShowLogoMenu(false);
  };

  useEffect(() => {
    const handleClickOutsideLogoMenu = (event: MouseEvent) => {
      if (
        logoMenuRef.current &&
        !logoMenuRef.current.contains(event.target as Node)
      ) {
        setShowLogoMenu(false);
      }
    };

    if (showLogoMenu) {
      document.addEventListener("mousedown", handleClickOutsideLogoMenu);
    } else {
      document.removeEventListener("mousedown", handleClickOutsideLogoMenu);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutsideLogoMenu);
    };
  }, [showLogoMenu]);

  const handleLogoContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowLogoMenu(true);
  };
  const getAccountUI = async () => {
    const okxUniversalConnectUI = await OKXUniversalConnectUI.init({
      dappMetaData: {
        icon: "https://static.okx.com/cdn/assets/imgs/247/58E63FEA47A2B7D7.png",
        name: "OKX WalletConnect UI Demo",
      },
      actionsConfiguration: {
        returnStrategy: "tg://resolve",
        modals: "all",
      },
      language: "en_US",
      uiPreferences: {
        theme: THEME.LIGHT,
      },
    });

    let okxBtcProvider = new OKXBtcProvider(await okxUniversalConnectUI);

    let result = await okxBtcProvider.getAccount("btc:mainnet");

    console.log("result okx:", result);
  };

  const getSession = async () => {
    const okxUniversalProvider = await OKXUniversalProvider.init({
      dappMetaData: {
        name: "application name",
        icon: "application icon url",
      },
    });
    console.log("okxUniversalProvider:", okxUniversalProvider);
    var session = await okxUniversalProvider.connect({
      namespaces: {
        btc: {
          chains: ["btc:mainnet", "fractal:mainnet"],
        },
      },
      sessionConfig: {
        redirect: "tg://resolve",
      },
    });
    console.log("session okx:", session);
    // let okxBtcProvider = new OKXBtcProvider(okxUniversalProvider);

    // let result = await okxBtcProvider.getAccount("btc:mainnet");
    // console.log("result okx:", result);
  };

  // getSession();

  const getAccount = async () => {
    const okxUniversalProvider = await OKXUniversalProvider.init({
      dappMetaData: {
        name: "application name",
        icon: "application icon url",
      },
    });
    console.log("okxUniversalProvider:", okxUniversalProvider);
    // var session = await okxUniversalProvider.connect({
    //   namespaces: {
    //     btc: {
    //       chains: ["btc:mainnet", "fractal:mainnet"],
    //     },
    //   },
    //   sessionConfig: {
    //     redirect: "tg://resolve",
    //   },
    // });
    // console.log("session okx:", session);
    let okxBtcProvider = new OKXBtcProvider(okxUniversalProvider);

    let result = await okxBtcProvider.getAccount("btc:mainnet");
    console.log("result okx:", result);
  };

  // const getProvider = () => {
  //   if ("phantom" in window) {
  //     const anyWindow: any = window;
  //     const provider = anyWindow.phantom?.bitcoin;

  //     if (provider && provider.isPhantom) {
  //       return provider;
  //     }
  //   }

  //   window.open("https://phantom.app/", "_blank");
  // };

  // // getAccount();
  // const isPhantomInstalled = window?.phantom?.bitcoin?.isPhantom;
  // const handelConnect = async () => {
  //   const phantomProvider = getProvider(); // see "Detecting the Provider"
  //   const accounts = await phantomProvider.requestAccounts();
  //   console.log(accounts);
  // };

  // console.log("isPhantomInstalled:", isPhantomInstalled);

  return (
    <header className={styles.header}>
      <div className={styles.logoWrapper} onContextMenu={handleLogoContextMenu}>
        <Link className={styles.logo} href={"/"}>
          <Image
            src={Logo}
            height={40}
            className={styles.logoClariFi}
            alt="Logo of ClariFi"
          />
        </Link>
        {showLogoMenu && (
          <div
            className={styles.logoMenu}
            ref={logoMenuRef}
            onMouseLeave={() => setShowLogoMenu(false)}
          >
            <button onClick={handleCopyLogo}>
              <CopyIcon />
              Copy logo as PNG
            </button>
            <button onClick={handleDownloadLogo}>
              <DownloadIcon />
              Download logo as PNG
            </button>
            <button onClick={handleOpenMediaKit}>
              <OpenIcon />
              Open Media Kit
            </button>
          </div>
        )}
      </div>
      <Menu />
      <div className={styles.connect}>
        <button
          className={styles.containerHeader}
          onClick={() => (address ? disconnect() : open())} //open or disconnect
        >
          {address
            ? address?.slice(0, 6) + "..." + address?.slice(-4)
            : "Connect"}
        </button>
      </div>
    </header>
  );
};

export default Header;
