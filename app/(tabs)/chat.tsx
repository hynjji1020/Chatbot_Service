import React, { useEffect, useRef, useState } from "react";
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
import { speakText } from "../../components/speakText";

type Message = {
  id: string;
  text: string;
  timestamp: Date;
  sender: "user" | "bot";
};

export default function ChatScreen() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    const keyboardListener = Keyboard.addListener("keyboardDidShow", () => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    });
    return () => keyboardListener.remove();
  }, []);

  useEffect(() => {
    const last = messages[messages.length - 1];
    if (last?.sender === "bot" && ttsEnabled) {
      speakText(last.text);
    }
  }, [messages]);

  const handleSend = () => {
    if (input.trim()) {
      const userMessage: Message = {
        id: Date.now().toString(),
        text: input.trim(),
        timestamp: new Date(),
        sender: "user",
      };

      setMessages((prev) => [...prev, userMessage]);
      setInput("");

      const botText = getBotReply(input.trim());

      const botReply: Message = {
        id: (Date.now() + 1).toString(),
        text: botText,
        timestamp: new Date(),
        sender: "bot",
      };

      setTimeout(() => {
        setMessages((prev) => [...prev, botReply]);
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 500);
    }
  };

  const getBotReply = (userText: string): string => {
    if (userText.includes("허리")) {
      return "허리가 불편하시면 ‘정형외과’, ‘신경외과’를 추천드릴게요!";
    }
    return "어떤 부분이 불편하신가요?\n제가 알려드릴게요!\n먼저 증상을 알려주세요!";
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
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
    >
      <Text style={styles.title}>건강이</Text>

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
                  <Text style={styles.dateHeaderText}>
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
                {isBot && <Text style={styles.botName}>건강이</Text>}

                <View
                  style={[
                    styles.bubble,
                    isBot ? styles.botBubble : styles.userBubble,
                  ]}
                >
                  <Text
                    style={[
                      styles.messageText,
                      isBot ? styles.botText : styles.userText,
                    ]}
                  >
                    {msg.text}
                  </Text>
                </View>

                <Text style={styles.timestamp}>
                  {formatTime(msg.timestamp)}
                </Text>
              </View>
            </View>
          );
        })}
      </ScrollView>

      {/* ✅ TTS 끄기/켜기 버튼 */}
      <View style={styles.ttsToggleContainer}>
        <TouchableOpacity
          style={styles.ttsButton}
          onPress={() => setTtsEnabled((prev) => !prev)}
        >
          <Text style={styles.ttsButtonText}>
            {ttsEnabled ? "🔇 음성 끄기" : "🔊 음성 켜기"}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="메시지를 입력하세요..."
          placeholderTextColor="#999"
        />
        <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
          <Text style={styles.sendButtonText}>보내기</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 40,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
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
    backgroundColor: "#ddd",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
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
  botBubble: {
    backgroundColor: "#007bff",
  },
  userBubble: {
    backgroundColor: "#eee",
  },
  messageText: {
    fontSize: 18,
  },
  botText: {
    color: "#fff",
  },
  userText: {
    color: "#333",
  },
  botName: {
    fontSize: 16,
    color: "#007bff",
    fontWeight: "bold",
    marginBottom: 6,
    marginLeft: 6,
  },
  timestamp: {
    fontSize: 12,
    color: "#888",
    marginTop: 4,
    marginHorizontal: 4,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderTopWidth: 1,
    borderColor: "#ccc",
    backgroundColor: "#f9f9f9",
  },
  input: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#ccc",
    marginRight: 8,
  },
  sendButton: {
    backgroundColor: "#007bff",
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 20,
  },
  sendButtonText: {
    color: "#fff",
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
    backgroundColor: "#f0f0f0",
    borderRadius: 20,
  },
  ttsButtonText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#007bff",
  },
});
