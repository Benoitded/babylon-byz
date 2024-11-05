// src/components/Menu.tsx
import React, { useRef, useEffect, useState } from "react";

// import Link from "next/link";
import { Link } from "next-view-transitions";

import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";

import styles from "./Menu.module.scss";

import { Tooltip } from "@nextui-org/react";

import OpenIcon from "@/assets/icons/open.svg";
import GitBookIcon from "@/assets/brands/gitbook.svg";
import GitHubIcon from "@/assets/brands/github.svg";
import TwitterIcon from "@/assets/brands/twitter.svg";
import DiscordIcon from "@/assets/brands/discord.svg";

const Menu: React.FC = () => {
  const pathname = usePathname();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const isActive = (paths: string | string[]): boolean => {
    if (typeof paths === "string") {
      paths = [paths];
    }
    return paths.some((path) => {
      if (path.endsWith("*")) {
        return pathname.startsWith(path.slice(0, -1));
      }
      return pathname === path;
    });
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuRef]);

  // Render
  return (
    <div className={styles.menu} ref={menuRef}>
      <div className={`${styles.navigation} ${isMenuOpen ? styles.open : ""}`}>
        <Link
          onClick={() => setIsMenuOpen(false)}
          className={`${styles.itemMenu}
          ${isActive(["/"]) ? styles.current : ""}
          `}
          href={"/"}
        >
          {/* {isActive(["/"]) ? <div className={styles.borderDown} /> : null} */}
          Dashboard
        </Link>
        <Link
          onClick={() => setIsMenuOpen(false)}
          className={`${styles.itemMenu}
          ${isActive(["/second", "/second/*"]) ? styles.current : ""}
          `}
          href={"/second"}
        >
          Menu 2
        </Link>
        <a
          href="https://docs.byzantine.fi/"
          target="_blank"
          className={styles.itemMenu}
        >
          Docs
          <OpenIcon className={styles.openIcon} />
        </a>
      </div>
    </div>
  );
};

export default Menu;
