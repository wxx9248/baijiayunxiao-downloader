<script lang="ts" setup>
import type { Ref } from "vue";
import { ref } from "vue";
import { AlertController } from "@/composibles/AlertController";
import { DownloadManager } from "@/composibles/DownloadManager";
import { unsafeWindow } from "vite-plugin-monkey/dist/client";
import type { VideoInfo, VideoSource } from "@/util/VideoInfoExtration";
import { extractVideoInfo } from "@/util/VideoInfoExtration";
import { getUUID } from "@/util/UUID";
import { toHumanReadableSize } from "@/util/UnitConversion";

const currentVideoInfo: Ref<VideoInfo> = ref({
    videoID: "",
    title: "",
    sources: []
});

const showSourceList: Ref<boolean> = ref(false);

// Alerts
const alertController = new AlertController();

// JQuery AJAX hook
// @ts-ignore
const originalAJAX = unsafeWindow["$"].ajax;
// @ts-ignore
unsafeWindow["$"].ajax = (settings: object) => {
    // @ts-ignore
    const originalSuccess = settings.success;
    // @ts-ignore
    settings.success = (data: object, textStatus: string, jqXHR: any) => {
        currentVideoInfo.value = extractVideoInfo(data);
        alertController.info(`检测到视频: ${currentVideoInfo.value.title}`);
        alertController.show();
        originalSuccess(data, textStatus, jqXHR);
    };
    originalAJAX(settings);
};

// Downloading
const downloadManager = new DownloadManager();

async function sourceListClickHandler(source: VideoSource) {
    const uuid = getUUID();

    let url = source.url;
    if (uuid !== "") {
        url += `?uuid=${uuid}`;
    }

    let filename = currentVideoInfo.value.title;
    const matchMap = filename.match(/(.*)\..*/);
    if (matchMap && matchMap.length > 1) {
        filename = matchMap[1];
    }

    const extension = source.format;

    const status = await downloadManager.download(url, filename, extension);
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
        <v-table class="rounded" theme="dark">
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
        <v-list class="source-list rounded" theme="dark">
            <v-list-item
                v-for="source in currentVideoInfo.sources"
                :key="source.url"
                :title="`${source.definition} ${
                    source.format
                } ${toHumanReadableSize(source.size, 1)}`"
                @click="sourceListClickHandler(source)"
            ></v-list-item>
        </v-list>
        <v-btn
            :disabled="currentVideoInfo.videoID === ''"
            color="blue"
            icon="mdi-download-box"
            @click="showSourceList = !showSourceList"
        />
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

    display: flex;
    flex-direction: column;
    align-items: flex-end;
    z-index: 10000000000;
}

.bottom-right * {
    margin: 5px;
}

.source-list {
    display: v-bind('showSourceList ? "block": "none"');
}
</style>
