import type { Ref } from "vue";
import { ref } from "vue";
import { decode } from "@/composibles/Decoder";

export type Saver = () => void;
export type Remover = () => void;

type DownloadTableEntry = {
    key: number;
    url: string;
    filename: string;
    progress: number;
    saver: Saver;
    remover: Remover;
};

type DownloadStatus = "cancelled" | "finished" | "error" | undefined;

type DownloadResultEntry = {
    key: number;
    status: DownloadStatus;
    blobURL: string;
};

type DownloadControlContext = {
    cancel: boolean;
};

export class DownloadManager {
    #viewMap: Ref<Map<number, DownloadTableEntry>>;
    #resultMap: Map<number, DownloadResultEntry>;
    #controlContextMap: Map<number, DownloadControlContext>;
    #keyCounter = 0;

    constructor() {
        this.#viewMap = ref<Map<number, DownloadTableEntry>>(
            new Map<number, DownloadTableEntry>()
        );
        this.#resultMap = new Map<number, DownloadResultEntry>();
        this.#controlContextMap = new Map<number, DownloadControlContext>();
    }

    get view(): IterableIterator<DownloadTableEntry> {
        return this.#viewMap.value.values();
    }

    async download(url: string): Promise<DownloadStatus> {
        let filename = "未命名";
        const matchArray = url.match(/^.*\/(.*)\.(.*)\?.*$/);
        if (matchArray) {
            filename = matchArray[1];
        }

        const key = this.#keyCounter++;

        this.#controlContextMap.set(key, {
            cancel: false
        });

        this.#viewMap.value.set(key, {
            key: key,
            url: url,
            filename: filename + ".flv",
            progress: 0,
            remover: this.#removerGenerator(key),
            saver: this.#saverGenerator(key)
        });

        const result = await this.#download(key);
        if (result.status === "finished") {
            this.#resultMap.set(key, result);
            this.#viewMap.value.get(key)!.progress = 100;
        }

        this.#controlContextMap.delete(key);
        return result.status;
    }

    async #download(key: number): Promise<DownloadResultEntry> {
        const entry: DownloadResultEntry = {
            key: key,
            status: undefined,
            blobURL: ""
        };
        try {
            const url: string = this.#viewMap.value.get(key)!.url;
            const response = await fetch(url);
            const reader = response.body!.getReader();
            const contentLength: number =
                +response.headers.get("Content-Length")!;
            const chunks: Uint8Array[] = [];
            const context = this.#controlContextMap.get(key)!;

            let receivedLength = 0;
            for (;;) {
                const { done, value } = await reader.read();
                if (done) {
                    console.debug("Received all chunks");
                    break;
                }

                if (context.cancel) {
                    console.debug("Download cancelled");
                    entry.status = "cancelled";
                    return entry;
                }

                chunks.push(value);
                receivedLength += value.length;
                this.#viewMap.value.get(key)!.progress =
                    (99 * receivedLength) / contentLength;
                console.debug(`Received ${receivedLength} of ${contentLength}`);
            }

            const blob = new Blob(decode(chunks), {
                type: "application/octet-stream"
            });
            entry.blobURL = URL.createObjectURL(blob);
            console.debug("Created blob URL");
            entry.status = "finished";
        } catch (e) {
            console.error(e);
            entry.status = "error";
        }

        return entry;
    }

    #saverGenerator(key: number): Saver {
        return () => {
            const filename = this.#viewMap.value.get(key)!.filename;
            const blobURL = this.#resultMap.get(key)!.blobURL;

            const downloadAnchor = document.createElement("a");
            downloadAnchor.style.display = "none";
            downloadAnchor.href = blobURL;
            downloadAnchor.download = filename;

            document.body.appendChild(downloadAnchor);
            downloadAnchor.click();
            document.body.removeChild(downloadAnchor);
        };
    }

    #removerGenerator(key: number): Remover {
        return () => {
            if (this.#controlContextMap.has(key)) {
                this.#controlContextMap.get(key)!.cancel = true;
            }

            if (this.#resultMap.has(key)) {
                const blobURL = this.#resultMap.get(key)!.blobURL;
                URL.revokeObjectURL(blobURL);
                console.debug("Revoked blob URL");
                this.#resultMap.delete(key);
            }

            this.#viewMap.value.delete(key);
        };
    }
}
