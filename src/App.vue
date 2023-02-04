<script lang="ts" setup>
import { ref } from "vue";
import { unsafeWindow } from "vite-plugin-monkey/dist/client";
import { AlertController } from "@/composibles/AlertController";
import { DownloadManager } from "@/composibles/DownloadManager";

let currentVideoURL = ref("");

// Alerts
const alertController = new AlertController();

// fetch() API hook
const originalFetch = unsafeWindow.window.fetch;
unsafeWindow.window.fetch = async (
    // eslint-disable-next-line no-undef
    resource: RequestInfo | URL,
    // eslint-disable-next-line no-undef
    options?: RequestInit
): Promise<Response> => {
    const response = await originalFetch(resource, options);
    if (response.url.includes(".ev1")) {
        console.debug("Detected URL: " + response.url);
        currentVideoURL.value = response.url;

        let matchArray = response.url.match(/.*\/(.*?\.ev1)/);
        alertController.error("检测到视频链接，但正则表达式匹配失败");
        if (matchArray) {
            alertController.info("检测到视频: " + matchArray[1]);
            alertController.show();
        }
    }
    return response;
};

// Downloading
const downloadManager = new DownloadManager();

async function downloadHandler() {
    const status = await downloadManager.download(currentVideoURL.value);
    if (status === "error") {
        alertController.error("视频下载失败");
    }
}
</script>

<template>
    <link
        href="https://cdn.jsdelivr.net/npm/@mdi/font/css/materialdesignicons.min.css"
        rel="stylesheet"
    />
    <div class="top">
        <v-fade-transition>
            <v-alert
                v-model="alertController.state.show"
                :closable="alertController.state.closable"
                :type="alertController.state.type"
                density="compact"
                max-width="50rem"
            >
                {{ alertController.state.text }}
            </v-alert>
        </v-fade-transition>
    </div>
    <div class="bottom-left">
        <v-table theme="dark">
            <thead>
            <tr>
                <th class="text-left" style="width: 70%">文件名</th>
                <th class="text-left" style="width: 10%">进度</th>
                <th class="text-left" style="width: 10%">保存</th>
                <th class="text-left" style="width: 10%">移除</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="entry in downloadManager.view" :key="entry.key">
                <td>{{ entry.filename }}</td>
                <td>{{ entry.progress.toFixed(1) + "%" }}</td>
                <td>
                    <v-btn
                        :disabled="entry.progress < 100"
                        icon="mdi-content-save"
                        @click="entry.saver"
                    ></v-btn>
                </td>
                <td>
                    <v-btn icon="mdi-close" @click="entry.remover"></v-btn>
                </td>
            </tr>
            </tbody>
        </v-table>
    </div>

    <div class="bottom-right">
        <v-fade-transition>
            <v-btn
                :disabled="currentVideoURL === ''"
                color="blue"
                icon="mdi-download-box"
                @click="downloadHandler"
            />
        </v-fade-transition>
    </div>
</template>

<style scoped>
.top {
    left: 0;
    position: absolute;
    right: 0;
    top: 10px;
    display: flex;
    justify-content: center;
    z-index: 1000;
}

.bottom-left {
    position: fixed;
    bottom: 0;
    left: 0;
    max-width: 50%;
}

.bottom-right {
    margin: 20px;
    position: fixed;
    bottom: 0;
    right: 0;
}
</style>
