import { Base64 } from "@/util/Base64";

export function decodeEV1Video(chunks: Uint8Array[]): Uint8Array[] {
    console.debug("Decoding video");
    let counter = 0;
    for (const chunk of chunks) {
        for (const [index, byte] of chunk.entries()) {
            if (counter >= 100) {
                return chunks;
            }
            chunk[index] = ~byte;
            ++counter;
        }
    }
    return chunks;
}

export function decodeBJCloudVODURL(url: string): string | undefined {
    const prefix = "bjcloudvod://";

    url = url.trim();
    if (url === "" || !url.startsWith(prefix)) {
        return;
    }

    url = url
        .slice(prefix.length, url.length)
        .replace(/-/g, "+")
        .replace(/_/g, "/");

    const padding = url.length % 4;
    if (padding == 2) {
        url += "==";
    } else if (padding == 3) {
        url += "=";
    }

    url = new Base64().decode(url);

    const factor = url.charCodeAt(0);
    const c = factor % 8;
    url = url.slice(1, url.length);

    const result = [];
    for (let i = 0, char; (char = url[i]); ++i) {
        const step = (i % 4) * c + (i % 3) + 1;
        result.push(String.fromCharCode(char.charCodeAt(0) - step));
    }

    return result.join("");
}
