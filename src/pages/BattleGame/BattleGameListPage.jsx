import { useEffect, useState, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { styled, keyframes, css } from "styled-components";
import { Button } from "@mui/material";
import { RotateCw, User } from "lucide-react";
import Chatting from "@/components/Chatting";
import CreateRoomButton from "@/components/GameRoomList/CreateRoomButton";
import GameRoomListBoard from "@/components/GameRoomList/GameRoomListBoard";
import { authRequest } from "@/apis/requestBuilder";
import { socket } from "@/socket-utils/socket2";
import UserListSidebar from "@/components/GameRoomList/UserListSidebar";
import InviteAlertModal from "@/components/GameWaiting/InviteAlertModal";
import { logout } from "../../hooks/login";
const { connect, send, subscribe } = socket;

export default function BattleGameListPage() {
  const navigate = useNavigate();
  const [roomList, setRoomList] = useState(null);
  const isLoading = useMemo(() => roomList === null, [roomList]);
  const [chatList, setChatList] = useState([]);
  const playerId = localStorage.getItem("userId");
  const playerImage = localStorage.getItem("image");
  const playerName = localStorage.getItem("userName");
  
  // InviteAlertModal을 상태로 관리
  const [isInviteAlertOpen, setInviteAlertOpen] = useState(false);
  const [invitingPlayer, setInvitingPlayer] = useState(null);
  const [inviteRoomId, setInviteRoomId] = useState("");

  // 친구 모달창 관리
  const [isUserListModalOpen, setIsUserListModalOpen] = useState(false);
  const openUserListModal = () => setIsUserListModalOpen(true);
  const closeUserListModal = () => setIsUserListModalOpen(false);
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      closeUserListModal();
    }
  };

  // 회전 애니메이션
  const [isRotating, setIsRotating] = useState(false);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const handleRefreshClick = () => {
    setIsRotating(true); // 애니메이션 시작
    setIsButtonDisabled(true); // 버튼 비활성화
    setTimeout(() => {
      setIsRotating(false); // 애니메이션 종료
      setIsButtonDisabled(false); // 버튼 활성화
    }, 700); // 1초 후 상태 초기화
  };

  // 초대 수락 처리 함수
  const handleInviteAccept = () => {
    console.log(`${invitingPlayer.playerName}의 초대를 수락`);
    setInviteAlertOpen(false);
    enterRoom(inviteRoomId);
  };

  const createPlayerRequest = () => ({
    playerId,
    playerImage,
    playerName,
  });

  const enterRoom = (roomId) => {
    console.log("방 입장~");
    send(`/pub/room/${roomId}/enter`, {}, JSON.stringify(createPlayerRequest()));
    navigate(`/game/battle/waiting/${inviteRoomId}`);
  };
  const handleInviteDecline = () => {
    // 초대 거절 시 처리할 로직
    console.log(`${invitingPlayer.playerName}의 초대를 거절`);
    // 예: 서버에 초대 거절을 알리거나, 소켓으로 통지
    setInviteAlertOpen(false); // 모달 닫기
  };

  const refetchAllRoom = () => {
    fetchAllRoom();
  };

  const fetchAllRoom = async () => {
    const res = await authRequest().get(`/api/rooms`);
    const { data: fetchedRoomList } = res;
    if (typeof fetchedRoomList === 'string') {
      logout()
    }
    setRoomList(fetchedRoomList);
  };

  useEffect(() => {
    fetchAllRoom();
    connect(() => {
      subscribe("/topic/chat/main", (message) => {
        const data = JSON.parse(message.body);
        setChatList((preChatList) => [...preChatList, data]);
      });

      subscribe(`/topic/invite/${playerId}`, (message) => {
        // JSON 문자열을 객체로 변환
        const parsedMessage = JSON.parse(message.body);
        // 필요한 필드에 접근
        const fromPlayer = parsedMessage.fromPlayerId;
        const toPlayer = parsedMessage.toPlayerId;
        const fromUserName = parsedMessage.fromUserName;
        setInvitingPlayer(fromUserName); // 초대한 플레이어 정보 설정
        setInviteAlertOpen(true); // 초대 알림 모달 열기
        setInviteRoomId(parsedMessage.roomId);
      });
    });
  }, []);

  return (
    <>
      {isLoading ? (
        <>
          <div>Loading...</div>
        </>
      ) : (
        <>
          <ContentContainer>
            <Top>
              <TopButtonContainer>
                <TopButton onClick={() => {refetchAllRoom(); handleRefreshClick();}} disabled={isButtonDisabled}>
                  <RotatingIcon size="20" isRotating={isRotating} />새로고침
                </TopButton>
                <TopButton onClick={openUserListModal}>
                  <ShakingUserIcon size="20" />친구
                </TopButton>
                <CreateRoomButton category="battle" />
              </TopButtonContainer>
            </Top>
            <CenterContaier>
              <LeftSidebar>
                <Chatting chatList={chatList} path={"/pub/chat/main"} />
              </LeftSidebar>
              <GameRoomListBoard category="battle" roomList={roomList} />
            </CenterContaier>
            {/* <UserListSidebar /> */}
          </ContentContainer>
          <InviteAlertModal
            isOpen={isInviteAlertOpen}
            onClose={() => setInviteAlertOpen(false)}
            inviter={invitingPlayer}
            onAccept={handleInviteAccept}
            onDecline={handleInviteDecline}
          />
          {/* UserListSidebar 모달 */}
          {isUserListModalOpen && (
            <ModalOverlay onClick={handleOverlayClick} style={{position:"fixed"}}>
              <ModalContent>
                <UserListSidebar />
              </ModalContent>
            </ModalOverlay>
          )}
        </>
      )}
    </>
  );
}

const ContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: calc(100vh - 66px);
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  box-sizing: border-box;
`;

const LeftSidebar = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 20%;
  align-items: center;
  box-sizing: border-box;
  min-width:300px;
`;

const CenterContaier = styled.div`
  display: flex;
  flex: 1;
  height: calc(100% - 66px); /* 전체 화면 높이에서 Header(66px) 제외 */
  margin-top: 10px;
  box-sizing: border-box;
  min-width: 900px;
`

const Top = styled.div`
  display: flex;
  justify-content: flex-end;
`

const rotate = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`;

const RotatingIcon = styled(RotateCw).withConfig({
  shouldForwardProp: (prop) => prop !== "isRotating", // isRotating을 DOM으로 전달하지 않음
})`
  ${({ isRotating }) =>
    isRotating &&
    css`
      animation: ${rotate} 0.7s linear;
    `}
  margin-right: 5px;
`;

const TopButtonContainer = styled.div`
  display: flex;
  gap: 10px;
  height: 45px;
  margin-right: 25px;
`

const TopButton = styled(Button)`
  background-color: orange;
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.25);
  box-sizing: border-box;
  color: white;
  cursor: pointer;
  font-size: 20px;
  padding: 10px;
  &:hover {
    background-color: darkorange;
  }
  &:disabled {
    background-color: gray;
    color: white;
    cursor: not-allowed;
  }
`

const shake = keyframes`
  0%, 100% {
    transform: rotate(0deg);
  }
  25% {
    transform: rotate(-10deg);
  }
  75% {
    transform: rotate(10deg);
  }
`;

const ShakingUserIcon = styled(User)`
  margin-right: 5px;
  animation: none; /* 기본값 */

  /* TopButton에 hover 시 아이콘 애니메이션 적용 */
  ${TopButton}:hover & {
    animation: ${shake} 0.5s linear;
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  position: fixed;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 20px;
  max-width: 600px;
  width: 90%;
  z-index: 1001;
`;
