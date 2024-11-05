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

const Header: React.FC = () => {
  const router = useRouter();
  const { isConnected, address } = useAccount();
  const { data: ensName } = useEnsName({ address, chainId: 1 });
  const { open, close } = useAppKit();

  const { disconnect } = useDisconnect();

  const menuRef = useRef<HTMLDivElement>(null);
  const [showLogoMenu, setShowLogoMenu] = useState(false);
  const logoMenuRef = useRef<HTMLDivElement>(null);

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
        {isConnected ? (
          <>
            <button onClick={() => open()} className={styles.containerHeader}>
              {ensName ||
                (address &&
                  address.substring(0, 6) + "..." + address.slice(-4))}
            </button>
          </>
        ) : (
          <button className={styles.containerHeader} onClick={() => open()}>
            Connect
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;
