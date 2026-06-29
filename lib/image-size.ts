/**
 * Bağımlılıksız görsel ölçü okuyucu — PNG, JPEG ve WebP header'larından
 * genişlik/yükseklik çıkarır. Sunucu tarafı doğrulama için (sharp yok).
 * Çözülemezse null döner.
 */
export function imageSize(buf: Buffer): { width: number; height: number } | null {
  if (buf.length < 24) return null;

  // --- PNG: 89 50 4E 47 0D 0A 1A 0A, IHDR width@16 height@20 (BE) ---
  if (
    buf[0] === 0x89 &&
    buf[1] === 0x50 &&
    buf[2] === 0x4e &&
    buf[3] === 0x47
  ) {
    return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
  }

  // --- JPEG: FF D8 ... SOF marker ---
  if (buf[0] === 0xff && buf[1] === 0xd8) {
    let off = 2;
    while (off < buf.length - 8) {
      if (buf[off] !== 0xff) {
        off++;
        continue;
      }
      const marker = buf[off + 1];
      // SOF0..SOF15 (boyut taşıyan), DHP hariç DAC/DHT/DRI değil
      const isSOF =
        marker >= 0xc0 &&
        marker <= 0xcf &&
        marker !== 0xc4 &&
        marker !== 0xc8 &&
        marker !== 0xcc;
      if (isSOF) {
        const height = buf.readUInt16BE(off + 5);
        const width = buf.readUInt16BE(off + 7);
        return { width, height };
      }
      // segment uzunluğunu atla
      const len = buf.readUInt16BE(off + 2);
      if (len < 2) return null;
      off += 2 + len;
    }
    return null;
  }

  // --- WebP: RIFF....WEBP ---
  if (
    buf.toString("ascii", 0, 4) === "RIFF" &&
    buf.toString("ascii", 8, 12) === "WEBP"
  ) {
    const fmt = buf.toString("ascii", 12, 16);
    if (fmt === "VP8 ") {
      // lossy: frame tag sonrası 0x9d 0x01 0x2a, sonra 14-bit w/h (LE)
      const width = buf.readUInt16LE(26) & 0x3fff;
      const height = buf.readUInt16LE(28) & 0x3fff;
      return { width, height };
    }
    if (fmt === "VP8L") {
      // lossless: 0x2f sonrası 14-bit w-1, 14-bit h-1 (LE bit-packed)
      const b0 = buf[21];
      const b1 = buf[22];
      const b2 = buf[23];
      const b3 = buf[24];
      const width = 1 + (((b1 & 0x3f) << 8) | b0);
      const height = 1 + (((b3 & 0x0f) << 10) | (b2 << 2) | ((b1 & 0xc0) >> 6));
      return { width, height };
    }
    if (fmt === "VP8X") {
      // extended: canvas (w-1) 24-bit LE @24, (h-1) @27
      const width = 1 + (buf[24] | (buf[25] << 8) | (buf[26] << 16));
      const height = 1 + (buf[27] | (buf[28] << 8) | (buf[29] << 16));
      return { width, height };
    }
  }

  return null;
}
