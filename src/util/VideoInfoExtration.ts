import { decodeBJCloudVODURL } from "@/util/Decoding";

export type VideoSource = {
    url: string;
    format: string;
    definition: string;
    size: number;
};

export type VideoInfo = {
    videoID: string;
    title: string;
    sources: VideoSource[];
};

type CDNListInfo = {
    url: string;
    size: number;
};

export function extractVideoInfo(json: object): VideoInfo {
    const videoID = json["data"]["video_id"];
    const title = json["data"]["video_info"]["title"];
    const sources: VideoSource[] = [];

    const playInfo = json["data"]["all_format_play_info"];
    for (const format in playInfo) {
        for (const definition in playInfo[format]) {
            getCDNListInfo(playInfo[format][definition]["cdn_list"]).map(
                (value) => {
                    sources.push({
                        url: value.url,
                        format: format,
                        definition: definition,
                        size: value.size
                    });
                }
            );
        }
    }

    return {
        videoID: videoID,
        title: title,
        sources: sources
    };
}

function getCDNListInfo(cdnList: object[]): CDNListInfo[] {
    return cdnList.map((value) => {
        let url = value.url;
        if (url === "") {
            url = decodeBJCloudVODURL(value["enc_url"]);
        }
        if (!url) {
            throw new Error(`不能解码URL: ${url}`);
        }
        return {
            url: url,
            size: value["size"]
        };
    });
}
