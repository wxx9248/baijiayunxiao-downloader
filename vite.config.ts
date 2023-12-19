import { fileURLToPath, URL } from "node:url";

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import monkey, { cdn } from "vite-plugin-monkey";

import vuetify from "vite-plugin-vuetify";

// https://vitejs.dev/config/
export default defineConfig({
    build: {
        cssMinify: true
    },
    plugins: [
        vue(),
        vuetify({ autoImport: true }),
        monkey({
            entry: "src/main.ts",
            userscript: {
                name: {
                    "": "百家云网校视频下载器"
                },
                description: {
                    "": "下载并解码百家云网校的EV1视频"
                },
                icon: "https://baijiayunxiao.com/favicon.ico",
                author: "wxx9248",
                license: "BSD-3-Clause",
                namespace: "npm/vite-plugin-monkey",
                match: ["https://*.baijiayunxiao.com/*"],
                homepage: "https://github.com/wxx9248/baijiayunxiao-downloader",
                website: "https://github.com/wxx9248/baijiayunxiao-downloader",
                updateURL:
                    "https://github.com/wxx9248/baijiayunxiao-downloader/releases/download/latest/baijiayunxiao-downloader.user.js",
                downloadURL:
                    "https://github.com/wxx9248/baijiayunxiao-downloader/releases/download/latest/baijiayunxiao-downloader.user.js",
                supportURL:
                    "https://github.com/wxx9248/baijiayunxiao-downloader/discussions",
                "run-at": "document-body"
            },
            build: {
                externalGlobals: {
                    vue: cdn.jsdelivr("Vue", "dist/vue.global.prod.js")
                }
            }
        })
    ],
    resolve: {
        alias: {
            "@": fileURLToPath(new URL("./src", import.meta.url))
        }
    }
});
