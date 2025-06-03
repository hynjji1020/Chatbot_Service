import * as Speech from "expo-speech";

// ✅ 텍스트 정리 함수 (기호 제거, 줄바꿈 처리, 공백 정리)
function cleanTextForTTS(text: string): string {
  return text
    .replace(/\n/g, ". ") // ✅ 줄바꿈 → 마침표 + 공백
    .replace(/[*_~`#>\-=:+|{}[\]<>]/g, " ") // ✅ 마크다운 및 기호 제거 → 공백
    .replace(/[^가-힣a-zA-Z0-9\s.?!]/g, " ") // ✅ 이모지 및 특수문자 제거 → 공백
    .replace(/\s{2,}/g, " ") // ✅ 공백 2개 이상 → 1개
    .trim(); // ✅ 앞뒤 공백 제거
}

// ✅ 음성 출력 함수
export function speakText(text: string) {
  const cleaned = cleanTextForTTS(text); // 텍스트 정제 후 말하기
  Speech.speak(cleaned, {
    language: "ko-KR",
    rate: 0.95, // 조금 천천히 읽게 하면 더 자연스러움 (원하면 조절 가능)
    pitch: 1.0, // 음성 톤 기본
  });
}
