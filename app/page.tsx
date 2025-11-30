"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import jalaali from "jalaali-js";
import styles from "./page.module.css";
import { EmojiProvider, Emoji } from "react-apple-emojis";
import emojiData from "react-apple-emojis/src/data.json";
import { X, Phone, Send, Linkedin, Files } from "lucide-react";

interface FinancialItem {
  key: string;
  price: string;
  change: string;
  currency: string;
  title: string;
  enTitle: string;
  icon: string;
}

interface WeatherItem {
  date: string;
  current?: number;
  min: number;
  max: number;
  weather: { id: number; main: string; description: string; icon: string };
}

interface NewsItem {
  title: string;
  link: string;
  content: string;
  pubDate: number;
  agency: string;
  agencyDisplay: string;
  categoryId: string;
  categoryName: string;
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

export default function Home() {
  const [items, setItems] = useState<FinancialItem[]>([]);
  const [weather, setWeather] = useState<WeatherItem | null>(null);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [shareModal, setShareModal] = useState<{ open: boolean; link: string }>(
    {
      open: false,
      link: "",
    }
  );
  const [closing, setClosing] = useState(false);

  const closeShareModal = () => {
    setClosing(true);
    setTimeout(() => {
      setShareModal({ open: false, link: "" });
      setClosing(false);
    }, 300);
  };

  useEffect(() => {
    fetch(
      "https://corsproxy.io/?url=https://api.dastyar.io/express/financial-item"
    )
      .then((res) => res.json())
      .then((data) => setItems(data))
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    fetch(
      "https://corsproxy.io/?url=https://api.dastyar.io/express/weather?city=Tehran&theme=light"
    )
      .then((res) => res.json())
      .then((data: WeatherItem[]) => setWeather(data[0]))
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    fetch("/api/news")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setNews(data.news);
      })
      .catch((err) => console.error(err));
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

  const getRelativeTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp; // in milliseconds
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 60) return `چند ثانیه قبل`;
    if (minutes < 60) return `${minutes} دقیقه قبل`;
    if (hours < 24) return `${hours} ساعت قبل`;
    return `${days} روز قبل`;
  };

  const openShareModal = (link: string) => {
    setShareModal({ open: true, link });
  };

  const copyToClipboard = (link: string) => {
    navigator.clipboard.writeText(link);
    alert("لینک کپی شد!");
  };

  const [aqi, setAqi] = useState<any>(null);

  useEffect(() => {
    fetch("/api/aqi")
      .then((res) => res.json())
      .then((data) => setAqi(data))
      .catch((err) => console.error(err));
  }, []);

  const toPersianNumber = (num: string | number) => {
    return String(num).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[parseInt(d, 10)]);
  };

  const getAqiColor = (aqi: number) => {
    if (aqi <= 50) return "#16a34a"; // Green - Good
    if (aqi <= 100) return "#eab308"; // Yellow - Moderate
    if (aqi <= 150) return "#f97316"; // Orange - Unhealthy for sensitive
    if (aqi <= 200) return "#dc2626"; // Red - Unhealthy
    if (aqi <= 300) return "#9333ea"; // Purple - Very Unhealthy
    return "#7f1d1d"; // Maroon - Hazardous
  };

  return (
    <div className={styles.container}>
      <div className={`${styles.col} ${styles.col1}`}>
        <div className={styles.financial}>
          <div className={styles.financialTitle}>قیمت‌های لحظه‌ای</div>
          <div className={styles.financialRows}>
            {items.map((item) => (
              <div key={item.key} className={styles.row}>
                <div className={styles.right}>
                  <Image
                    src={item.icon}
                    alt={item.enTitle}
                    width={20}
                    height={20}
                  />
                  <span>{item.title}</span>
                </div>
                <div
                  className={`${styles.change} ${
                    parseFloat(item.change) > 0
                      ? styles.up
                      : parseFloat(item.change) < 0
                      ? styles.down
                      : ""
                  }`}
                >
                  {Number(item.change).toLocaleString("fa-IR")}%{" "}
                </div>
                <div className={styles.price}>
                  {Number(item.price).toLocaleString("fa-IR")}{" "}
                  <span>{item.currency}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.col}>
        <div className={styles.newsTitle}>
          <h2>
            <EmojiProvider data={emojiData}>
              <Emoji name="newspaper" width={20} />
            </EmojiProvider>
            آخرین اخبار
          </h2>
          <div className={styles.newsTitleDivider}></div>
          <span>مطالب و خبرهای مهم هر روز را به صورت خلاصه بخوانید</span>
        </div>

        <div className={styles.newsList}>
          {news.map((item, idx) => (
            <div key={idx} className={styles.newsCard}>
              <div className={styles.newsHeader}>
                <span
                  className={`${styles.category} ${
                    item.categoryName === "ورزشی"
                      ? styles.bgSport
                      : item.categoryName === "فرهنگ و هنر"
                      ? styles.bgArt
                      : item.categoryName === "سیاست"
                      ? styles.bgPolitics
                      : item.categoryName === "اقتصاد"
                      ? styles.bgEconomy
                      : item.categoryName === "سلامت"
                      ? styles.bgHealth
                      : styles.bgDefault
                  }`}
                >
                  <EmojiProvider data={emojiData}>
                    <Emoji
                      name={
                        item.categoryName === "ورزشی"
                          ? "basketball"
                          : item.categoryName === "فرهنگ و هنر"
                          ? "artist-palette"
                          : item.categoryName === "سیاست"
                          ? "balance-scale"
                          : item.categoryName === "اقتصاد"
                          ? "chart-increasing"
                          : item.categoryName === "سلامت"
                          ? "red-apple"
                          : "rolled-up-newspaper"
                      }
                      width={16}
                    />
                  </EmojiProvider>
                  {item.categoryName}
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
                    ></path>
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

                <p>{item.content}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className={`${styles.col} ${styles.col3}`}>
        {weather && (
          <div className={styles.weatherCard}>
            <div className={styles.weatherLeft}>
              <span>دمای امروز :</span>
              <p>
                {Math.round(weather.current ?? weather.min).toLocaleString(
                  "fa-IR"
                )}
                °C
              </p>
              <Image
                src={`https://dasteaval.news/_ipx/q_80/images/weather/${weather.weather.icon}.svg`}
                alt={weather.weather.description}
                width={30}
                height={30}
              />
            </div>
            <div className={styles.weatherDivider}></div>
            <div className={styles.weatherRight}>
              <div>{getShamsiDate(weather.date)}</div>
              <span>تهران</span>
            </div>
          </div>
        )}

        {aqi && (
          <div className={styles.aqiCard}>
            <div className={styles.aqiHeader}>
              <h3>شاخص کیفیت هوا</h3>

              <p
                className={styles.aqiValue}
                style={{ color: getAqiColor(Number(aqi.aqi)) }}
              >
                {toPersianNumber(aqi.aqi)}
              </p>

              <div className={styles.aqiPollutant}>
                <p> آلاینده اصلی : {aqi.pollutant}</p>
              </div>
            </div>

            <div className={styles.aqiDivider}></div>

            <div className={styles.aqiFooter}>
              <p>باد: {toPersianNumber(aqi.wind)}</p>
              <p>رطوبت: {toPersianNumber(aqi.humidity)}</p>
            </div>
          </div>
        )}
      </div>

      {shareModal.open && (
        <div
          className={`${styles.modalOverlay} ${closing ? styles.fadeOut : ""}`}
        >
          <div
            className={`${styles.modalContent} ${
              closing ? styles.scaleOut : ""
            }`}
          >
            <div className={styles.modalHeader}>
              <button className={styles.closeModal} onClick={closeShareModal}>
                <X color="#000" width={20} />
              </button>

              <h3> ارسال با</h3>
            </div>

            <div className={styles.shareButtons}>
              <a
                href={`https://wa.me/?text=${encodeURIComponent(
                  shareModal.link
                )}`}
                target="_blank"
              >
                <Phone className={`${styles.shareIcon} ${styles.whatsapp}`} />
                واتساپ
              </a>
              <a
                href={`https://t.me/share/url?url=${encodeURIComponent(
                  shareModal.link
                )}`}
                target="_blank"
              >
                <Send className={`${styles.shareIcon} ${styles.telegram}`} />
                تلگرام
              </a>
              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
                  shareModal.link
                )}`}
                target="_blank"
              >
                <Linkedin
                  className={`${styles.shareIcon} ${styles.linkedin}`}
                />
                لینکدین
              </a>
            </div>

            <div className={styles.copyLink}>
              <span>یا لینک زیر رو کپی کن</span>

              <div className={styles.linkSection}>
                <input
                  dir="ltr"
                  type="text"
                  value={decodeURIComponent(shareModal.link)}
                  readOnly
                  className={styles.linkInput}
                />
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
