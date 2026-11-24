/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

function rotl(x: number, n: number) {
  return (x << n) | (x >>> (32 - n));
}

function sha1(message: string): string {
  const bytes = new TextEncoder().encode(message);
  const words = new Uint32Array((((bytes.length + 8) >> 6) + 1) * 16);
  bytes.forEach((b, i) => (words[i >> 2] |= b << (24 - (i % 4) * 8)));
  words[bytes.length >> 2] |= 0x80 << (24 - (bytes.length % 4) * 8);
  words[words.length - 2] = Math.floor(bytes.length / 0x20000000);
  words[words.length - 1] = bytes.length * 8;

  const h = [0x67452301, 0xefcdab89, 0x98badcfe, 0x10325476, 0xc3d2e1f0];
  const w = new Uint32Array(80);
  for (let block = 0; block < words.length; block += 16) {
    for (let t = 0; t < 80; t++) {
      w[t] =
        t < 16
          ? words[block + t]
          : rotl(w[t - 3] ^ w[t - 8] ^ w[t - 14] ^ w[t - 16], 1);
    }
    let [a, b, c, d, e] = h;
    for (let t = 0; t < 80; t++) {
      let f: number;
      let k: number;
      if (t < 20) {
        f = (b & c) | (~b & d);
        k = 0x5a827999;
      } else if (t < 40) {
        f = b ^ c ^ d;
        k = 0x6ed9eba1;
      } else if (t < 60) {
        f = (b & c) | (b & d) | (c & d);
        k = 0x8f1bbcdc;
      } else {
        f = b ^ c ^ d;
        k = 0xca62c1d6;
      }
      const temp = (rotl(a, 5) + f + e + k + w[t]) >>> 0;
      e = d;
      d = c;
      c = rotl(b, 30);
      b = a;
      a = temp;
    }
    h[0] = (h[0] + a) >>> 0;
    h[1] = (h[1] + b) >>> 0;
    h[2] = (h[2] + c) >>> 0;
    h[3] = (h[3] + d) >>> 0;
    h[4] = (h[4] + e) >>> 0;
  }
  return h.map((x) => x.toString(16).padStart(8, "0")).join("");
}

export function hashArray(arr: string[]) {
  const hashed = arr.map(sha1);
  hashed.sort();
  return sha1(hashed.join());
}

type Persistence = false | "localStorage" | "sessionStorage" | undefined;

export function createStorage(persistence: Persistence): Storage {
  if (persistence === false) {
    return {
      getItem: () => null,
      setItem: () => {},
      clear: () => {},
      key: () => null,
      removeItem: () => {},
      length: 0,
    };
  }

  if (persistence === "sessionStorage") {
    return sessionStorage;
  }

  return localStorage;
}
