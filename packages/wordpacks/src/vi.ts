/**
 * WARNING: These words need native-speaker review before going live.
 * Do not rely on machine translation for gameplay words.
 *
 * Vietnamese word list for ClueGrid.
 * Curated list of common nouns suitable for word deduction.
 */
export const VI_WORDS: readonly string[] = [
  "NÚI",
  "SÔNG",
  "RỪNG",
  "ĐẠI DƯƠNG",
  "ĐẢO",
  "SƯ TỬ",
  "ĐẠI BÀNG",
  "CÁ MẬP",
  "ĐỒNG HỒ",
  "VƯƠNG MIỆN",
  "CHÌA KHÓA",
  "KHÓA",
  "KHIÊN",
  "KIẾM",
  "LÂU ĐÀI",
  "THÁP",
  "TRƯỜNG HỌC",
  "BỆNH VIỆN",
  "TÁO",
  "BÁNH MÌ",
  "SỮA",
  "TRÀ",
  "VÀNG",
  "BẠC",
  "SẮT",
  "MẶT TRỜI",
  "MẶT TRĂNG",
  "NGÔI SAO",
  "LỬA",
  "NƯỚC"
] as const;

export type ViWord = (typeof VI_WORDS)[number];
