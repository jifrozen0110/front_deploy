import React, { useRef, useState } from "react";
import { styled } from "styled-components";
import Button from "@mui/material/Button";
import ChatSend from "@/assets/icons/chat_send.png";
import { socket } from "@/socket-utils/socket2"; // 소켓 유틸리티
const { send } = socket;

function ChatComponent({chatList, path, defualtData = {}}) {
  // const [messages, setMessages] = useState([]); // 메시지 목록
  // const [input, setInput] = useState(""); // 입력 필드 값
  const inputTag = useRef(null)

  // 메시지 전송 핸들러
  const handleSendMessage = () => {
    if (inputTag.current.value.trim() !== "") {
      // setMessages([...messages, { text: input, user: "me" }]);
      // setInput(""); // 입력 필드 초기화
      send(path, {}, 
        JSON.stringify({
          message : inputTag.current.value,
          userName : localStorage.getItem('userName'),
          userId : localStorage.getItem('userId'),
          ...defualtData
        }))
      inputTag.current.value = ''
    }
  };

  return (
    <ChatContainer>
      {/* 채팅 메시지 목록 */}
      <ChatMessages>
        {chatList.map((chat, index) => (
          <Message
            key={index}
            isMyMessage={chat.userId == localStorage.getItem('userId')}
          >
            {chat.userId != localStorage.getItem('userId') && <div>{chat.userName}:</div>}
            {chat.message}
          </Message>
        ))}
      </ChatMessages>

      {/* 채팅 입력 필드 */}
      <ChatInputContainer>
        <ChatInput
          // value={input}
          ref={inputTag}
          // onChange={(e) => setInput(e.target.value)}
          placeholder="메시지를 입력하세요..."
          onKeyDown={ e => {
            if (e.key === 'Enter') 
              handleSendMessage()
          }}
        />
        <ChatButton onClick={handleSendMessage}>
            <img
                src={ChatSend}
                alt="채팅"
                className="icon"
            />
        </ChatButton>
      </ChatInputContainer>
    </ChatContainer>
  );
}

// 스타일 컴포넌트 정의
const ChatContainer = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
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
    props.isMyMessage ? "#FFFFFF" : "#DCF8C6"};
  border-radius: 8px;
  margin-bottom: 8px;
  max-width: 70%;
  margin-left: ${(props) => (props.isMyMessage ? "auto" : "0")};
  margin-right: ${(props) => (props.isMyMessage ? "0" : "auto")};
`;

const ChatInputContainer = styled.div`
  display: flex;
  border-top: 1px solid #ddd;
  box-sizing: border-box;
  width: 100%;
  padding: 5px;
  background-color: #C6E7FF;
  border-radius: 5px;
`;

const ChatInput = styled.input`
  box-sizing: border-box;
  height: 30px;
  width: 100%;
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
  margin-left: 5px;
  width: 30px;
  min-width: 10px;
  padding: 6;
  background-color: white;
  color: black;
  cursor: pointer;
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.25);
  &:hover {
    background-color: rgba(255,255,255, 0.75);
  }
`;

export default ChatComponent;
