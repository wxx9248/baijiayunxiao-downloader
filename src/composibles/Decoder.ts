export function decode(chunks: Uint8Array[]): Uint8Array[] {
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
