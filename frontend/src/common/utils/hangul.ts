// 한글 초성 추출 + 검색 매칭 유틸
// 예: getChosung("프랑스") === "ㅍㄹㅅ"
// "국가 이름 검색창에 초성만 쳐도 나오게" 요구사항용 (뱃지 도감 국가 검색 등에서 사용)

const CHOSUNG_LIST = [
  "ㄱ", "ㄲ", "ㄴ", "ㄷ", "ㄸ", "ㄹ", "ㅁ", "ㅂ", "ㅃ", "ㅅ",
  "ㅆ", "ㅇ", "ㅈ", "ㅉ", "ㅊ", "ㅋ", "ㅌ", "ㅍ", "ㅎ",
];

const HANGUL_BASE = 0xac00; // '가'
const HANGUL_LAST = 0xd7a3; // '힣'
const CHOSUNG_UNIT = 588; // 종성 28 * 중성 21

/** 문자열에서 한글 음절만 초성으로 변환하고, 한글이 아닌 문자는 그대로 둔다 */
export function getChosung(text: string): string {
  let result = "";
  for (const ch of text) {
    const code = ch.charCodeAt(0) - HANGUL_BASE;
    if (code >= 0 && code <= HANGUL_LAST - HANGUL_BASE) {
      const chosungIndex = Math.floor(code / CHOSUNG_UNIT);
      result += CHOSUNG_LIST[chosungIndex];
    } else {
      result += ch;
    }
  }
  return result;
}

/** 검색어가 초성으로만 이뤄져 있는지 (ㄱ~ㅎ만 있으면 true) */
function isChosungOnly(text: string): boolean {
  return /^[ㄱ-ㅎ]+$/.test(text);
}

/**
 * query가 target에 매칭되는지 검사.
 * - query가 초성만으로 이뤄져 있으면(예: "ㅍㄹㅅ") target의 초성에 포함되는지로 비교
 * - 아니면 일반 부분 문자열 포함 여부로 비교 (대소문자 무시)
 */
export function matchesKoreanSearch(query: string, target: string): boolean {
  const trimmed = query.trim();
  if (!trimmed) return true;

  if (isChosungOnly(trimmed)) {
    return getChosung(target).includes(trimmed);
  }
  return target.toLowerCase().includes(trimmed.toLowerCase());
}
