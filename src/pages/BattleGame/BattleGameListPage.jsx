import { useEffect, useState, useMemo, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { styled, keyframes, css } from "styled-components";
import { Button } from "@mui/material";
import { RotateCw, User } from "lucide-react";
import Header from "@/components/Header";
import Chatting from "@/components/Chatting";
import CreateRoomButton from "@/components/GameRoomList/CreateRoomButton";
import GameRoomListBoard from "@/components/GameRoomList/GameRoomListBoard";
import { authRequest } from "@/apis/requestBuilder";
import backgroundPath from "@/assets/backgrounds/background.png";
import { socket } from "@/socket-utils/socket2";
import UserListSidebar from "@/components/GameRoomList/UserListSidebar";
import music from "@/assets/audio/wait_game.mp3";
import InviteAlertModal from "@/components/GameWaiting/InviteAlertModal";
const { connect, send, subscribe, disconnect } = socket;

export default function BattleGameListPage() {
  const navigate = useNavigate();
  const [roomList, setRoomList] = useState(null);
  const isLoading = useMemo(() => roomList === null, [roomList]);
  const audioTag = useRef(null);
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
    }, 1000); // 1초 후 상태 초기화
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
    setRoomList(fetchedRoomList);
  };

  useEffect(() => {
    fetchAllRoom();
    audioTag.current.muted = false;
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
      <audio ref={audioTag} src={music} autoPlay loop muted></audio>
      {isLoading ? (
        <Wrapper>
          <Header />
          <div>Loading...</div>
        </Wrapper>
      ) : (
        <Wrapper>
          <Header />
          <ContentContainer>
            <LeftSidebar>
              <CreateRoomButtonContainer>
              </CreateRoomButtonContainer>
              <Chatting chatList={chatList} path={"/pub/chat/main"} />
            </LeftSidebar>
            <CenterContaier>
              <CenterTop>
                <CenterContext>
                  게임 찾기
                </CenterContext>
                <CenterButtonContainer>
                  <CenterButton onClick={() => {refetchAllRoom(); handleRefreshClick();}} disabled={isButtonDisabled}>
                    <RotatingIcon size="28" isRotating={isRotating} />새로고침
                  </CenterButton>
                  <CenterButton onClick={openUserListModal}>
                    <ShakingUserIcon size="28" />친구
                  </CenterButton>
                  <CreateRoomButton category="battle" />
                </CenterButtonContainer>
              </CenterTop>
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
            <ModalOverlay onClick={handleOverlayClick}>
              <ModalContent>
                <UserListSidebar />
              </ModalContent>
            </ModalOverlay>
          )}
        </Wrapper>
      )}
    </>
  );
}

const Wrapper = styled.div`
  position: relative;
  height: 100vh;
  background-image: url(${backgroundPath});
  background-size: cover;
  background-attachment: fixed;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 0; /* 배경 위에 위치 */
    background-color: rgba(0,0,0,0.2);
  }

  > * {
    position: relative; /* 자식 요소를 블러 바깥으로 제외 */
    z-index: 1;
  }
`;

const CreateRoomButtonContainer = styled.div`
  display: flex;
  background-color: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(40px);
  flex-direction: column;
  padding: 15px; 10px;
  gap: 15px;
`;

const ContentContainer = styled.div`
  display: flex;
  justify-content: space-between;
  height: calc(100vh - 66px);
`;

const LeftSidebar = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 25%;
`;

const CenterContaier = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  width: 100%;
  height: 100%;
  padding: 0 20px;
`

const CenterTop = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 15px;
`

const CenterContext = styled.div`
  color: white;
  font-size: 100px;
  font-weight: bold;
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
      animation: ${rotate} 1s linear;
    `}
  margin-right: 5px;
`;

const CenterButtonContainer = styled.div`
  display: flex;
  margin: auto 12px 0 0;
  gap: 10px;
  height: 62px;
`

const CenterButton = styled(Button)`
  background-color: orange;
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.25);
  box-sizing: border-box;
  color: white;
  padding: 10px 20px;
  cursor: pointer;
  font-size: 25px;
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

  /* CenterButton에 hover 시 아이콘 애니메이션 적용 */
  ${CenterButton}:hover & {
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
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 20px;
  max-width: 600px;
  width: 90%;
  position: relative;
`;
