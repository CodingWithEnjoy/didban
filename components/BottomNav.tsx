"use client";

import Link from "next/link";
import styles from "./header.module.css";
import { EmojiProvider, Emoji } from "react-apple-emojis";
import emojiData from "react-apple-emojis/src/data.json";

export default function BottomNav() {
  return (
    <nav className={styles.bottomNav}>
      <Link href="/">
        <EmojiProvider data={emojiData}>
          <Emoji name="house" width={20} />
        </EmojiProvider>
        <span>خانه</span>
      </Link>

      <Link href="/weather">
        <EmojiProvider data={emojiData}>
          <Emoji name="sun" width={20} />
        </EmojiProvider>
        <span>هواشناسی</span>
      </Link>

      <Link href="/currencies">
        <EmojiProvider data={emojiData}>
          <Emoji name="money-bag" width={20} />
        </EmojiProvider>
        <span>ارز</span>
      </Link>

      <Link href="/categories">
        <EmojiProvider data={emojiData}>
          <Emoji name="books" width={20} />
        </EmojiProvider>
        <span>دسته‌بندی</span>
      </Link>
    </nav>
  );
}
