import { useState, useEffect, useRef } from "react";
import { styled } from "styled-components";
import { getSender, getRoomId, getTeam } from "@/socket-utils/storage";
import GameOpenVidu from "@/components/GameIngame/openvidu/GameOpenVidu";
import { socket } from "@/socket-utils/socket2";
import { TextField, Button, Typography } from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { red, blue, deepPurple } from "@mui/material/colors";

const { send } = socket;

export default function Chatting({ chatHistory, isIngame = false, isBattle = false }) {
  const [message, setMessage] = useState("");
  const [lastHeight, setLastHeight] = useState(null);
  const chatElement = useRef();

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

  useEffect(() => {
    const { scrollTop, scrollHeight, clientHeight } = chatElement.current;

    if (scrollTop + clientHeight >= scrollHeight - 100) {
      chatElement.current.scrollTop = scrollHeight;
      return;
    }

    if (!lastHeight) {
      chatElement.current.scrollTop = scrollHeight;
    } else {
      if (scrollTop === 0) {
        const diff = scrollHeight - lastHeight;
        chatElement.current.scrollTop = diff;
      }
    }
  }, [chatHistory, lastHeight]);

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
          <div
            ref={chatElement}
            style={{
              flexGrow: 1,
              margin: "10px",
              overflowY: "scroll",
              scrollbarColor: `${currentScrollbarTheme} rgba(255, 255, 255, 0)`,
            }}
          >

            {/* 채팅 기록을 화면에 출력 */}
            {chatHistory.map((chat, index) => (
              <>
                {chat.userId == getSender() ? (
                  <MyChatDiv key={index} $color={currentChatTheme}>
                    <strong>{chat.userName}: </strong>
                    {chat.message}
                  </MyChatDiv>
                ) : (
                  <ChatDiv key={index} $color={currentChatTheme}>
                    {chat.userName}: {chat.message}
                  </ChatDiv>
                )}
              </>
            ))}
          </div>
        )}

        <Form onSubmit={handleMessageSend}>
          {isIngame ? (
            <GameOpenVidu
              gameId={`${getRoomId()}_${getTeam()}`}
              playerName={getSender()}
              color={currentTheme}
            />
          ) : (
            <GameOpenVidu gameId={getRoomId()} playerName={getSender()} />
          )}
          <ChatInput
            type="text"
            placeholder="채팅"
            size="small"
            color={currentTheme}
            autoComplete="off"
            value={message}
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
  height: ${(props) => {
    if (props.$isIngame) {
      return "";
    } else {
      return "200px";
    }
  }};
  border: ${(props) => {
    if (props.$isIngame) {
      return `1px solid ${props.$color}`;
    } else {
      return "";
    }
  }};
  border-radius: 0 10px 0 0;
  background-color: rgba(255, 255, 255, 0.6); /* 반투명 배경 */
  backdrop-filter: blur(40px); /* 블러 효과 */

  overflow-y: hidden;
`;

const Form = styled.form`
  height: 50px;
  display: flex;
`;

const ChatInput = styled(TextField)`
  width: 74%;
  height: 50px;
  margin: 0;
  margin-left: auto;

  & .MuiInputBase-input {
    padding: 10px 14px;
    height: 20px;
  }
`;

const ChatBtn = styled(Button)`
  width: 16%;
  margin: 0 4px;
  height: 40px;
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
  // width:400px;
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
