// src/components/Footer.tsx
import BlockNumber from "./BlockNumber/BlockNumber";
import ByzantineLogo from "@/assets/byzantine/byzantineHeadLogo.png";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import SocialLinks from "./SocialLinks/SocialLinks";
import styles from "./Footer.module.scss";

const Footer: React.FC = () => {
  // Render
  return (
    <footer className={styles.footer}>
      <Link
        href="https://byzantine.fi/"
        target="_blank"
        className={styles.leftFooter}
      >
        <Image
          src={ByzantineLogo}
          height={40}
          className={styles.logoClariFi}
          alt="Logo of ClariFi"
        />
        <div>Byzantine © 2024</div>{" "}
      </Link>

      <SocialLinks
        twitterUrl={"https://twitter.com/Byzantine_fi"}
        githubUrl={"https://github.com/Byzantine-Finance"}
        discordUrl={"https://discord.gg/byzantine"}
        gitbookUrl={"https://docs.byzantine.fi/"}
      />
      <BlockNumber />
    </footer>
  );
};

export default Footer;
