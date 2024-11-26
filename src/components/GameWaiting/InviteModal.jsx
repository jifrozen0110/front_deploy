import React, { useState } from "react";
import { styled } from "styled-components";
import Avatar from "@mui/material/Avatar";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import ListItemText from "@mui/material/ListItemText";
import Button from "@mui/material/Button";
import { authRequest } from "../../apis/requestBuilder";
import { socket } from "@/socket-utils/socket2";
import SearchUser from "../Friend/FriendSearch";
const { send } = socket;

export default function InviteModal({ isOpen, onClose, roomId }) {
  const [friends, setFriends] = useState([]);
  const user_id = localStorage.userId;
  const fromUserName = localStorage.userName;

  const fetchFriends = async () => {
    try {
      const res = await authRequest().get(`/api/friend/${user_id}`);
      setFriends(res.data.friends ?? []);
    } catch (e) {
      console.error("친구 목록을 가져오지 못했습니다.", e.message);
    }
  };

  const inviteUser = async (toPlayerId) => {
    try {
      send(`/pub/room/${roomId}/invite`, {}, JSON.stringify({ fromPlayerId: parseInt(user_id), toPlayerId, fromUserName }));
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
        {friends.length > 0 && (
        <FriendList>
          {friends.map((friend) => (
            <FriendItem key={friend.userId}>
              {/* 프로필 이미지와 사용자 정보 표시 */}
              <ListItemAvatar>
                <Avatar src={friend.userImage} alt={friend.userName} />
              </ListItemAvatar>
              <ListItemText primary={friend.userName} secondary={friend.email} />
              <InviteButton onClick={() => inviteUser(friend.userId)}>
                초대
              </InviteButton>
            </FriendItem>
          ))}
        </FriendList>
        )}
        <Divider />

        <h3>사용자 검색</h3>
        <SearchUser onAddFriend={inviteUser} />
      </ModalContainer>
    </ModalOverlay>
  );
}


// 스타일링 컴포넌트들
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
  max-height: 300px;  /* 최대 높이 설정 (필요에 따라 조정) */
  overflow-y: auto;   /* 세로 스크롤을 허용 */
  margin-bottom: 20px; /* 목록 아래에 여백 추가 */
`;

const FriendItem = styled.li`
  display: flex;
  align-items: center;
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
