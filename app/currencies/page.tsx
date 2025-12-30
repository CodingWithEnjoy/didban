"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import styles from "./page.module.css";

interface FinancialItem {
  key: string;
  price: string;
  priceFloat: number;
  change: string;
  currency: string;
  title: string;
  enTitle: string;
  icon: string;
  convert?: string;
}

export default function CurrenciesPage() {
  const [items, setItems] = useState<FinancialItem[]>([]);
  const [from, setFrom] = useState<string>("");
  const [to, setTo] = useState<string>("");
  const [amount, setAmount] = useState<number>(1);
  const [result, setResult] = useState<number | null>(null);

  // Allowed converter currencies
  const converterKeys = ["usd", "eur", "gbp", "aed", "try", "toman"];

  useEffect(() => {
    fetch(
      "https://corsproxy.io/?url=https://api.dastyar.io/express/financial-item"
    )
      .then((res) => res.json())
      .then((data: FinancialItem[]) => {
        setItems(data);
        // Set default converter to USD → EUR
        setFrom("usd");
        setTo("eur");
      })
      .catch(console.error);
  }, []);

  const handleConvert = () => {
    let fromItem = items.find((i) => i.key === from);
    let toItem = items.find((i) => i.key === to);

    // Handle virtual "toman"
    if (from === "toman") {
      fromItem = {
        key: "toman",
        priceFloat: 10,
        price: "10",
        change: "0",
        currency: "تومان",
        title: "تومان",
        enTitle: "Toman",
        icon: "",
      };
    }
    if (to === "toman") {
      toItem = {
        key: "toman",
        priceFloat: 10,
        price: "10",
        change: "0",
        currency: "تومان",
        title: "تومان",
        enTitle: "Toman",
        icon: "",
      };
    }

    if (!fromItem || !toItem) return;

    const converted = (amount * fromItem.priceFloat) / toItem.priceFloat;
    setResult(converted);
  };

  // Filter items for converter
  const converterItems = items.filter((i) => converterKeys.includes(i.key));

  return (
    <div className={styles.container}>
      {/* Financial list */}
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
                {Number(item.change).toLocaleString("fa-IR")}%
              </div>
              <div className={styles.price}>
                {Number(item.price).toLocaleString("fa-IR")}{" "}
                <span>{item.currency}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Converter */}
      <div className={styles.converter}>
        <h2>تبدیل ارز</h2>
        <div className={styles.converterRow}>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
          />
          <select value={from} onChange={(e) => setFrom(e.target.value)}>
            {converterItems.map((item) => (
              <option key={item.key} value={item.key}>
                {item.title}
              </option>
            ))}
            <option value="toman">تومان</option>
          </select>
          <select value={to} onChange={(e) => setTo(e.target.value)}>
            {converterItems.map((item) => (
              <option key={item.key} value={item.key}>
                {item.title}
              </option>
            ))}
            <option value="toman">تومان</option>
          </select>
        </div>
        <button className={styles.convertButton} onClick={handleConvert}>
          تبدیل
        </button>
        {result !== null && (
          <p className={styles.result}>
            {amount}{" "}
            {from === "toman"
              ? "تومان"
              : converterItems.find((i) => i.key === from)?.title}{" "}
            = {result.toLocaleString("fa-IR", { maximumFractionDigits: 4 })}{" "}
            {to === "toman"
              ? "تومان"
              : converterItems.find((i) => i.key === to)?.title}
          </p>
        )}
      </div>
    </div>
  );
}
