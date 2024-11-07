"use client";

import React from "react";
import Link from "next/link";
import DiscordIcon from "@/assets/brands/discord.svg";
import GitBookIcon from "@/assets/brands/gitbook.svg";
import GitHubIcon from "@/assets/brands/github.svg";
import TelegramIcon from "@/assets/brands/telegram.svg";
import TwitterIcon from "@/assets/brands/twitter.svg";
import WebsiteIcon from "@/assets/brands/website.svg";
import styles from "./SocialLinks.module.scss";

interface SocialLinksProps {
  twitterUrl?: string;
  githubUrl?: string;
  discordUrl?: string;
  gitbookUrl?: string;
  websiteUrl?: string;
  telegramUrl?: string;
}

const SocialLinks: React.FC<SocialLinksProps> = ({
  twitterUrl,
  githubUrl,
  discordUrl,
  gitbookUrl,
  websiteUrl,
  telegramUrl,
}) => {
  return (
    <div className={styles.socialLinks}>
      {websiteUrl && (
        <Link href={websiteUrl} target="_blank" title="Website">
          <label>Website</label>
          <WebsiteIcon alt="Website logo" className={styles.website} />
        </Link>
      )}
      {gitbookUrl && (
        <Link href={gitbookUrl} target="_blank" title="Gitbook">
          <label>Gitbook</label>
          <GitBookIcon alt="Gitbook logo" className={styles.gitbook} />
        </Link>
      )}
      {githubUrl && (
        <Link href={githubUrl} target="_blank" title="GitHub">
          <label>GitHub</label>
          <GitHubIcon alt="GitHub logo" className={styles.github} />
        </Link>
      )}
      {twitterUrl && (
        <Link href={twitterUrl} target="_blank" title="Twitter X">
          <label>Twitter X</label>
          <TwitterIcon alt="Twitter logo" className={styles.twitter} />
        </Link>
      )}
      {discordUrl && (
        <Link href={discordUrl} target="_blank" title="Discord">
          <label>Discord</label>
          <DiscordIcon alt="Discord logo" className={styles.discord} />
        </Link>
      )}
      {telegramUrl && (
        <Link href={telegramUrl} target="_blank" title="Telegram">
          <label>Telegram</label>
          <TelegramIcon alt="Telegram logo" className={styles.telegram} />
        </Link>
      )}
    </div>
  );
};

export default SocialLinks;
