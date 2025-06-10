import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { speakText, stopTTS } from "../../components/speakText";
import { getColors } from "../../constants/Colors";
import { useTheme } from "../../context/ThemeContext";

type Message = {
  id: string;
  text: string;
  timestamp: Date;
  sender: "user" | "bot";
};

export default function ChatScreen() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      sender: "bot",
      timestamp: new Date(),
      text: `안녕하세요!\n고객님의 건강 관리를 도와드릴 건강 도우미 ‘건강이’입니다.\n증상이나 통증 부위를 입력해 주세요. (예: 무릎이 아파요)\n\n고객님과 가까운 병원을 안내드리기 위해\n현재 거주 중이신 지역(동까지)을 입력해 주세요.`,
    },
  ]);

  const [input, setInput] = useState("");
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const scrollViewRef = useRef<ScrollView>(null);
  const router = useRouter();

  const { theme } = useTheme();
  const colors = getColors(theme);

  useEffect(() => {
    const keyboardListener = Keyboard.addListener("keyboardDidShow", () => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    });
    return () => keyboardListener.remove();
  }, []);

  // ✅ 메시지 생길 때만 TTS 실행
  useEffect(() => {
    const last = messages[messages.length - 1];
    if (last?.sender === "bot" && ttsEnabled) {
      speakText(last.text, true);
    }
  }, [messages, ttsEnabled]);

  // ✅ TTS 끄기 상태일 때 강제 중단
  useEffect(() => {
    if (!ttsEnabled) {
      stopTTS();
    }
  }, [ttsEnabled]);

  // ✅ 화면 나갈 때 TTS 중단만
  useFocusEffect(
    useCallback(() => {
      return () => {
        stopTTS(); // 재생은 제거
      };
    }, [])
  );

  const handleSend = async () => {
    if (input.trim()) {
      const userMessage: Message = {
        id: Date.now().toString(),
        text: input.trim(),
        timestamp: new Date(),
        sender: "user",
      };

      setMessages((prev) => [...prev, userMessage]);
      setInput("");

      const botText = await getBotReply(input.trim()); // ✅ await 추가!

      const botReply: Message = {
        id: (Date.now() + 1).toString(),
        text: botText,
        timestamp: new Date(),
        sender: "bot",
      };

      setMessages((prev) => [...prev, botReply]);
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }
  };

  const getBotReply = async (userText: string): Promise<string> => {
    try {
      const response = await fetch(
        "https://5e36-203-237-143-104.ngrok-free.app/recommend",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: userText,
            location: "서울", // 나중에 필요하면 사용자 입력값으로 교체 가능
          }),
        }
      );

      const data = await response.json();

      console.log("📦 서버 응답:", data); // ← 디버깅용

      // ✅ matched_department가 있는 유효한 병원만 찾기
      const firstValid = data.recommendations.find(
        (_item: any, index: number) => data.matched_department?.[index]
      );

      if (firstValid) {
        const index = data.recommendations.indexOf(firstValid);
        const dept = data.matched_department?.[index] || "추천과 없음";

        return `${firstValid.name} (${firstValid.location})를 추천합니다.\n추천 진료과: ${dept}`;
      } else {
        return "죄송합니다. 해당 증상에 맞는 병원을 찾지 못했어요.";
      }
    } catch (error) {
      console.error("❌ getBotReply 에러:", error);
      return "서버 연결 중 문제가 발생했어요.";
    }
  };

  const formatTime = (date: Date) => {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours < 12 ? "오전" : "오후";
    const h = hours % 12 === 0 ? 12 : hours % 12;
    const m = minutes.toString().padStart(2, "0");
    return `${ampm} ${h}:${m}`;
  };

  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const days = ["일", "월", "화", "수", "목", "금", "토"];
    const dayName = days[date.getDay()];
    return `${year}년 ${month}월 ${day}일 (${dayName})`;
  };

  const isSameDate = (d1: Date, d2: Date) =>
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
    >
      <View style={styles.headerContainer}>
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: colors.tint }]}
          onPress={() => {
            stopTTS();
            router.back();
          }}
        >
          <Text style={[styles.backText, { color: colors.buttonText }]}>
            ← 뒤로
          </Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>건강이</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={{ paddingBottom: 16 }}
        keyboardShouldPersistTaps="handled"
      >
        {messages.map((msg, index) => {
          const showDateHeader =
            index === 0 ||
            !isSameDate(msg.timestamp, messages[index - 1].timestamp);
          const isBot = msg.sender === "bot";

          return (
            <View key={msg.id}>
              {showDateHeader && (
                <View style={styles.dateHeader}>
                  <Text
                    style={[
                      styles.dateHeaderText,
                      {
                        backgroundColor: colors.highlight,
                        color: colors.buttonText,
                      },
                    ]}
                  >
                    {formatDate(msg.timestamp)}
                  </Text>
                </View>
              )}

              <View
                style={[
                  styles.messageBlock,
                  isBot ? styles.botAlign : styles.userAlign,
                ]}
              >
                {isBot && (
                  <Text style={[styles.botName, { color: colors.tint }]}>
                    건강이
                  </Text>
                )}

                <View
                  style={[
                    styles.bubble,
                    { backgroundColor: isBot ? colors.tint : colors.card },
                  ]}
                >
                  <Text
                    style={[
                      styles.messageText,
                      { color: isBot ? colors.buttonText : colors.text },
                    ]}
                  >
                    {msg.text}
                  </Text>
                </View>

                <Text style={[styles.timestamp, { color: colors.subtext }]}>
                  {formatTime(msg.timestamp)}
                </Text>
              </View>
            </View>
          );
        })}
      </ScrollView>

      <View style={styles.ttsToggleContainer}>
        <TouchableOpacity
          style={[styles.ttsButton, { backgroundColor: colors.card }]}
          onPress={() => setTtsEnabled((prev) => !prev)}
        >
          <Text style={{ color: colors.tint, fontWeight: "bold" }}>
            {ttsEnabled ? "🔇 음성 끄기" : "🔊 음성 켜기"}
          </Text>
        </TouchableOpacity>
      </View>

      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor: colors.card,
            borderTopColor: colors.border,
          },
        ]}
      >
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: colors.background,
              borderColor: colors.border,
              color: colors.text,
            },
          ]}
          value={input}
          onChangeText={setInput}
          placeholder="메시지를 입력하세요..."
          placeholderTextColor={colors.placeholder}
        />
        <TouchableOpacity
          style={[styles.sendButton, { backgroundColor: colors.button }]}
          onPress={handleSend}
        >
          <Text style={[styles.sendButtonText, { color: colors.buttonText }]}>
            보내기
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 40,
    paddingHorizontal: 16,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  backButton: {
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  backText: {
    fontSize: 14,
    fontWeight: "bold",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
    marginTop: 12,
  },
  dateHeader: {
    alignItems: "center",
    marginVertical: 10,
  },
  dateHeaderText: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    fontSize: 14,
    fontWeight: "bold",
  },
  messageBlock: {
    marginBottom: 12,
  },
  botAlign: {
    alignSelf: "flex-start",
    alignItems: "flex-start",
  },
  userAlign: {
    alignSelf: "flex-end",
    alignItems: "flex-end",
  },
  bubble: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 16,
    maxWidth: "80%",
  },
  messageText: {
    fontSize: 18,
  },
  botName: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 6,
    marginLeft: 6,
  },
  timestamp: {
    fontSize: 12,
    marginTop: 4,
    marginHorizontal: 4,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderTopWidth: 1,
  },
  input: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    borderWidth: 1,
    marginRight: 8,
  },
  sendButton: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 20,
  },
  sendButtonText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  ttsToggleContainer: {
    alignItems: "center",
    marginVertical: 4,
  },
  ttsButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
});
