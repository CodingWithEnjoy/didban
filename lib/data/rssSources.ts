import { RSSSource } from "../types/rss";

export const rssSources: RSSSource[] = [
  {
    name: "mehrnews",
    displayName: "مهر",
    websiteUrl: "https://www.mehrnews.com",
    iconUrl:
      "https://www.mehrnews.com/resources/theme/mehrnews/img/favicon.ico",
    categories: [
      {
        id: "art",
        category: "هنر",
        rssUrl: "https://www.mehrnews.com/rss/tp/1",
      },
      {
        id: "health",
        category: "سلامت",
        rssUrl: "https://www.mehrnews.com/rss/tp/550",
      },
      {
        id: "economic",
        category: "اقتصاد",
        rssUrl: "https://www.mehrnews.com/rss/tp/25",
      },
      {
        id: "sports",
        category: "ورزشی",
        rssUrl: "https://www.mehrnews.com/rss/tp/9",
      },
    ],
  },
  {
    name: "tasnimnews",
    displayName: "تسنیم",
    websiteUrl: "https://www.tasnimnews.com",
    iconUrl: "https://www.tasnimnews.com/favicon.ico",
    categories: [
      {
        id: "economic",
        category: "اقتصاد",
        rssUrl: "https://www.tasnimnews.com/fa/rss/feeds/7/0/0/0",
      },
      {
        id: "sports",
        category: "ورزشی",
        rssUrl: "https://www.tasnimnews.com/fa/rss/feeds/3/0/0/0",
      },
    ],
  },
  {
    name: "fararu",
    displayName: "فرارو",
    websiteUrl: "https://fararu.com",
    iconUrl: "https://assets.fararu.com/favicon-152.png",
    categories: [
      {
        id: "all",
        category: "جدیدترین ها",
        rssUrl: "https://fararu.com/fa/feeds",
      },
    ],
  },
  {
    name: "sharghdaily",
    displayName: "شبکه شرق",
    websiteUrl: "https://www.sharghdaily.com",
    iconUrl: "https://assets.sharghdaily.com/favicon-152.png",
    categories: [
      {
        id: "all",
        category: "جدیدترین ها",
        rssUrl: "https://www.sharghdaily.com/feeds/",
      },
    ],
  },
  {
    name: "tejaratnews",
    displayName: "تجارت نیوز",
    websiteUrl: "https://tejaratnews.com",
    iconUrl:
      "https://tejaratnews.com/wp-content/uploads/2022/05/cropped-tj-fav-512x512-2-180x180.png",
    categories: [
      {
        id: "all",
        category: "جدیدترین ها",
        rssUrl: "https://tejaratnews.com/feed",
      },
    ],
  },
  {
    name: "irna",
    displayName: "ایرنا",
    websiteUrl: "https://www.irna.ir",
    iconUrl:
      "https://www.irna.ir/resources/theme/irna/img/icons/apple-touch-icon-152x152.png",
    categories: [
      {
        id: "economic",
        category: "اقتصاد",
        rssUrl: "https://www.irna.ir/rss/tp/20",
      },
      {
        id: "sports",
        category: "ورزشی",
        rssUrl: "https://www.irna.ir/rss/tp/14",
      },
    ],
  },
  {
    name: "aftabnews",
    displayName: "آفتاب",
    websiteUrl: "https://aftabnews.ir",
    iconUrl: "https://aftabnews.ir/client/themes/fa/main/img/favicon.ico",
    categories: [
      {
        id: "art",
        category: "هنر",
        rssUrl: "https://aftabnews.ir/fa/rss/3",
      },
      {
        id: "health",
        category: "سلامت",
        rssUrl: "https://aftabnews.ir/fa/rss/6",
      },
      {
        id: "sports",
        category: "ورزشی",
        rssUrl: "https://aftabnews.ir/fa/rss/8",
      },
    ],
  },
  {
    name: "isna",
    displayName: "ایسنا",
    websiteUrl: "https://isna.ir",
    iconUrl: "https://www.isna.ir/resources/theme/isna/img/favicon.ico",
    categories: [
      {
        id: "art",
        category: "هنر",
        rssUrl: "https://www.isna.ir/rss/tp/20",
      },
      {
        id: "health",
        category: "سلامت",
        rssUrl: "https://www.isna.ir/rss/tp/50",
      },
      {
        id: "sports",
        category: "ورزشی",
        rssUrl: "https://www.isna.ir/rss/tp/24",
      },
      {
        id: "politics",
        category: "سیاست",
        rssUrl: "https://www.isna.ir/rss/tp/14",
      },
    ],
  },
  {
    name: "yjc",
    displayName: "باشگاه خبرنگاران جوان",
    websiteUrl: "https://www.yjc.ir",
    iconUrl: "https://cdn.yjc.ir/client/themes/fa/main/img/apple_touch180.png",
    categories: [
      {
        id: "art",
        category: "هنر",
        rssUrl: "https://www.yjc.ir/fa/rss/4",
      },
      {
        id: "economic",
        category: "اقتصاد",
        rssUrl: "https://www.yjc.ir/fa/rss/6",
      },
      {
        id: "sports",
        category: "ورزشی",
        rssUrl: "https://www.yjc.ir/fa/rss/8",
      },
    ],
  },
  {
    name: "entekhab",
    displayName: "انتخاب",
    websiteUrl: "https://www.entekhab.ir",
    iconUrl: "https://www.entekhab.ir/client/themes/fa/main/img/favicon.ico",
    categories: [
      {
        id: "art",
        category: "هنر",
        rssUrl: "https://www.entekhab.ir/fa/rss/18",
      },
      {
        id: "economic",
        category: "اقتصاد",
        rssUrl: "https://www.entekhab.ir/fa/rss/5",
      },
      {
        id: "politics",
        category: "سیاست",
        rssUrl: "https://www.entekhab.ir/fa/rss/2",
      },
      {
        id: "sports",
        category: "ورزشی",
        rssUrl: "https://www.entekhab.ir/fa/rss/9",
      },
    ],
  },
  {
    name: "snn",
    displayName: "خبرگزاری دانشجو",
    websiteUrl: "https://snn.ir",
    iconUrl: "https://snn.ir/client/themes/fa/main/img/favicon-152x152.png",
    categories: [
      {
        id: "economic",
        category: "اقتصاد",
        rssUrl: "https://snn.ir/fa/rss/7",
      },
      {
        id: "politics",
        category: "سیاست",
        rssUrl: "https://snn.ir/fa/rss/6",
      },
      {
        id: "sports",
        category: "ورزشی",
        rssUrl: "https://snn.ir/fa/rss/10",
      },
    ],
  },
  {
    name: "asriran",
    displayName: "عصر ایران",
    websiteUrl: "https://www.asriran.com",
    iconUrl: "https://www.asriran.com/client/themes/fa/main/img/favicon.ico",
    categories: [
      {
        id: "economic",
        category: "اقتصاد",
        rssUrl: "https://www.asriran.com/fa/rss/1/4",
      },
      {
        id: "politics",
        category: "سیاست",
        rssUrl: "https://www.asriran.com/fa/rss/1/1",
      },
      {
        id: "sports",
        category: "ورزشی",
        rssUrl: "https://www.asriran.com/fa/rss/1/6",
      },
      {
        id: "tech",
        category: "تکنولوژی",
        rssUrl: "https://www.asriran.com/fa/rss/1/14",
      },
    ],
  },
  {
    name: "eghtesadonline",
    displayName: "اقتصاد آنلاین",
    websiteUrl: "https://www.eghtesadonline.com",
    iconUrl:
      "https://www.eghtesadonline.com/client/themes/fa/main/img/favicon.ico",
    categories: [
      {
        id: "all",
        category: "جدیدترین ها",
        rssUrl: "https://www.eghtesadonline.com/fa/updates/allnews",
      },
    ],
  },
  {
    name: "digiato",
    displayName: "دیجیاتو",
    websiteUrl: "https://digiato.com",
    iconUrl:
      "https://static.digiato.com/digiato/2022/07/DigiatoVectorLogo.png.webp",
    categories: [
      {
        id: "tech",
        category: "تکنولوژی",
        rssUrl: "https://digiato.com/feed",
      },
    ],
  },
];
