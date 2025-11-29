"use client";

import Link from "next/link";
import Image from "next/image";
import styles from "./header.module.css";
import { EmojiProvider, Emoji } from "react-apple-emojis";
import emojiData from "react-apple-emojis/src/data.json";

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.headerLogo}>
        <Link href="/" className={styles.logo}>
          <Image src={"/img/logo.png"} alt="" width={30} height={30}></Image>
          دیدبان
        </Link>
      </div>
      <div className={styles.headerLinks}>
        <div className={styles.headerLinksLatest}>
          <Link href="/">
            اخبار امروز
            <EmojiProvider data={emojiData}>
              <Emoji name="rolled-up-newspaper" width={16} />
            </EmojiProvider>
          </Link>
        </div>
        <div className={styles.headerLinksDivider}></div>
        <div className={styles.headerLinksAll}>
          <Link href="/">
            ورزشی
            <EmojiProvider data={emojiData}>
              <Emoji name="basketball" width={16} />
            </EmojiProvider>
          </Link>
          <Link href="/">
            فرهنگ و هنر
            <EmojiProvider data={emojiData}>
              <Emoji name="artist-palette" width={16} />
            </EmojiProvider>
          </Link>
          <Link href="/">
            سیاست
            <EmojiProvider data={emojiData}>
              <Emoji name="balance-scale" width={16} />
            </EmojiProvider>
          </Link>
          <Link href="/">
            اقتصاد
            <EmojiProvider data={emojiData}>
              <Emoji name="chart-increasing" width={16} />
            </EmojiProvider>
          </Link>
          <Link href="/">
            سلامت
            <EmojiProvider data={emojiData}>
              <Emoji name="red-apple" width={16} />
            </EmojiProvider>
          </Link>
        </div>
      </div>
    </header>
  );
}
