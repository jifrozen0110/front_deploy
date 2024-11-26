// src/components/InviteModal.js

import React, { useState } from "react";
import { styled } from "styled-components";
import Button from "@mui/material/Button";
import { authRequest } from "../../apis/requestBuilder";
import { socket } from "@/socket-utils/socket2";
const { send } = socket;

export default function InviteModal({ isOpen, onClose, roomId }) {
  const [friends, setFriends] = useState([]);
  const [searchId, setSearchId] = useState("");
  const [searchResult, setSearchResult] = useState(null);
  const user_id = localStorage.userId;
  const fromUserName = localStorage.userName;
  const fetchFriends = async () => {
    try {
      const res = await authRequest().get(`/api/friend/${user_id}`);
      console.log("친구목록:", res.data.friends);
      setFriends(res.data.friends);
    } catch (e) {
      console.error("친구 목록을 가져오지 못했습니다.", e.message);
    }
  };

  const searchUser = async () => {
    try {
      const res = await authRequest().get(`/api/users/${searchId}`);
      setSearchResult(res.data);
    } catch (e) {
      console.error("사용자를 찾을 수 없습니다.", e.message);
      setSearchResult(null);
    }
  };

  const inviteUser = async (toPlayerId) => {
    try {
      console.log(roomId);
      send(
        `/pub/room/${roomId}/invite`,
        {},
        JSON.stringify({ fromPlayerId: parseInt(user_id), toPlayerId, fromUserName }),
      );

      alert("초대가 완료되었습니다.");
      onClose();
    } catch (e) {
      console.error("초대에 실패했습니다.", e.message);
    }
  };

  React.useEffect(() => {
    if (isOpen) {
      fetchFriends();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <ModalOverlay>
      <ModalContainer>
        <h2>초대하기</h2>
        <CloseButton onClick={onClose}>X</CloseButton>
        <h3>친구 목록</h3>
        <FriendList>
          {friends.map((friend) => (
            <FriendItem key={friend.userId}>
              {friend.userName}
              <InviteButton onClick={() => inviteUser(friend.userId)}>초대</InviteButton>
            </FriendItem>
          ))}
        </FriendList>

        <Divider />

        <h3>사용자 검색</h3>
        <SearchContainer>
          <input
            type="text"
            placeholder="User ID로 검색"
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
          />
          <Button onClick={searchUser}>검색</Button>
        </SearchContainer>
        {searchResult && (
          <SearchResult>
            <div>{searchResult.userName}</div>
            <InviteButton onClick={() => inviteUser(searchResult.userId)}>초대</InviteButton>
          </SearchResult>
        )}
      </ModalContainer>
    </ModalOverlay>
  );
}

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContainer = styled.div`
  background: white;
  padding: 20px;
  border-radius: 8px;
  max-width: 500px;
  width: 100%;
  position: relative;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  border: none;
  background: none;
  font-size: 1.2rem;
  cursor: pointer;
`;

const FriendList = styled.ul`
  list-style-type: none;
  padding: 0;
`;

const FriendItem = styled.li`
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
`;

const InviteButton = styled(Button)`
  background-color: orange;
  color: white;
  &:hover {
    background-color: darkorange;
  }
`;

const Divider = styled.div`
  margin: 20px 0;
  height: 1px;
  background-color: #ccc;
`;

const SearchContainer = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
`;

const SearchResult = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
`;
