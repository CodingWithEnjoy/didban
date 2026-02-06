"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import jalaali from "jalaali-js";
import styles from "./page.module.css";

interface WeatherItem {
  date: string;
  current?: number;
  min: number;
  max: number;
  weather: {
    description: string;
    icon: string;
  };
  customDescription: {
    text: string;
    emoji: string;
  };
}

export default function WeatherPage() {
  const [weather, setWeather] = useState<WeatherItem | null>(null);
  const [aqi, setAqi] = useState<any>(null);

  useEffect(() => {
    fetch(
      "https://amirmasoud.netlify.app/api/v1/weather?city=Tehran"
    )
      .then((res) => res.json())
      .then((data) => setWeather(data[0]))
      .catch(console.error);
  }, []);

  useEffect(() => {
    fetch("/api/aqi")
      .then((res) => res.json())
      .then(setAqi)
      .catch(console.error);
  }, []);

  const getShamsiDate = (date: string) => {
    const g = new Date(date);
    const j = jalaali.toJalaali(g.getFullYear(), g.getMonth() + 1, g.getDate());
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
    return `${j.jd.toLocaleString("fa-IR")} ${months[j.jm - 1]} ${j.jy}`;
  };

  const getAqiColor = (aqi: number) => {
    if (aqi <= 50) return "#16a34a";
    if (aqi <= 100) return "#eab308";
    if (aqi <= 150) return "#f97316";
    if (aqi <= 200) return "#dc2626";
    return "#7f1d1d";
  };

  const getTempColor = (temp: number) => {
    if (temp <= 0) return "#2563eb";
    if (temp <= 10) return "#38bdf8";
    if (temp <= 20) return "#16a34a";
    if (temp <= 30) return "#f97316";
    return "#dc2626";
  };

  const toPersianNumber = (num: string | number) => {
    return String(num).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[parseInt(d, 10)]);
  };

  return (
    <div className={styles.container}>
      {weather && (
        <div className={styles.weatherCard}>
          <div className={styles.weatherLeft}>
            <h3>وضعیت هوا</h3>

            <p
              className={styles.weatherTemp}
              style={{
                color: getTempColor(Math.round(weather.current ?? weather.min)),
              }}
            >
              {Math.round(weather.current ?? weather.min).toLocaleString(
                "fa-IR"
              )}
              °C
              <Image
                src={`https://dasteaval.news/_ipx/q_80/images/weather/${weather.weather.icon}.svg`}
                alt={weather.weather.description}
                width={34}
                height={34}
              />
            </p>

            <div className={styles.weatherDesc}>
              {weather.customDescription.text} {weather.customDescription.emoji}
            </div>
          </div>

          <div className={styles.weatherDivider}></div>

          <div className={styles.weatherRight}>
            <span>{toPersianNumber(getShamsiDate(weather.date))}</span>
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
  );
}
