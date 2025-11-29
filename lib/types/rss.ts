export interface RSSCategory {
  id: string;
  category: string;
  rssUrl: string;
}

export interface RSSSource {
  name: string;
  displayName: string;
  websiteUrl: string;
  iconUrl: string;
  categories: RSSCategory[];
}
