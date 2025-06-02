import * as Speech from "expo-speech";

export function speakText(text: string) {
  Speech.speak(text, {
    language: "ko-KR",
    rate: 1.0,
    pitch: 1.0,
  });
}
