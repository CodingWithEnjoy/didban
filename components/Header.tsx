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
          <Image src="/img/logo.png" alt="" width={30} height={30} />
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

          <Link href="/closure">
            تعطیلی
            <EmojiProvider data={emojiData}>
              <Emoji name="factory" width={16} />
            </EmojiProvider>
          </Link>
        </div>

        <div className={styles.headerLinksDivider}></div>

        <div className={styles.headerLinksAll}>
          <Link href="/sports">
            ورزشی
            <EmojiProvider data={emojiData}>
              <Emoji name="basketball" width={16} />
            </EmojiProvider>
          </Link>

          <Link href="/art">
            فرهنگ و هنر
            <EmojiProvider data={emojiData}>
              <Emoji name="artist-palette" width={16} />
            </EmojiProvider>
          </Link>

          <Link href="/politics">
            سیاست
            <EmojiProvider data={emojiData}>
              <Emoji name="balance-scale" width={16} />
            </EmojiProvider>
          </Link>

          <Link href="/economic">
            اقتصاد
            <EmojiProvider data={emojiData}>
              <Emoji name="chart-increasing" width={16} />
            </EmojiProvider>
          </Link>

          <Link href="/health">
            سلامت
            <EmojiProvider data={emojiData}>
              <Emoji name="red-apple" width={16} />
            </EmojiProvider>
          </Link>

          <Link href="/tech">
            تکنولوژی
            <EmojiProvider data={emojiData}>
              <Emoji name="robot" width={16} />
            </EmojiProvider>
          </Link>
        </div>
      </div>
    </header>
  );
}
