export function getUUID(): string {
    const KeyValuePairArray: Array<Array<string>> = document.cookie
        .split(";")
        .map((e) => {
            e = e.trim();
            return e.split("=");
        });

    for (const [key, value] of KeyValuePairArray) {
        if (key === "uuid") {
            return value;
        }
    }

    return "";
}
