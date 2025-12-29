"use client";

import { useEffect, useState } from "react";
import jalaali from "jalaali-js";
import { EmojiProvider, Emoji } from "react-apple-emojis";
import emojiData from "react-apple-emojis/src/data.json";
import { X, Phone, Send, Linkedin, Files } from "lucide-react";
import styles from "./page.module.css";

interface NewsItem {
  title: string;
  link: string;
  content: string;
  pubDate: string | number;
  agencyDisplay: string;
  coverImage: string | null;
}

const weekDays = [
  "شنبه",
  "یکشنبه",
  "دوشنبه",
  "سه‌شنبه",
  "چهارشنبه",
  "پنج‌شنبه",
  "جمعه",
];

const months = [
  "فروردین",
  "اردیبهشت",
  "خرداد",
  "تیر",
  "مرداد",
  "شهریور",
  "مهر",
  "آبان",
  "آذر",
  "دی",
  "بهمن",
  "اسفند",
];

export default function ClosureNews() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [shareModal, setShareModal] = useState<{ open: boolean; link: string }>({
    open: false,
    link: "",
  });
  const [closing, setClosing] = useState(false);

  const closeShareModal = () => {
    setClosing(true);
    setTimeout(() => {
      setShareModal({ open: false, link: "" });
      setClosing(false);
    }, 300);
  };

  useEffect(() => {
    fetch(`/api/news?keyword=تعطیل,تعطیلی,آلودگی`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setNews(data.news);
      })
      .catch(console.error);
  }, []);

  const getShamsiDate = (gregorianDate: string | number) => {
    const g = new Date(gregorianDate);
    const j = jalaali.toJalaali(g.getFullYear(), g.getMonth() + 1, g.getDate());
    const backToGregorian = jalaali.toGregorian(j.jy, j.jm, j.jd);
    const weekdayIndex = new Date(
      backToGregorian.gy,
      backToGregorian.gm - 1,
      backToGregorian.gd
    ).getDay();
    const persianWeekDay = weekDays[(weekdayIndex + 6) % 7];
    const month = months[j.jm - 1];
    const dayPersian = j.jd.toLocaleString("fa-IR");
    return `${persianWeekDay} ${dayPersian} ${month}`;
  };

  const getRelativeTime = (pubDate: string | number) => {
    const time = new Date(pubDate).getTime();
    if (isNaN(time)) return "نامشخص";

    const diff = Date.now() - time;
    if (diff < 0) return "لحظاتی قبل";

    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 60) return "چند ثانیه قبل";
    if (minutes < 60) return `${minutes} دقیقه قبل`;
    if (hours < 24) return `${hours} ساعت قبل`;
    return `${days} روز قبل`;
  };

  const openShareModal = (link: string) => setShareModal({ open: true, link });

  const copyToClipboard = (link: string) => {
    navigator.clipboard.writeText(link);
    alert("لینک کپی شد!");
  };

  const stripImagesFromHtml = (html: string) => html.replace(/<img[^>]*>/gi, "");

  return (
    <div className={styles.container}>
      <div className={styles.newsTitle}>
        <h2>
          <EmojiProvider data={emojiData}>
            <Emoji name="factory" width={20} />
          </EmojiProvider>
          اخبار تعطیلی و آلودگی
        </h2>
      </div>

      <div className={styles.newsList}>
        {news.map((item, idx) => (
          <div key={idx} className={styles.newsCard}>
            <div className={styles.newsHeader}>
              <span className={styles.category}>
                <EmojiProvider data={emojiData}>
                  <Emoji name="warning" width={16} />
                </EmojiProvider>
                خبر
              </span>
              <div
                className={styles.newsShare}
                onClick={() => openShareModal(item.link)}
                style={{ cursor: "pointer" }}
              >
                <svg
                  width="21"
                  height="22"
                  viewBox="0 0 27 28"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  role="button"
                  stroke="#94a3b8"
                >
                  <path
                    d="M7.73883 10.546H6.5563C3.97704 10.546 1.88574 12.6373 1.88574 15.2165V21.3954C1.88574 23.9734 3.97704 26.0646 6.5563 26.0646H20.663C23.2423 26.0646 25.3336 23.9734 25.3336 21.3954V15.2039C25.3336 12.6322 23.2486 10.546 20.677 10.546H19.4818M13.6095 1.93555V17.1969M13.6095 1.93555L9.91479 5.64702M13.6095 1.93555L17.3053 5.64702"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>

            {item.coverImage && (
              <div className={styles.newsImage}>
                <a href={item.link} target="_blank" rel="noopener noreferrer">
                  <img
                    src={item.coverImage}
                    alt={item.title}
                    style={{ objectFit: "cover" }}
                  />
                </a>
              </div>
            )}

            <div className={styles.newsContent}>
              <a href={item.link} target="_blank" rel="noopener noreferrer">
                <h3>{item.title}</h3>
              </a>
              <span>
                {item.agencyDisplay} | {getRelativeTime(item.pubDate)}
              </span>
              <div dangerouslySetInnerHTML={{ __html: stripImagesFromHtml(item.content) }} />
            </div>
          </div>
        ))}
      </div>

      {shareModal.open && (
        <div className={`${styles.modalOverlay} ${closing ? styles.fadeOut : ""}`}>
          <div className={`${styles.modalContent} ${closing ? styles.scaleOut : ""}`}>
            <div className={styles.modalHeader}>
              <button className={styles.closeModal} onClick={closeShareModal}>
                <X color="#000" width={20} />
              </button>
              <h3>ارسال با</h3>
            </div>

            <div className={styles.shareButtons}>
              <a href={`https://wa.me/?text=${encodeURIComponent(shareModal.link)}`} target="_blank">
                <Phone className={`${styles.shareIcon} ${styles.whatsapp}`} />
                واتساپ
              </a>
              <a href={`https://t.me/share/url?url=${encodeURIComponent(shareModal.link)}`} target="_blank">
                <Send className={`${styles.shareIcon} ${styles.telegram}`} />
                تلگرام
              </a>
              <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareModal.link)}`} target="_blank">
                <Linkedin className={`${styles.shareIcon} ${styles.linkedin}`} />
                لینکدین
              </a>
            </div>

            <div className={styles.copyLink}>
              <span>یا لینک زیر رو کپی کن</span>
              <div className={styles.linkSection}>
                <input dir="ltr" type="text" value={decodeURIComponent(shareModal.link)} readOnly className={styles.linkInput} />
                <button onClick={() => copyToClipboard(shareModal.link)}>
                  <Files width={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
