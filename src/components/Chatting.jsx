import React, { useState } from "react";
import styled from "styled-components";
import Button from "@mui/material/Button";
import ChatSend from "@/assets/icons/chat_send.png";

function ChatComponent() {
  const [messages, setMessages] = useState([]); // 메시지 목록
  const [input, setInput] = useState(""); // 입력 필드 값

  // 메시지 전송 핸들러
  const handleSendMessage = () => {
    if (input.trim() !== "") {
      setMessages([...messages, { text: input, user: "me" }]);
      setInput(""); // 입력 필드 초기화
    }
  };

  return (
    <ChatContainer>
      {/* 채팅 메시지 목록 */}
      <ChatMessages>
        {messages.map((message, index) => (
          <Message
            key={index}
            isMyMessage={message.user === "me"}
          >
            {message.text}
          </Message>
        ))}
      </ChatMessages>

      {/* 채팅 입력 필드 */}
      <ChatInputContainer>
        <ChatInput
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="메시지를 입력하세요..."
        />
        <ChatButton onClick={handleSendMessage}>
            <img
                src={ChatSend}
                alt="채팅"
                className="icon"
                style={{ display: "block", margin: "0 auto" }}
            />
        </ChatButton>
      </ChatInputContainer>
    </ChatContainer>
  );
}

// 스타일 컴포넌트 정의
const ChatContainer = styled.div`
  flex: 0 0 300px; /* 고정된 너비 300px */
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  height: 100%; /* 화면 전체 높이 */
  width: 300px;
  overflow: hidden;
  padding: 15px 10px;
  background-color: rgba(255, 255, 255, 0.6); /* 반투명 배경 */
  backdrop-filter: blur(40px); /* 블러 효과 */
`;

const ChatMessages = styled.div`
  flex: 1;
  padding: 10px;
  overflow-y: auto;
`;

const Message = styled.div`
  text-align: ${(props) => (props.isMyMessage ? "right" : "left")};
  padding: 10px;
  background-color: ${(props) =>
    props.isMyMessage ? "#DCF8C6" : "#E8E8E8"};
  border-radius: 8px;
  margin-bottom: 8px;
  max-width: 70%;
  margin-left: ${(props) => (props.isMyMessage ? "auto" : "0")};
  margin-right: ${(props) => (props.isMyMessage ? "0" : "auto")};
`;

const ChatInputContainer = styled.div`
  display: flex;
  border-top: 1px solid #ddd;
  padding: 5px;
  background-color: #C6E7FF;
  border-radius: 5px;
`;

const ChatInput = styled.input`
  flex: 1;
  box-sizing: border-box;
  height: 30px;
  padding: 8px;
  border-radius: 5px;
  border: 2px solid white;
  transition: border-color 0.3s ease; /* 부드러운 전환 효과 */

  &:focus {
    border-color: orange; /* 포커스 상태에서 테두리 색 변경 */
    outline: none; /* 기본 outline 제거 */
  }
`;


const ChatButton = styled(Button)`
  margin-left: 10px;
  padding: 6px;
  background-color: white;
  color: black;
  cursor: pointer;
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.25);
  &:hover {
    background-color: orange;
    color: white;
    .icon {
      filter: brightness(0) invert(1); /* 흰색으로 변경 */
    }
  }
`;

export default ChatComponent;
