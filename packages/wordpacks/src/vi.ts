/**
 * Vietnamese word list for ClueGrid.
 * 200+ common nouns suitable for a word-deduction game.
 */
export const VI_WORDS: readonly string[] = [
  // Nature & Outdoors
  "NÚI", "SÔNG", "RỪNG", "BIỂN", "MƯA", "GIÓ", "ĐẤT", "CÁT", "LỬA", "NƯỚC",
  "ĐÁ", "ĐẢO", "HỒ", "THÁC", "MÂY", "TRỜI", "TRĂNG", "SAO", "MẶT TRỜI", "SẤM",
  "CHỚP", "THUNG LŨNG", "HANG ĐỘNG", "BÃI BIỂN", "BÃO", "LŨ LỤT", "SƯƠNG MÙ", "NÚI LỬA",
  // Animals
  "HỔ", "SƯ TỬ", "VOI", "CHÓ", "MÈO", "GÀ", "VỊT", "CHIM", "CÁ", "RÙA",
  "RẮN", "KHỈ", "CHUỘT", "GẤU", "THỎ", "NGỰA", "BÒ", "TRÂU", "DÊ", "CỪU",
  "HEO", "NAI", "CÁO", "SÓI", "ĐẠI BÀNG", "CÁ MẬP", "CÁ VOI", "KHỦNG LONG", "TÔM", "CUA",
  "MỰC", "ONG", "BƯỚM", "KIẾN", "RỒNG", "PHƯỢNG HOÀNG", "SÓC", "HÀ MÃ", "LẠC ĐÀ",
  // Objects & Tools
  "BÚA", "RÌU", "DAO", "KÉO", "THÌA", "ĐŨA", "CHÉN", "ĐĨA", "LY", "CHAI",
  "NỒI", "CHẢO", "THÙNG", "XÔ", "CHỔI", "BÀN CHẢI", "GƯƠNG", "LƯỢC", "CHÌA KHÓA", "KHÓA",
  "XÍCH", "DÂY THỪNG", "LƯỚI", "VƯƠNG MIỆN", "KIẾM", "KHIÊN", "CUNG", "TÊN", "SÚNG", "ĐẠN",
  "ĐÈN", "NẾN", "LA BÀN", "BẢN ĐỒ", "SÁCH", "VỞ", "BÚT", "THƯỚC", "TÚI", "VÍ",
  "ĐỒNG HỒ", "KÍNH", "MŨ", "ÁO", "QUẦN", "GIÀY", "DÉP", "CHIẾU", "GIƯỜNG", "GHẾ",
  "BÀN", "TỦ", "ĐIỆN THOẠI", "MÁY TÍNH", "TIVI", "QUẠT", "BÀN LÀ", "KỆ", "CHUÔNG", "Ý BÀN",
  // Places & Structures
  "NHÀ", "TRƯỜNG", "CHỢ", "CHÙA", "NHÀ THỜ", "CẦU", "ĐƯỜNG", "PHỐ", "CỔNG", "CỬA",
  "CỬA SỔ", "TƯỜNG", "MÁI NHÀ", "VƯỜN", "CÔNG VIÊN", "BỆNH VIỆN", "NHÀ GA", "SÂN BAY", "KHÁCH SẠN", "LÂU ĐÀI",
  "CUNG ĐIỆN", "THÁP", "NHÀ KHO", "BẢO TÀNG", "THƯ VIỆN", "NGÂN HÀNG", "CỬA HÀNG", "HIỆU THUỐC", "RẠP PHIM", "NHÀ HÁT",
  // Food & Drink
  "CƠM", "BÁNH", "SỮA", "TRÀ", "CÀ PHÊ", "BIA", "RƯỢU", "THỊT", "RAU", "QUẢ",
  "TÁO", "CHUỐI", "CAM", "CHANH", "XOÀI", "DƯA HẤU", "NHO", "DỪA", "TRỨNG", "BƠ",
  "PHÔ MAI", "MUỐI", "ĐƯỜNG", "MẬT ONG", "KẸO", "KEM", "SÚP", "CHÁO", "GIA VỊ",
  // People & Society
  "VUA", "NỮ HOÀNG", "CÔNG CHÚA", "HOÀNG TỬ", "BÁC SĨ", "Y TÁ", "GIÁO VIÊN", "HỌC SINH", "CẢNH SÁT", "BỘ ĐỘI",
  "CA SĨ", "DIỄN VIÊN", "HỌA SĨ", "NHÀ THƠ", "ĐẦU BẾP", "KỸ SƯ", "LÁI XE", "PHI CÔNG", "THỦ THỦ", "NÔNG DÂN",
  "CÔNG NHÂN", "GIÁN ĐIỆP", "THẦY CHÙA", "CHA XỨ", "VÕ SĨ", "HIỆP SĨ", "PHÙ THỦY",
  // Concepts & Abstracts
  "TÌNH YÊU", "BẠN BÈ", "CHIẾN TRANH", "HÒA BÌNH", "GIẤC MƠ", "LINH HỒN", "BÓNG TỐI", "ÁNH SÁNG", "LỜI NGUYỀN", "BÍ MẬT",
  "THỜI GIAN", "SỨC MẠNH", "CHIẾN THẮNG", "THẤT BẠI", "ÂM NHẠC", "PHÉP THUẬT", "VŨ TRỤ", "TRÁI ĐẤT", "QUÁ KHỨ", "TƯƠNG LAI",
  "SỰ THẬT", "LỜI HỨA", "KỶ NIỆM", "HY VỌNG", "NỖI SỢ", "HẠNH PHÚC"
] as const;

export type ViWord = (typeof VI_WORDS)[number];
