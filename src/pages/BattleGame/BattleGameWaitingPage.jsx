import { useEffect, useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styled from "styled-components";
import { isAxiosError } from "axios";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import GameWaitingBoard from "@/components/GameWaiting/GameWaitingBoard";
import Loading from "@/components/Loading";

import Grid from "@mui/material/Unstable_Grid2";
import Button from "@mui/material/Button";

import { getSender, getRoomId, setTeam } from "@/socket-utils/storage";
import { socket } from "@/socket-utils/socket2";
import { request } from "@/apis/requestBuilder";

import backgroundPath from "@/assets/backgrounds/background.png";
import { useGameInfo } from "../../hooks/useGameInfo";
import { authRequest } from "../../apis/requestBuilder";

import Typography from "@mui/material/Typography";
import { PlayerCard, EmptyPlayerCard, XPlayerCard } from "@/components/GameWaiting/PlayerCard";

import LeftArrow from "@/assets/icons/gameRoom/left_arrow.png";
import Gear from "@/assets/icons/gameRoom/gear.png";
import Invite from "@/assets/icons/gameRoom/invite.png";
import TeamChange from "@/assets/icons/gameRoom/team_change.png";

const { connect, send, subscribe } = socket;

export default function BattleGameWaitingPage() {
  // const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { roomId } = useParams();
  const [roomData, setRoomData] = useState(null);
  const [chatHistory, setChatHistory] = useState([]); // 채팅 기록을 저장하는 상태 추가
  const [emptyPlayerCount, setEmptyPlayerCount] = useState([0, 0])
  const [xPlayerCount, setXPlayerCount] = useState([0, 0])

  const { setImage } = useGameInfo();
 
  const isLoading = useMemo(() => {
    return roomData === null;
  }, [roomData]);

  useEffect(() => {
    const fetchRoomData = async () => {
      try {
        const response = await authRequest().get(`/api/rooms/${roomId}`);
        const halfPlayers = Math.ceil(response.data.maxPlayers / 2);
        setRoomData(response.data);
        setEmptyPlayerCount([Math.max(0, halfPlayers - response.data.redPlayers.length), Math.max(0, halfPlayers - response.data.bluePlayers.length)])
        setXPlayerCount([Math.max(0, 4 - halfPlayers), Math.max(0, 4 - halfPlayers)])
        console.log("============");
        console.log(roomData);
        console.log(response.data);
        console.log(emptyPlayerCount);
        console.log(xPlayerCount);
        console.log("============");
      } catch (error) {
        console.error("Error fetching room data:", error);
      }
    };
  
    fetchRoomData();
  }, [roomId]);

  if (isLoading) {
    return (
      <Wrapper>
        <Header />
        <Loading message="방 정보 불러오는 중..." />
        <Footer />
      </Wrapper>
    );
  }

  const makeEmptyPlayer = (count) => {
    return Array(count)
      .fill(null)
      .map((_, i) => (
        <EmptyPlayerCard key={`empty-${i}`} />
      ));
  };

  const makeXPlayer = (count) => {
    return Array(count)
      .fill(null)
      .map((_, i) => (
        <XPlayerCard key={`xplayer-${i}`} />
      ));
  };

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
          <TopButton>
            <div style={{textAlign:"center"}}>
              <img src={TeamChange} alt="이동" className="icon" style={{display:"block", margin:"0 auto"}} />
              이동
            </div>
          </TopButton>
          <TopButton>
            <div style={{textAlign:"center"}}>
              <img src={Gear} alt="설정" className="icon" style={{display:"block", margin:"0 auto"}} />
              설정
            </div>
          </TopButton>
          <TopButton>
            <div style={{textAlign:"center"}}>
              <img src={Invite} alt="초대" className="icon" style={{display:"block", margin:"0 auto"}} />
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
              {roomData.redPlayers.map((player, i) => (
                <PlayerCard key={`red-player-${i}`} player={player} color="blue" />
              ))}
              {makeEmptyPlayer(emptyPlayerCount[0])}
              {makeXPlayer(xPlayerCount[0])}
            </TeamGrid>
          </TeamSection>

          <Versus>VS</Versus>

          <TeamSection>
            <Team>빨간팀</Team>
            <TeamGrid>
              {roomData.bluePlayers.map((player, i) => (
                <PlayerCard key={`blue-player-${i}`} player={player} color="red" />
              ))}
              {makeEmptyPlayer(emptyPlayerCount[1])}
              {makeXPlayer(xPlayerCount[1])}
            </TeamGrid>
          </TeamSection>
        </MainSection>

        <PuzzleDetails>
          <PuzzleImage>
            {/* <img src={data.image} alt="Puzzle" /> */}
            <img src="https://images.unsplash.com/photo-1731413263252-cbce5c09f8c2?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="Puzzle" />
          </PuzzleImage>
          <Details style={{borderBottom: "white solid 1px"}}>
            <Title>{roomData.roomName}</Title>
          </Details>
          <Details>
            <Typography variant="subtitle1" style={{fontSize: "35px"}}>{roomData.gameMode}</Typography>
            <Typography variant="subtitle1" style={{fontSize: "35px"}}>{roomData.puzzlePiece} 피스</Typography>
            <Typography variant="subtitle1" style={{fontSize: "35px"}}>{roomData.nowPlayers}/{roomData.maxPlayers}</Typography>
            <StartButton>시작</StartButton>
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