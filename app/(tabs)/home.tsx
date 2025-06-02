import { useRouter } from "expo-router"; // 페이지 이동을 위한 useRouter 훅을 가져옴 (expo-router 사용)
import React from "react"; // React의 기본 기능을 사용하기 위해 import
import { StyleSheet, Text, TouchableOpacity, View } from "react-native"; // React Native의 UI 컴포넌트들 불러오기
import { RFValue } from "react-native-responsive-fontsize"; // 반응형 폰트 크기를 위한 라이브러리

export default function HomeScreen() {
  // HomeScreen 컴포넌트 정의 및 export (기본 화면 역할)
  const router = useRouter(); // 라우팅(페이지 이동)을 위한 훅 사용
  // 컴포넌트의 UI를 반환
  return (
    <View style={styles.container}>
      <Text style={styles.title}>도움드리는 건강 안내 도우미</Text>

      <View style={styles.messageBox}>
        <Text style={styles.emojiLine}>
          🤒 <Text style={styles.highlight}>어디가 불편하신가요?</Text>
        </Text>
        <Text style={styles.message}>
          건강 안내 도우미가{"\n"}해결해 드립니다!
        </Text>
        <Text style={styles.message}>파란색 버튼을{"\n"}눌러주세요!</Text>
      </View>

      <TouchableOpacity // 사용자가 누를 수 있는 버튼 영역
        style={styles.button} // 버튼의 스타일 지정
        onPress={() => router.push("/(tabs)/chat")} // 버튼 누르면 채팅 화면으로 이동
      >
        <Text style={styles.buttonText}>도우미 시작하기</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  // 전체 화면 컨테이너 스타일
  container: {
    flex: 1, // 화면의 전체 공간을 차지
    justifyContent: "center", // 세로 방향 중앙 정렬
    alignItems: "center", // 가로 방향 중앙 정렬
    backgroundColor: "#fff", // 배경색 흰색
    padding: 24, // 전체 화면의 안쪽 여백
  },
  // 제목 텍스트 스타일
  title: {
    fontSize: RFValue(26), // 반응형 폰트 크기 (26 기준)
    fontWeight: "bold", // 글씨 굵게
    marginBottom: 30, // 아래쪽 여백
    textAlign: "center", // 가운데 정렬
  },
  // 안내 메시지를 담는 박스 스타일
  messageBox: {
    backgroundColor: "#7ddcff", // 연한 하늘색 배경
    borderRadius: 20, // 둥근 모서리
    paddingVertical: 30, // 위아래 여백
    paddingHorizontal: 24, // 좌우 여백
    marginBottom: 40, // 박스 아래 여백
    alignItems: "center", // 안쪽 요소들을 가운데 정렬
    width: "100%", // 박스 너비 전체 화면에 맞춤
  },
  // 이모지와 강조 텍스트가 있는 한 줄 스타일
  emojiLine: {
    fontSize: RFValue(22), // 반응형 폰트 크기
    marginBottom: 20, // 아래쪽 여백
    textAlign: "center", // 가운데 정렬
  },
  // 강조 텍스트 스타일 (흰색, 굵게, 큼직하게)
  highlight: {
    fontWeight: "bold",
    color: "#fff",
    fontSize: RFValue(22),
  },
  // 메시지 텍스트 스타일 (주로 흰색 안내 문구)
  message: {
    fontSize: RFValue(20),
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 12,
  },
  // 버튼 스타일
  button: {
    backgroundColor: "#007bff", // 파란색 배경
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 12,
    elevation: 4, // 그림자 효과 (안드로이드용 입체감)
  },
  // 버튼 안의 텍스트 스타일
  buttonText: {
    color: "#fff",
    fontSize: RFValue(20),
    fontWeight: "bold",
  },
});
