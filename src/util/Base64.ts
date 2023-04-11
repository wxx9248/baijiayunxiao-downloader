export class Base64 {
    static PADDING: string = "=";
    static ALPHABET: string =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

    decode(s: string): string {
        let padding = 0;
        let upperBound = s.length;
        const array = [];

        if (upperBound === 0) {
            return "";
        }

        if (upperBound % 4 !== 0) {
            return "";
        }

        if (s.charAt(upperBound - 1) === Base64.PADDING) {
            padding = 1;
            if (s.charAt(upperBound - 2) === Base64.PADDING) {
                padding = 2;
            }
            upperBound -= 4;
        }

        let i, b10;
        for (i = 0; i < upperBound; i += 4) {
            b10 =
                (this.#getBase64Index(s, i) << 18) |
                (this.#getBase64Index(s, i + 1) << 12) |
                (this.#getBase64Index(s, i + 2) << 6) |
                this.#getBase64Index(s, i + 3);
            array.push(
                String.fromCharCode(b10 >> 16, (b10 >> 8) & 255, b10 & 255)
            );
        }

        switch (padding) {
            case 1:
                b10 =
                    (this.#getBase64Index(s, i) << 18) |
                    (this.#getBase64Index(s, i + 1) << 12) |
                    (this.#getBase64Index(s, i + 2) << 6);
                array.push(String.fromCharCode(b10 >> 16, (b10 >> 8) & 255));
                break;
            case 2:
                b10 =
                    (this.#getBase64Index(s, i) << 18) |
                    (this.#getBase64Index(s, i + 1) << 12);
                array.push(String.fromCharCode(b10 >> 16));
                break;
        }

        return array.join("");
    }

    encode(s: string): string {
        const upperBound = s.length - (s.length % 3);
        const array = [];

        if (s.length === 0) {
            return "";
        }

        let i, b10;
        for (i = 0; i < upperBound; i += 3) {
            b10 =
                (this.#getBase64Index(s, i) << 16) |
                (this.#getBase64Index(s, i + 1) << 8) |
                this.#getBase64Index(s, i + 2);
            array.push(Base64.ALPHABET.charAt(b10 >> 18));
            array.push(Base64.ALPHABET.charAt((b10 >> 12) & 63));
            array.push(Base64.ALPHABET.charAt((b10 >> 6) & 63));
            array.push(Base64.ALPHABET.charAt(b10 & 63));
        }

        switch (s.length - upperBound) {
            case 1:
                b10 = this.#getBase64Index(s, i) << 16;
                array.push(
                    Base64.ALPHABET.charAt(b10 >> 18) +
                        Base64.ALPHABET.charAt((b10 >> 12) & 63) +
                        Base64.PADDING +
                        Base64.PADDING
                );
                break;
            case 2:
                b10 =
                    (this.#getBase64Index(s, i) << 16) |
                    (this.#getBase64Index(s, i + 1) << 8);
                array.push(
                    Base64.ALPHABET.charAt(b10 >> 18) +
                        Base64.ALPHABET.charAt((b10 >> 12) & 63) +
                        Base64.ALPHABET.charAt((b10 >> 6) & 63) +
                        Base64.PADDING
                );
                break;
        }

        return array.join("");
    }

    #getBase64Index(s: string, i: number): number {
        return Base64.ALPHABET.indexOf(s.charAt(i));
    }
}
