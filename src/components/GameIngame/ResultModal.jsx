import { useMemo, useEffect } from "react";
import { styled } from "styled-components";
import { useGameInfo } from "@/hooks/useGameInfo";

export default function ResultModal({
  isOpenedDialog,
  handleCloseGame,
  ourPercent = 0, // 기본값 설정
  enemyPercent = 0, // 기본값 설정
  ourTeam = [], // 기본값 설정
  enemyTeam = [], // 기본값 설정
  numOfUsingItemRed,
  numOfUsingItemBlue,
}) {
  const { image } = useGameInfo();
  const roomId = localStorage.getItem('roomId');

  const resultState = useMemo(() => {
    if (ourPercent > enemyPercent) {
      return "win";
    } else if (ourPercent === enemyPercent) {
      return "draw";
    } else {
      return "lose";
    }
  }, [ourPercent, enemyPercent]);

  const resultText = resultState === "win" ? "WIN!!" : resultState === "lose" ? "LOSE!!" : "DRAW!!";
  const resultTextColor = resultState === "win" ? "#ffc107" : resultState === "lose" ? "#373737" : "#a985ff";

  const navigateToWaitingPage = () => {
    window.location.replace(`/game/battle/waiting/${roomId}`);
  };

  ourTeam = [
    {
      id: 1,
      name: "이누야샤",
      avatar: "https://via.placeholder.com/50", // 유저 아바타 이미지
    },
    {
      id: 2,
      name: "카구라",
      avatar: "https://via.placeholder.com/50",
    }
  ]
  enemyTeam = [
    {
      id: 3,
      name: "셋쇼마루",
      avatar: "https://via.placeholder.com/50",
    },
    {
      id: 4,
      name: "미로쿠",
      avatar: "https://via.placeholder.com/50",
    },
  ]

  return (
    <Dialog open={isOpenedDialog}>
      <DialogWrapper>
        {/* 결과 텍스트 */}
        <ResultText color={resultTextColor}>{resultText}</ResultText>

        {/* 팀 정보 */}
        <ResultContainer>
          <TeamWrapper>
            <TeamName color="#3b82f6">Blue</TeamName>
            <TeamPercent color="#3b82f6">{ourPercent}%</TeamPercent>
            <TeamPlayers>
              {ourTeam.length > 0 ? (
                ourTeam.map((player) => (
                  <Player key={player.id}>
                    <PlayerAvatar src={player.avatar} alt={player.name} />
                    <PlayerName>{player.name}</PlayerName>
                  </Player>
                ))
              ) : (
                <NoPlayers>플레이어 정보가 없습니다</NoPlayers>
              )}
            </TeamPlayers>
          </TeamWrapper>

          <CenterContainer>
            {/* 중앙 이미지 */}
            <GameImageWrapper>
              <GameImage src={image} alt="Game Result" />
            </GameImageWrapper>

            {/* 확인 버튼 */}
            <ConfirmButton onClick={navigateToWaitingPage}>확인</ConfirmButton>
          </CenterContainer>

          <TeamWrapper>
            <TeamName color="#ef4444">Red</TeamName>
            <TeamPercent color="#ef4444">{enemyPercent}%</TeamPercent>
            <TeamPlayers>
              {enemyTeam.length > 0 ? (
                enemyTeam.map((player) => (
                  <Player key={player.id}>
                    <PlayerAvatar src={player.avatar} alt={player.name} />
                    <PlayerName>{player.name}</PlayerName>
                  </Player>
                ))
              ) : (
                <NoPlayers>플레이어 정보가 없습니다</NoPlayers>
              )}
            </TeamPlayers>
          </TeamWrapper>
        </ResultContainer>

      </DialogWrapper>
    </Dialog>
  );
}

const Dialog = styled.div`
  display: ${(props) => (props.open ? "flex" : "none")};
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  justify-content: center;
  align-items: center;
  backdrop-filter: blur(7px);
`;

const DialogWrapper = styled.div`
  width: 100%;
  height: 100%;
  padding: 0 50px;
  text-align: center;
  display: flex;
  flex-direction: column; /* 세로 방향으로 정렬 */
  justify-content: space-between;
  gap: 10px;
`;

const CenterContainer = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 15px;
`;

const ResultText = styled.h1`
  font-size: 140px;
  font-weight: bold;
  text-shadow: 0 0 100px white;

  background: linear-gradient(to bottom, white 15%, ${(props) => props.color} 65%);
  -webkit-text-stroke: 6px black;
  -webkit-background-clip: text; /* 텍스트 부분만 배경을 보이게 함 */
  -webkit-text-fill-color: transparent; /* 텍스트의 색상을 투명으로 설정 */
`;

const GameImageWrapper = styled.div`

`;

const GameImage = styled.img`
  max-width: 50vw;
  max-height: 50vh;
  object-fit: cover;
  border: 4px solid white;
`;

const ResultContainer = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
  gap: 50px;
  flex-grow: 1; /* 부모 컨테이너의 남은 공간을 차지 */
`;

const TeamWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 30%;
`;

const TeamName = styled.h2`
  margin-top: -40px;
  font-size: 100px;
  font-weight: bold;
  color: ${(props) => props.color};
  -webkit-text-stroke: 4px white;
`;

const TeamPercent = styled.div`
  margin-top: -30px;
  font-size: 70px;
  font-weight: bold;
  color: white;
`;

const TeamPlayers = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin: 50px auto 0;
  padding-top: 20px;
  width: 250px;
  border-top: 1px solid white;
`;

const Player = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const PlayerAvatar = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
`;

const PlayerName = styled.span`
  font-size: 30px;
  font-weight: bold;
  color: #fff;
`;

const NoPlayers = styled.div`
  font-size: 1rem;
  color: #aaa;
`;

const ConfirmButton = styled.button`
  padding: 15px 40px;
  margin: 0 auto 70px;
  font-size: 30px;
  font-weight: bold;
  background-color: #ff9800;
  color: #fff;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background 0.3s;

  &:hover {
    background-color: #e68a00;
  }
`;
