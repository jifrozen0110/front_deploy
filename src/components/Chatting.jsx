import React, { useRef, useEffect } from "react";
import { styled } from "styled-components";
import Button from "@mui/material/Button";
import ChatSend from "@/assets/icons/chat_send.png";
import { socket } from "@/socket-utils/socket2"; // 소켓 유틸리티
const { send } = socket;

function ChatComponent({ chatList, path, defualtData = {} }) {
  const inputTag = useRef(null);
  const chatMessagesRef = useRef(null); // ChatMessages 요소의 ref 생성

  // 메시지 전송 핸들러
  const handleSendMessage = () => {
    if (inputTag.current.value.trim() !== "") {
      send(
        path,
        {},
        JSON.stringify({
          message: inputTag.current.value,
          userName: localStorage.getItem("userName"),
          userId: localStorage.getItem("userId"),
          ...defualtData,
        }),
      );
      inputTag.current.value = "";
    }
  };

  // chatList가 변경될 때 스크롤을 맨 아래로 이동
  useEffect(() => {
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
    }
  }, [chatList]);

  return (
    <ChatContainer>
      {/* 채팅 메시지 목록 */}
      <ChatMessages ref={chatMessagesRef}>
        {chatList.map((chat, index) => (
          <Message key={index} ismymessage={chat.userId == localStorage.getItem("userId")? 1 : 0}>
            {chat.userId != localStorage.getItem("userId") && <div>{chat.userName}:</div>}
            {chat.message}
          </Message>
        ))}
      </ChatMessages>

      {/* 채팅 입력 필드 */}
      <ChatInputContainer>
        <ChatInput
          ref={inputTag}
          placeholder="메시지를 입력하세요..."
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.nativeEvent.isComposing) handleSendMessage();
          }}
        />
        <ChatButton onClick={handleSendMessage}>
          <img src={ChatSend} alt="채팅" className="icon" />
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
  background-color: rgba(0, 0, 0, 0.7);
  border-radius: 5px;
`;

const ChatMessages = styled.div`
  flex: 1;
  height: 100%;
  overflow-y: auto; /* 스크롤 활성화 */
  padding: 10px;

  /* 스크롤바 스타일 */
  &::-webkit-scrollbar {
    width: 10px; /* 스크롤바 너비 */
  }

  &::-webkit-scrollbar-thumb {
    background-color: rgba(0, 0, 0, 0.3); /* 스크롤바 색상 */
    border-radius: 10px; /* 스크롤바 둥글게 */
  }

  &::-webkit-scrollbar-thumb:hover {
    background-color: rgba(0, 0, 0, 0.5); /* 스크롤바 hover 효과 */
  }

  &::-webkit-scrollbar-track {
    background: transparent; /* 스크롤 트랙 배경 투명화 */
  }
`;

const Message = styled.div`
  text-align: "left";
  padding: 10px;
  color: ${(props) => (props.ismymessage ? "#FFFFFF" : "#bbf11c")};
  border-radius: 8px;
  margin-bottom: 8px;
  max-width: 90%;
  margin-right: ${(props) => (props.ismymessage ? "0" : "auto")};
  border: 1px solid ${(props) => (props.ismymessage ? "#FFFFFF" : "#DCF8C6")};
`;

const ChatInputContainer = styled.div`
  display: flex;
  // border-top: 1px solid #ddd;
  box-sizing: border-box;
  width: 100%;
  padding: 5px;
  // background-color: #c6e7ff;
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
    background-color: rgba(255, 255, 255, 0.75);
  }
`;

export default ChatComponent;
