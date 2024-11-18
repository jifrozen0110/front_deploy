import { useEffect, useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styled from "styled-components";

import Header from "@/components/Header";
import Footer from "@/components/Footer";

import Grid from "@mui/material/Unstable_Grid2";
import Button from "@mui/material/Button";

import { socket } from "@/socket-utils/socket2"; // 소켓 유틸리티

import backgroundPath from "@/assets/backgrounds/background.png";
import { authRequest } from "../../apis/requestBuilder";

import Typography from "@mui/material/Typography";
import { PlayerCard, EmptyPlayerCard, XPlayerCard } from "@/components/GameWaiting/PlayerCard";

import LeftArrow from "@/assets/icons/gameRoom/left_arrow.png";
import Gear from "@/assets/icons/gameRoom/gear.png";
import Invite from "@/assets/icons/gameRoom/invite.png";
import TeamChange from "@/assets/icons/gameRoom/team_change.png";

const { connect, send, subscribe } = socket;

export default function BattleGameWaitingPage() {
  const navigate = useNavigate();
  const { roomId } = useParams();
  const [roomData, setRoomData] = useState(null);
  const [emptyPlayerCount, setEmptyPlayerCount] = useState([0, 0]);
  const [xPlayerCount, setXPlayerCount] = useState([0, 0]);

  const isLoading = useMemo(() => roomData === null, [roomData]);

  // 소켓 연결 및 이벤트 처리
  useEffect(() => {
    const handleRoomEvent = (message) => {
      const data = JSON.parse(message.body);
      console.log("Room Event:", data);

      switch (data.event) {
        case "enter":
          console.log("방 입장:", data.message);
          break;
        case "exit":
          console.log("방 나가기:", data.message);
          break;
        case "switch":
          console.log("팀 변경:", data.message);
          break;
        case "start":
          console.log("게임 시작:", data.message);
          break;
        default:
          console.log("알 수 없는 이벤트:", data);
      }
    };

    console.log('connecting...')
    
    // 소켓 연결 및 구독
    connect(() => {
      console.log("WebSocket 연결 성공");
      subscribe(`/topic/room/${roomId}`, handleRoomEvent);
    });
    console.log('connecting execed')
    return () => {
      socket.disconnect(); // 소켓 연결 해제
    };
  }, [roomId]);

  useEffect(() => {
    const fetchRoomData = async () => {
      try {
        const response = await authRequest().get(`/api/rooms/${roomId}`);
        const halfPlayers = Math.ceil(response.data.maxPlayers / 2);
        setRoomData(response.data);
        setEmptyPlayerCount([
          Math.max(0, halfPlayers - response.data.redPlayers.length),
          Math.max(0, halfPlayers - response.data.bluePlayers.length),
        ]);
        setXPlayerCount([Math.max(0, 4 - halfPlayers), Math.max(0, 4 - halfPlayers)]);
      } catch (error) {
        console.error("Error fetching room data:", error);
      }
    };

    fetchRoomData();
  }, [roomId]);

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

  const enterRoom = () => send(`/pub/room/${roomId}/enter`, {}, JSON.stringify({ roomId }));
  const exitRoom = () => send(`/pub/room/${roomId}/exit`, {}, JSON.stringify({ roomId }));
  const switchTeam = () => send(`/pub/room/${roomId}/switch`, {}, JSON.stringify({ roomId }));
  const startGame = () => send(`/pub/room/${roomId}/start`, {}, JSON.stringify({ roomId }));

  if (isLoading) {
    return (
      <Wrapper>
        <Header />
        <div>Loading...</div>
        <Footer />
      </Wrapper>
    );
  }

  return (
    <Wrapper>
      <Top>
        <ButtonGroup>
          <TopButton onClick={() => navigate("/game/battle")}>
            <div style={{ textAlign: "center" }}>
              <img src={LeftArrow} alt="나가기" className="icon" style={{ display: "block", margin: "0 auto" }} />
              나가기
            </div>
          </TopButton>
          <TopButton onClick={switchTeam}>
            <div style={{ textAlign: "center" }}>
              <img src={TeamChange} alt="이동" className="icon" style={{ display: "block", margin: "0 auto" }} />
              이동
            </div>
          </TopButton>
          <TopButton>
            <div style={{ textAlign: "center" }}>
              <img src={Gear} alt="설정" className="icon" style={{ display: "block", margin: "0 auto" }} />
              설정
            </div>
          </TopButton>
          <TopButton>
            <div style={{ textAlign: "center" }}>
              <img src={Invite} alt="초대" className="icon" style={{ display: "block", margin: "0 auto" }} />
              초대
            </div>
          </TopButton>
        </ButtonGroup>
      </Top>

      <Body>
        <MainSection>
          <TeamSection>
            <Team>파란팀</Team>
            <TeamGrid>
              {roomData.bluePlayers.map((player, i) => (
                <PlayerCard key={`blue-player-${i}`} player={player} color="blue" />
              ))}
              {makeEmptyPlayer(emptyPlayerCount[1])}
              {makeXPlayer(xPlayerCount[1])}
            </TeamGrid>
          </TeamSection>

          <Versus>VS</Versus>

          <TeamSection>
            <Team>빨간팀</Team>
            <TeamGrid>
              {roomData.redPlayers.map((player, i) => (
                <PlayerCard key={`red-player-${i}`} player={player} color="red" />
              ))}
              {makeEmptyPlayer(emptyPlayerCount[0])}
              {makeXPlayer(xPlayerCount[0])}
            </TeamGrid>
          </TeamSection>
        </MainSection>

        <PuzzleDetails>
          <PuzzleImage>
            <img
              src="https://images.unsplash.com/photo-1731413263252-cbce5c09f8c2?q=80&w=2940&auto=format&fit=crop"
              alt="Puzzle"
            />
          </PuzzleImage>
          <Details>
            <Title>{roomData.roomName}</Title>
            <Typography variant="subtitle1">{roomData.gameMode}</Typography>
            <Typography variant="subtitle1">{roomData.puzzlePiece} 피스</Typography>
            <Typography variant="subtitle1">{roomData.nowPlayers}/{roomData.maxPlayers}</Typography>
            <StartButton onClick={startGame}>시작</StartButton>
          </Details>
        </PuzzleDetails>
      </Body>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  height: 100%;
  background-image: url(${backgroundPath});
  background-size: cover;
  background-attachment: fixed;
  margin: 0 auto;
  padding: 60px 30px;
  user-select: none; /* 텍스트 선택 금지 */
`;

const Team = styled.div`
  width: 70%;
  padding: 10px;
  font-weight: bold;
  font-size: 30px;
  border-radius: 5px;
  border: white solid 1px;
  color: white
`

const Top = styled.div`
  align-items: center;
  width: 100%;
`;

const TopButton = styled(Button)`
  background-color: white;
  color: black;
  height: 100px;
  padding: 0 40px;
  position: relative;
  box-shadow: 0 2px 4px 0 rgba(0,0,0,0.25);

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
  margin-top: 10px;
  width: 100%;
  gap: 30px;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 10px;
`;

const Title = styled.h1`
  font-weight: bold;
  font-size: 46px;
  color: white;
`;

const MainSection = styled.div`
  display: flex;
  justify-content: space-between;
  background: rgba(0,0,0,0.7);
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
  background: rgba(0,0,0,0.7);
  backdrop-filter: blur(20px);
  color: white;
  padding: 5px;
  width: 30%;
  align-items: center;
  border-radius: 5px;
`;

const PuzzleImage = styled.div`
  width: 100%;
  img {
    width: 100%;
  }
`;

const Details = styled.div`
  padding: 10px 20px;
  text-align: left;
`;

const StartButton = styled(Button)`
  margin-top: 10px;
  background-color: orange;
  color: white;
  width: 100%;
  height: 90px;
  font-size: 35px;
  font-weight: bold;
  &:hover {
    background-color: darkorange;
  }
`;

const Divider = styled.div`
  height: 0;
  weight: 100%;
  border-bottom: white solid 1px;
`