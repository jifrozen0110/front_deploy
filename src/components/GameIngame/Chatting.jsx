import { useState, useEffect, useRef } from "react";
import { styled } from "styled-components";
import { getSender, getRoomId, getTeam } from "@/socket-utils/storage";
import { socket } from "@/socket-utils/socket2";
import { TextField, Button } from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { red, blue, deepPurple } from "@mui/material/colors";

const { send } = socket;

export default function Chatting({ chatHistory, isIngame = false, isBattle = false }) {
  const [message, setMessage] = useState("");
  const chatElement = useRef();
  const [isChatVisible, setIsChatVisible] = useState(true); // 채팅 컨테이너 가시성 상태
  const [visibilityTimer, setVisibilityTimer] = useState(null); // 타이머 관리

  const handleMessageSend = (e) => {
    e.preventDefault();
    if (getSender() && message) {
      send(
        `/pub/game/chat`,
        {},
        JSON.stringify({
          gameId: getRoomId(),
          userId: getSender(),
          userName: localStorage.getItem("userName"),
          team: getTeam(),
          message,
          // type: "CHAT",
        }),
      );
      setMessage("");
    }
  };

  // 새 메시지가 추가될 때 채팅 컨테이너를 보이게 하고 자동 스크롤
  useEffect(() => {
    if (chatHistory.length > 0) {
      setIsChatVisible(true);

      // 타이머 설정
      if (visibilityTimer) clearTimeout(visibilityTimer);
      const timer = setTimeout(() => setIsChatVisible(false), 3000);
      setVisibilityTimer(timer);

      // 스크롤 자동 이동
      if (chatElement.current) {
        chatElement.current.scrollTop = chatElement.current.scrollHeight;
      }
    }
  }, [chatHistory]);

  const handleFocus = () => {
    setIsChatVisible(true);
    if (visibilityTimer) clearTimeout(visibilityTimer); // 타이머 제거
  };

  const handleBlur = () => {
    const timer = setTimeout(() => setIsChatVisible(false), 3000);
    setVisibilityTimer(timer);
  };

  const theme = createTheme({
    typography: {
      fontFamily: "'Galmuri11', sans-serif",
    },
    palette: {
      redTeam: {
        light: red[300],
        main: red[400],
        dark: red[500],
        darker: red[600],
        contrastText: "#fff",
      },
      blueTeam: {
        light: blue[300],
        main: blue[400],
        dark: blue[500],
        darker: blue[600],
        contrastText: "#fff",
      },
      purple: {
        light: deepPurple[200],
        main: deepPurple[300],
        dark: deepPurple[400],
        darker: deepPurple[600],
        contrastText: "#fff",
      },
    },
  });

  const currentTheme = !isBattle ? "purple" : getTeam() === "red" ? "redTeam" : "blueTeam";
  const currentScrollbarTheme = !isBattle
    ? deepPurple[300]
    : getTeam() === "red"
      ? red[300]
      : blue[300];
  const currentChatTheme = !isBattle ? deepPurple[100] : getTeam() === "red" ? red[100] : blue[100];

  return (
    <ThemeProvider theme={theme}>
      <Wrapper $isIngame={isIngame} $color={currentScrollbarTheme}>
        {chatHistory && (
          <ChatContainer ref={chatElement} $isChatVisible={isChatVisible}>
            {/* 채팅 기록을 화면에 출력 */}
            {chatHistory.map((chat, index) => {
              return (
                <>
                  {chat.userId == getSender() ? (
                    <MyChatDiv
                      key={index}
                      $color={currentChatTheme}
                      style={{
                        opacity: isChatVisible ? 1 : 0, // 투명화 상태에 따라 설정
                        transition: "opacity 0.5s ease-in-out",
                      }}
                    >
                      <strong>{chat.userName}: </strong>
                      {chat.message}
                    </MyChatDiv>
                  ) : (
                    <ChatDiv
                      key={index}
                      $color={currentChatTheme}
                      style={{
                        opacity: isChatVisible ? 1 : 0, // 투명화 상태에 따라 설정
                        transition: "opacity 0.5s ease-in-out",
                      }}
                    >
                      {chat.userName}: {chat.message}
                    </ChatDiv>
                  )}
                </>
              );
            })}
          </ChatContainer>
        )}

        <Form onSubmit={handleMessageSend}>
          <ChatInput
            type="text"
            placeholder="메시지를 입력하세요"
            size="small"
            autoComplete="off"
            color={currentTheme}
            value={message}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onChange={(e) => setMessage(e.target.value)}
          />
          <ChatBtn variant="outlined" color={currentTheme} type="submit">
            Send
          </ChatBtn>
        </Form>
      </Wrapper>
    </ThemeProvider>
  );
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  max-height: 500px;
  border-radius: 0 10px 0 0;
  overflow-y: hidden;
`;

const ChatContainer = styled.div`
  flex-grow: 1;
  margin: 10px;
  overflow-y: auto; /* 스크롤 동작 가능 */
  opacity: ${(props) => (props.$isChatVisible ? 1 : 0)};
  transition: opacity 0.5s ease-in-out;

  /* 오버레이 스타일 */
  scrollbar-gutter: stable; /* Firefox 및 표준 브라우저 */
  scrollbar-width: thin;
  scrollbar-color: ${getTeam() === "red" ? red[300] : blue[300]} transparent;

  /* Webkit 브라우저 스타일 */
  &::-webkit-scrollbar {
    width: 8px; /* 항상 같은 넓이 */
  }

  &::-webkit-scrollbar-thumb {
    background-color: rgba(0, 0, 0, 0.5);
    border-radius: 10px;
  }

  &::-webkit-scrollbar-track {
    background-color: transparent;
  }
`;

const Form = styled.form`
  padding: 5px 5px 0 0;
  display: flex;
  background-color: ${getTeam() === "red" ? red[400] : blue[400]};
  border-radius: 0 5px 0 0;
  webkittextstroke: "2px white"; // 글자 테두리
`;

const ChatInput = styled(TextField)`
  flex: 1;
  margin-right: 5px;
  background-color: white;
  border-radius: 5px;
  border: none;
  outline: none;
`;

const ChatBtn = styled(Button)`
  width: 16%;
  height: 40px;
  background-color: white;
  border-radius: 5px;
  border: none;
  cursor: pointer;
  &:hover {
    border: none;
    background-color: white;
  }
  &:active {
    transform: scale(0.98); /* 클릭 시 살짝 축소 */
  }
`;

const ChatDiv = styled.div`
  position: relative;
  margin: 15px;
  padding: 10px;
  // width:400px;
  background-color: ${(props) => {
    return props.$color;
  }};
  border-radius: 10px;

  &:after {
    border-top: 10px solid
      ${(props) => {
        return props.$color;
      }};
    border-left: 10px solid transparent;
    border-right: 10px solid transparent;
    border-bottom: 0px solid transparent;
    content: "";
    position: absolute;
    bottom: -10px;
    left: 20px;
  }
`;

const MyChatDiv = styled.div`
  position: relative;
  margin: 15px;
  padding: 10px;
  background-color: white;
  border: 1px solid ${(props) => props.$color};
  border-radius: 10px;

  &:after {
    border-top: 10px solid white;
    border-left: 10px solid transparent;
    border-right: 10px solid transparent;
    border-bottom: 0px solid transparent;
    content: "";
    position: absolute;
    bottom: -10px;
    right: 20px;
  }
  &:before {
    border-top: 10px solid ${(props) => props.$color};
    border-left: 10px solid transparent;
    border-right: 10px solid transparent;
    border-bottom: 0px solid transparent;
    content: "";
    position: absolute;
    bottom: -11px;
    right: 20px;
  }
`;
