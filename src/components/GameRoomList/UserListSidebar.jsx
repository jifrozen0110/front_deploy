import React, { useState, useEffect } from 'react';
import { styled } from 'styled-components';
import Avatar from "@mui/material/Avatar";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import DeleteIcon from '@mui/icons-material/Delete'; 
import Button from "@mui/material/Button";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import IconButton from "@mui/material/IconButton";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { authRequest } from "../../apis/requestBuilder";
import SearchUser from '../Friend/FriendSearch';

// 스타일링 컴포넌트들

const RightSidebar = styled.div`
  background-color: rgba(255, 255, 255, 0.6); /* 반투명 배경 */
  backdrop-filter: blur(40px); /* 블러 효과 */
  padding: 20px;
  box-sizing: border-box;
  width: 100%;
  height: 100%;
`;

const SectionTitle = styled.h3`
  margin-top: 20px;
  margin-bottom: 10px;
  font-size: 1.2rem;
  color: #555;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
`;

const FriendsList = styled(List)`
  max-height: 300px;
  overflow-y: auto;
  background-color: white;
  border-radius: 8px;
  padding: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const FriendItem = styled(ListItem)`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;




const UserListSidebar = () => {
  // State 관리
  const [friends, setFriends] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [userId, setUserId] = useState(1); // 예시로 사용자 ID를 설정
  const [showFriends, setShowFriends] = useState(true); // 친구 목록 보이기 상태
  const [showPendingRequests, setShowPendingRequests] = useState(true); // 대기 중인 목록 보이기 상태

  // 친구 목록 가져오기
  const fetchFriends = async (user_id) => {
    try {
      const res = await authRequest().get(`/api/friend/${user_id}`);
      setFriends(res.data.friends ?? []); // 친구 목록
      setPendingRequests(res.data.pendingRequests ?? []); // 친구 요청
    } catch(error){
      console.error("친구 목록을 불러오는 중 오류 발생:", error);
    }
  };

  const handleAddFriend = async (friendId) => {
    try{
    const response = await authRequest().post(`/api/friend/send?requesterId=${userId}&receiverId=${parseInt(friendId)}`);
    alert(response.data); // 서버의 응답 데이터 출력
    fetchFriends(); // 친구 목록 갱신
  } catch (error){
    console.error("친구 추가 중 오류 발생:",error)
  }
  };
  
  const handleAcceptRequest = async (requesterId) => {
    try{
      const response = await authRequest().post(`/api/friend/accept?requesterId=${requesterId}&receiverId=${userId}`);
      alert(response.data); // 서버의 응답 데이터 출력
      fetchFriends(userId); // 친구 목록 갱신
    } catch (error){
      console.error("친구 요청을 수락하는 중 오류 발생:",error);
    }
  }

  const handleRejectRequest = async (requesterId) => {
    try{
      const response = await authRequest().delete(`/api/friend/reject?requesterId=${requesterId}&receiverId=${userId}`);
      alert(response.data);
      fetchFriends(userId);
    } catch(error){
      console.error("친구 요청을 거절하는 중 오류 발생:",error)
    }
  }
  
  const handleRemoveFriend = async (friendId) => {
    const confirmDelete = window.confirm("정말로 이 친구를 삭제하시겠습니까?");
    if (confirmDelete) {
      try {
        const response = await authRequest().delete(`/api/friend/remove?userId=${userId}&friendId=${friendId}`);
        alert(response.data); // 서버의 응답 데이터 출력
        fetchFriends(userId); // 친구 목록 갱신
      } catch (error) {
        console.error("친구 삭제 중 오류 발생:", error);
      }
    }
  };
  

  // 페이지가 로드될 때 친구 목록 불러오기
  useEffect(() => {
    const user_id = localStorage.userId; // localStorage에서 id 가져오기
    setUserId(user_id); // userId 업데이트
    fetchFriends(user_id); // userId로 친구 목록 가져오기
  }, []);

  return (
    <RightSidebar>
      {/* 친구 검색 섹션 */}
      <SearchUser onAddFriend={handleAddFriend} />

    {/* 친구 목록 섹션 */} 
  <SectionTitle onClick={() => setShowFriends(!showFriends)}>
    친구 목록 {showFriends ? <ExpandLessIcon /> : <ExpandMoreIcon />}
  </SectionTitle>
  {showFriends && friends.length > 0 && (
    <FriendsList>
      {friends.map((friend) => (
        <FriendItem key={friend.userId}>
          <ListItemAvatar>
            <Avatar src={friend.userImage} alt={friend.userName} />
          </ListItemAvatar>
          <ListItemText primary={friend.userName} secondary={friend.email} />
          {/* 삭제 버튼 추가 */}
          <IconButton onClick={() => handleRemoveFriend(friend.userId)} color="secondary">
            <DeleteIcon />
          </IconButton>
        </FriendItem>
      ))}
    </FriendsList>
  )}

      {/* 친구 요청 대기 목록 섹션 */}
      <SectionTitle onClick={() => setShowPendingRequests(!showPendingRequests)}>
        친구 요청 대기 {showPendingRequests ? <ExpandLessIcon /> : <ExpandMoreIcon />}
      </SectionTitle>
      {showPendingRequests && pendingRequests.length > 0 && (
        <FriendsList>
          {pendingRequests.map((request) => (
            <FriendItem key={request.email}>
              <ListItemText primary={request.userName} />
              <div>
                <Button onClick={() => handleAcceptRequest(request.userId)} color="primary">
                  수락
                </Button>
                <Button onClick={() => handleRejectRequest(request.userId)} color="secondary">
                  거절
                </Button>
              </div>
            </FriendItem>
          ))}
        </FriendsList>
      )}
    </RightSidebar>
  );
};

export default UserListSidebar;
