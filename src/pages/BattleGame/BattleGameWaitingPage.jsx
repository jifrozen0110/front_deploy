import { useEffect, useState, useMemo, useRef } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { styled } from "styled-components";
import { isAxiosError } from "axios";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Chatting from "@/components/Chatting";
import useExitRoom from "@/components/ExitRoom";

import Grid from "@mui/material/Unstable_Grid2";
import Button from "@mui/material/Button";

import { socket } from "@/socket-utils/socket2"; // 소켓 유틸리티

import backgroundPath from "@/assets/backgrounds/background2.png";
import { authRequest } from "../../apis/requestBuilder";
import { useGameInfo } from "../../hooks/useGameInfo";
import Typography from "@mui/material/Typography";
import { PlayerCard, EmptyPlayerCard, XPlayerCard } from "@/components/GameWaiting/PlayerCard";

import { ArrowLeft, ArrowLeftRight, Settings, UserPlus } from "lucide-react";
import { setTeam } from "../../socket-utils/storage";
import InviteModal from "@/components/GameWaiting/InviteModal";
import InviteAlertModal from "@/components/GameWaiting/InviteAlertModal";
import { parse } from "dotenv";
const { connect, send, subscribe } = socket;

export default function BattleGameWaitingPage() {
  const navigate = useNavigate();
  const { roomId } = useParams();
  const [roomData, setRoomData] = useState(null);
  const [battleTimer, setBattleTimer] = useState(null);
  const [playerCount, setPlayerCount] = useState(1);
  const [emptyPlayerCount, setEmptyPlayerCount] = useState([0, 0]);
  const [xPlayerCount, setXPlayerCount] = useState([0, 0]);
  const [gameData, setGameData] = useState(null);
  const playerId = parseInt(localStorage.getItem("userId"));
  const playerImage = localStorage.getItem("image");
  const playerName = localStorage.getItem("userName");
  const { setImage } = useGameInfo();
  const isLoading = useMemo(() => roomData === null, [roomData]);
  const [chatList, setChatList] = useState([]);
  // 초대 버튼 모달창
  const [isInviteModalOpen, setInviteModalOpen] = useState(false);
  const location = useLocation();
  
  // InviteAlertModal을 상태로 관리
  const [isInviteAlertOpen, setInviteAlertOpen] = useState(false);
  const [invitingPlayer, setInvitingPlayer] = useState(null);
  const [inviteRoomId, setInviteRoomId] = useState("");
  const createPlayerRequest = () => ({
    playerId,
    playerImage,
    playerName,
  }); 
  const [isMaster, setIsMaster] = useState(false)

  const isGameStartingRef = useRef(false);

  // 초대 수락 처리 함수
  const handleInviteAccept = () => {
    // 초대 수락 시 처리할 로직
    console.log(`${invitingPlayer.playerName}의 초대를 수락`);
    // 예: 서버에 초대 수락을 알리거나, 소켓으로 통지
    setInviteAlertOpen(false); // 모달 닫기
    exitRoom();
    enterRoom(inviteRoomId);
    navigate(`/game/battle/waiting/${inviteRoomId}`);
  };

  const handleInviteDecline = () => {
    // 초대 거절 시 처리할 로직
    console.log(`${invitingPlayer.playerName}의 초대를 거절`);
    // 예: 서버에 초대 거절을 알리거나, 소켓으로 통지
    setInviteAlertOpen(false); // 모달 닫기
  };

  // 초대 버튼 클릭 핸들러
  const handleInviteClick = () => {
    setInviteModalOpen(true);
  };

  const enterRoom = (roomId) => {
    console.log("방 입장~");
    send(`/pub/room/${roomId}/enter`, {}, JSON.stringify(createPlayerRequest()));
  };
  const exitRoom = () => {
    console.log("방 나가기~");
    send(`/pub/room/${roomId}/exit`, {}, JSON.stringify(createPlayerRequest()));
  };
  const switchTeam = () => {
    console.log("팀 바꾸기~");
    send(`/pub/room/${roomId}/switch`, {}, JSON.stringify(createPlayerRequest()));
  };
  const startGame = () => {
     // 방장인지 확인
    if (!isMaster) return;

    // 파란팀과 빨간팀에 플레이어가 있는지 확인
    if (roomData.bluePlayers.length === 0 && roomData.redPlayers.length === 0) {
      alert("양쪽 팀에 플레이어가 없습니다.");
      return;
    }

    if (roomData.bluePlayers.length === 0) {
      alert("파란팀에 플레이어가 없습니다.");
      return;
    }

    if (roomData.redPlayers.length === 0) {
      alert("빨간팀에 플레이어가 없습니다.");
      return;
    }
    
    console.log("게임 시작~");
    send(`/pub/room/${roomId}/start`, {}, JSON.stringify(createPlayerRequest()));
  };

  const makeEmptyPlayer = (count) => {
    return Array(count)
      .fill(null)
      .map((_, i) => <EmptyPlayerCard key={`empty-${i}`} />);
  };

  const makeXPlayer = (count) => {
    return Array(count)
      .fill(null)
      .map((_, i) => <XPlayerCard key={`xplayer-${i}`} />);
  };

  const isNotInRoom = () => {
    const playerId = parseInt(localStorage.getItem("userId"), 10); // 현재 사용자 ID

    if (!roomData || !Array.isArray(roomData.redPlayers) || !Array.isArray(roomData.bluePlayers)) {
      return true; // roomData가 없거나 플레이어 정보가 없으면 방에 없다고 판단
    }

    // 플레이어가 redPlayers나 bluePlayers에 존재하는지 확인
    const isInRedTeam = roomData.redPlayers.some((player) => player.playerId === playerId);
    const isInBlueTeam = roomData.bluePlayers.some((player) => player.playerId === playerId);

    return !(isInRedTeam || isInBlueTeam); // 둘 중 하나라도 true면 방에 있음 -> 반대로 반환
  };

  const connectSocket = async (roomId) => {
    connect(() => {
      console.log("@@@@@@@@@@@@@@@@ 대기실 소켓 연결 @@@@@@@@@@@@@@@@@@");
      subscribe(`/topic/room/${roomId}`, (message) => {
        const data = JSON.parse(message.body);
        const halfPlayers = Math.ceil(data.maxPlayers / 2);
        setRoomData(data);
        setIsMaster(data.master===playerId)
        setPlayerCount(data.nowPlayers);
        setEmptyPlayerCount([
          Math.max(0, halfPlayers - data.redPlayers.length),
          Math.max(0, halfPlayers - data.bluePlayers.length),
        ]);
        setXPlayerCount([Math.max(0, 4 - halfPlayers), Math.max(0, 4 - halfPlayers)]);
        if (data.bluePlayers.map(p => p.playerId).includes(Number(playerId))) {
          setTeam("blue")
        } else if (data.redPlayers.map(p => p.playerId).includes(Number(playerId))) {
          setTeam("red")
        }

        // if (data.blueTeam && data.blueTeam.players && Array.isArray(data.blueTeam.players)) {
        //   data.blueTeam.players.forEach((player) => {
        //     console.log(player);
        //     if (player.id === getSender()) {
        //       setTeam("blue");
        //     }
        //   });
        // }
      });

      subscribe(`/topic/room/${roomId}/game`, (message) => {
        const data = JSON.parse(message.body);
        // 1. 게임이 시작되면 인게임 화면으로 보낸다.
        if (data.gameId && Boolean(data.isStarted) && !Boolean(data.isFinished)) {
          isGameStartingRef.current = true;
          setGameData(data);
          setImage(
            "https://i.namu.wiki/i/1zQlFS0_ZoofiPI4-mcmXA8zXHEcgFiAbHcnjGr7RAEyjwMHvDbrbsc8ekjZ5iWMGyzJrGl96Fv5ZIgm6YR_nA.webp",
          );
          localStorage.setItem("roomId", roomId);
          window.location.replace(`/game/battle/ingame/${data.gameId}`);
          // window.location.replace(`/game/battle/ingame/${roomId}`);
          return;
        }
      });

      subscribe(`/topic/chat/room/${roomId}`, (message) => {
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

      enterRoom(roomId);

      // subscribe(`/topic/chat/room/${roomId}`, (message) => {
      //   const data = JSON.parse(message.body);
      //   const { userid, chatMessage, time } = data;
      //   const receivedMessage = { userid, chatMessage, time }; // 받은 채팅
      //   setChatHistory((prevChat) => [...prevChat, receivedMessage]); // 채팅 기록에 새로운 채팅 추가
      // });

      // // 서버로 메시지 전송
      // send(
      //   "/app/room/enter",
      //   {},
      //   JSON.stringify({
      //     roomId: getRoomId(),
      //   }),
      // );
    });
  };

  const initialize = async () => {
    try {
      const response = await authRequest().get(`/api/rooms/${roomId}`);
      const halfPlayers = Math.ceil(response.data.maxPlayers / 2);
      setIsMaster(response.data.master===playerId)
      setRoomData(response.data);
      setBattleTimer(response.data.battleTimer);
      setPlayerCount(response.data.nowPlayers);
      setEmptyPlayerCount([
        Math.max(0, halfPlayers - response.data.redPlayers.length),
        Math.max(0, halfPlayers - response.data.bluePlayers.length),
      ]);
      setXPlayerCount([Math.max(0, 4 - halfPlayers), Math.max(0, 4 - halfPlayers)]);

      // WebSocket 연결 시도
      await connectSocket(response.data.roomId);
    } catch (e) {
      if (isAxiosError(e) && e.response?.status >= 400) {
        console.error("방 정보를 불러오지 못했습니다.", e.message);
        // navigate("/game/battle", { replace: true });
        navigate("/home", { replace: true });
      }
    }
  };

  useExitRoom(exitRoom, isGameStartingRef);

  useEffect(() => {
    initialize();
  }, []);

  if (isLoading) {
    return (
      <Wrapper>
        <Header />
        <div>Loading...</div>
        <Footer />
      </Wrapper>
    );
  } else if (roomData.maxPlayers <= roomData.nowPlayers && isNotInRoom()) {
    alert("방이 꽉 찼습니다.");
    // setTimeout(() => navigate("/game/battle"), 100);
    setTimeout(() => navigate("/home"), 100);
  }

  return (
    <Wrapper>
      {/* 왼쪽 채팅 */}

      {/* 나머지 콘텐츠 */}
      <Content>
        <Top>
          <ButtonGroup>
            {/* <TopButton onClick={() => navigate("/game/battle")}> */}
            <TopButton onClick={() => navigate("/home")}>
              <div style={{ textAlign: "center" }}>
                <ArrowLeft style={{ display: "block", margin: "0 auto" }} />
                나가기
              </div>
            </TopButton>
            <TopButton onClick={switchTeam}>
              <div style={{ textAlign: "center" }}>
                <ArrowLeftRight style={{ display: "block", margin: "0 auto" }} />
                이동
              </div>
            </TopButton>
            {/* <TopButton>
              <div style={{ textAlign: "center" }}>
                <Settings style={{ display: "block", margin: "0 auto" }} />
                설정
              </div>
            </TopButton> */}
            <TopButton onClick={handleInviteClick}>
              <div style={{ textAlign: "center" }}>
                <UserPlus style={{ display: "block", margin: "0 auto" }} />
                초대
              </div>
            </TopButton>
          </ButtonGroup>
        </Top>
        <Body>
          <MainSection>
            {/* 팀 정보 */}
            <TeamSection>
              <Team style={{ backgroundColor: "rgba(91, 175, 254, 0.6)" }}>파란팀</Team>
              <TeamGrid>
                {roomData.bluePlayers.map((player, i) => (
                  <PlayerCard key={`blue-player-${i}`} player={player} master={roomData.master} color="blue" />
                ))}
                {makeEmptyPlayer(emptyPlayerCount[1])}
                {makeXPlayer(xPlayerCount[1])}
              </TeamGrid>
            </TeamSection>

            <Versus>VS</Versus>

            <TeamSection>
              <Team style={{ backgroundColor: "rgba(254, 91, 94, 0.6)" }}>빨간팀</Team>
              <TeamGrid>
                {roomData.redPlayers.map((player, i) => (
                  <PlayerCard key={`red-player-${i}`} player={player} master={roomData.master} color="red" />
                ))}
                {makeEmptyPlayer(emptyPlayerCount[0])}
                {makeXPlayer(xPlayerCount[0])}
              </TeamGrid>
            </TeamSection>
          </MainSection>

          <PuzzleDetails>
            <PuzzleImage src={roomData.puzzleImage} alt="Puzzle" />
            <Details>
              <Title>{roomData.roomName}</Title>
              <Divider />
              <Typography variant="subtitle1">
                {battleTimer/60} 분
              </Typography>
              <Typography variant="subtitle1">{roomData.puzzlePiece} 피스</Typography>
              <StartButton isMaster={isMaster} onClick={() => isMaster && startGame()}>시작</StartButton>
            </Details>
          </PuzzleDetails>
        </Body>
        <LeftSidebar>
          <Chatting
            chatList={chatList}
            path={"/pub/chat/room"}
            defualtData={{ roomId, roomName: roomData.roomName }}
          />
        </LeftSidebar>
      </Content>
      <InviteModal
        isOpen={isInviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
        roomId={roomId}
      />
      <InviteAlertModal
        isOpen={isInviteAlertOpen}
        onClose={() => setInviteAlertOpen(false)}
        roomId={roomId}
        inviter={invitingPlayer}
        onAccept={handleInviteAccept}
        onDecline={handleInviteDecline}
      />
    </Wrapper>
  );
}

const Wrapper = styled.div`
  display: flex; /* Flex 컨테이너 */
  height: 100vh;
  background-image: url(${backgroundPath});
  background-size: cover;
  background-attachment: fixed;
  margin: 0 auto;
  user-select: none; /* 텍스트 선택 금지 */
`;

const LeftSidebar = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  max-height: 300px;
`;

const Content = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: center;
  align-item: center;
  padding: 10vh 15vw 2vh 15vw;
  boxsizing: border-box;
  max-height: 100%;
  min-width: 1000px;
  gap: 10px;
`;

const Team = styled.div`
  max-width: 400px;
  padding: 5px 10px;
  font-weight: bold;
  font-size: 20px;
  border-radius: 5px;
  border: white solid 2px;
  color: white;
`;

const Top = styled.div`
  align-items: center;
  width: 100%;
`;

const TopButton = styled(Button)`
  background-color: white;
  color: black;
  height: 80px;
  padding: 0 30px;
  position: relative;
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.25);

  &:hover {
    background-color: orange;
    color: white;

    /* 호버 시 내부 img 요소에 스타일 적용 */
    .icon {
      filter: brightness(0) invert(1); /* 흰색으로 변경 */
    }
  }

  .icon {
    transition: filter 0.3s ease; /* 부드러운 전환 효과 */
  }
`;

const Body = styled.div`
  display: flex;
  justify-content: space-between;
  // margin-top: 10px;
  width: 100%;
  gap: 30px;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 10px;
`;

const Title = styled.h1`
  font-weight: bold;
  font-size: 35px;
  color: white;
`;

const MainSection = styled.div`
  display: flex;
  justify-content: space-between;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(20px);
  width: 70%;
  padding: 60px;
  border-radius: 5px;
`;

const TeamSection = styled.div`
  flex: 1;
`;

const TeamGrid = styled(Grid)`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  padding: 30px 0px 0;
`;

const Versus = styled.div`
  font-size: 2rem;
  font-weight: bold;
  color: white;
  margin: auto 60px;
`;

const PuzzleDetails = styled.div`
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(20px);
  color: white;
  padding: 5px;
  width: 30%;
  align-items: center;
  border-radius: 5px;
`;

const PuzzleImage = styled.img`
  width: 100%;
  max-height: 300px;
  object-fit: contain
`;

const Details = styled.div`
  padding: 10px 20px;
  text-align: left;
`;

const StartButton = styled(Button)`
  background-color: ${({ isMaster }) => (isMaster ? "orange" : "lightgray")};
  margin-top:30px;
  color: white;
  width: 100%;
  font-weight: bold;
  font-size: 30px;
  border-radius: 5px;
  cursor: ${({ isMaster }) => (isMaster ? "pointer" : "not-allowed")};
  opacity: ${({ isMaster }) => (isMaster ? 1 : 0.6)};

  &:hover {
    background-color: ${({ isMaster }) => (isMaster ? "darkorange" : "lightgray")};
  }
`;



const Divider = styled.div`
  margin: 10px 0;
  height: 0;
  weight: 100%;
  border-bottom: white solid 1px;
`;
