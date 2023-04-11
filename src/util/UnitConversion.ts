export function toHumanReadableSize(
    size: number,
    decimalPoint: number
): string {
    const unit = 1024;
    const units = ["B", "KiB", "MiB", "GiB", "TiB", "PiB", "EiB", "ZiB", "YiB"];

    let i = 0;
    const epsilon = 10 ** decimalPoint;

    while (
        Math.round(Math.abs(size * epsilon)) / epsilon >= unit &&
        i < units.length
    ) {
        size /= unit;
        ++i;
    }

    return size.toFixed(decimalPoint) + units[i];
}
