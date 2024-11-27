import { useEffect, useState, useMemo, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { styled } from "styled-components";
import { IconButton, Button, createTheme, ThemeProvider } from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Chatting from "@/components/Chatting";
import CreateRoomButton from "@/components/GameRoomList/CreateRoomButton";
import GameRoomListBoard from "@/components/GameRoomList/GameRoomListBoard";
import { request, authRequest } from "@/apis/requestBuilder";
import { getSender } from "@/socket-utils/storage";
import backgroundPath from "@/assets/backgrounds/background.png";
import { socket } from "@/socket-utils/socket2";
import { setRoomId, setSender, setTeam } from "../../socket-utils/storage";
import { deepPurple } from "@mui/material/colors";
import UserListSidebar from "@/components/GameRoomList/UserListSidebar";
import music from "@/assets/audio/wait_game.mp3";
import InviteAlertModal from "@/components/GameWaiting/InviteAlertModal";
const { connect, send, subscribe, disconnect } = socket;
const theme = createTheme({
  typography: {
    fontFamily: "'Galmuri11', sans-serif",
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          color: deepPurple[700],
          fontSize: "15px",
          height: "80%",
          backgroundColor: "#fff",
          "&:hover": {
            backgroundColor: deepPurple[100],
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          margin: "3% auto",

          "& label": {
            color: deepPurple[200],
          },
          "& label.Mui-focused": {
            color: deepPurple[700],
          },
          "& .MuiOutlinedInput-root": {
            color: deepPurple[700],
            "& fieldset": {
              borderColor: deepPurple[200],
            },
            "&:hover fieldset": {
              borderColor: deepPurple[400],
            },
            "&.Mui-focused fieldset": {
              borderColor: deepPurple[700],
            },
          },
          "& .MuiFormHelperText-root": {
            color: deepPurple[400],
          },
        },
      },
    },
    MuiFormLabel: {
      styleOverrides: {
        root: {
          color: deepPurple[200],
          "&.Mui-focused": {
            color: deepPurple[400],
          },
        },
      },
    },
    MuiRadio: {
      styleOverrides: {
        root: {
          "&.Mui-checked": {
            color: deepPurple[400],
          },
        },
      },
    },
  },
});

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
                <CenterButton>
                  <RefreshButton onClick={refetchAllRoom}>
                    <RefreshIcon /> 새로고침
                  </RefreshButton>
                  <FriendButton onClick={openUserListModal}>
                    친구
                  </FriendButton>
                  <CreateRoomButton category="battle" />
                </CenterButton>
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
            <ModalOverlay>
              <ModalContent>
                <UserListSidebar />
                <CloseButton onClick={closeUserListModal}>닫기</CloseButton>
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

const CenterButton = styled.div`
  display: flex;
  margin: auto 12px 0 0;
  gap: 10px;
  height: 62px;
`

const RefreshButton = styled(Button)`
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
`

const FriendButton = styled(Button)`
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
`

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

const CloseButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
`;
