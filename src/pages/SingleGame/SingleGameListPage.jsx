import GamePageNavigation from "../../components/GamePageNavigation";
import Header from "../../components/Header";
import PlayPuzzle from "../../components/PlayPuzzle";
import { socket } from "@/socket-utils/socket";
import { useEffect } from "react";
const { connect, send, subscribe } = socket;

export default function SingleGameListPage() {
  useEffect(() => {
    // 웹소켓 연결 설정
    connect(
      () => {
        console.log("웹소켓 연결 성공");

        // 서버에서 오는 메시지를 구독
        subscribe("/topic/puzzle/move", (message) => {
          console.log("서버로부터 메시지 수신:", message.body);
          // 필요한 경우 메시지 처리 로직 추가
        });

        // 테스트를 위해 서버로 메시지 전송
        send(
          "/pub/puzzle/move",
          {},
          JSON.stringify({
            roomId: "testRoom",
            sender: "testSender",
            message: "TEST_MESSAGE",
            targets: "[]",
            position_x: 0,
            position_y: 0,
          }),
        );
      },
      (error) => {
        console.error("웹소켓 연결 에러:", error);
      },
    );

    // 컴포넌트 언마운트 시 연결 해제
    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <>
      <Header />
      <GamePageNavigation />
      <PlayPuzzle />
    </>
  );
}
