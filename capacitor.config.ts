import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.didban.app",
  appName: "Didban",
  webDir: ".next",
  server: {
    url: "http://192.168.1.102:3000",
    cleartext: true,
  },
};

export default config;
