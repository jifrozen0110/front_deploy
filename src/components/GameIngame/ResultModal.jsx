import { useMemo, useEffect } from "react";
import { styled } from "styled-components";
import { PlayerCard } from "@/components/GameWaiting/PlayerCard";
import { getTeam, getRoomId } from "@/socket-utils/storage";
import { useGameInfo } from "@/hooks/useGameInfo";
import { socket } from "@/socket-utils/socket2";

import { resultAudio } from "@/puzzle-core/addAudio";
import win from "@/assets/audio/win.mp3";
import lose from "@/assets/audio/lose.mp3";
import draw from "@/assets/audio/rocket.wav";

export default function ResultModal({
  isOpenedDialog,
  handleCloseGame,
  ourPercent = 0, // 기본값 설정
  enemyPercent = 0, // 기본값 설정
  ourTeam = [], // 기본값 설정
  enemyTeam = [], // 기본값 설정
  numOfUsingItemRed,
  numOfUsingItemBlue,
  isGameEndingRef,
  image,
}) {
  const bluePercent = getTeam() === "blue" ? ourPercent : enemyPercent;
  const redPercent = getTeam() === "red" ? ourPercent : enemyPercent;
  const blueTeam = getTeam() === "blue" ? ourTeam : enemyTeam;
  const redTeam = getTeam() === "red" ? ourTeam : enemyTeam;

  // **Round the percentages to one decimal place**
  const bluePercentRounded = parseFloat(bluePercent.toFixed(1));
  const redPercentRounded = parseFloat(redPercent.toFixed(1));

  const resultState = useMemo(() => {
    if (ourPercent === enemyPercent) {
      return "draw";
    } else if (ourPercent > enemyPercent || enemyTeam.length==0) {
      return "win";
    } else {
      return "lose";
    }
  }, [ourPercent, enemyPercent]);

  const resultText = resultState === "win" ? "WIN!!" : resultState === "lose" ? "LOSE" : "DRAW";
  const resultTextColor =
    resultState === "win" ? "#ffc107" : resultState === "lose" ? "#373737" : "#a985ff";
  // const winColor = getTeam() === "blue" && resultState === "win" ? "blue" : getTeam() === "red" && resultState === "win"? "red" : "draw";
  const winColor = resultState === "draw"? "draw" : (getTeam() === "blue" && resultState === "win") || (getTeam() === "red" && resultState === "lose")? "blue" : "red";
  const resultBlueTeamColor = winColor === "blue" || winColor === "draw" ? "#3b82f6" : "#373737"
  const resultRedTeamColor = winColor === "red" || winColor === "draw" ? "#ef4444" : "#373737"

  const roomId = localStorage.getItem("roomId");

  const navigateToWaitingPage = () => {
    isGameEndingRef.current = true;
    window.location.replace(`/game/battle/waiting/${roomId}`);
  };

  useEffect(() => {
    if (isOpenedDialog == true) {
      if (ourPercent > enemyPercent || enemyTeam.length==0) {
        resultAudio(win);
      } else if (ourPercent === enemyPercent) {
        resultAudio(draw);
      } else {
        resultAudio(lose);
      }
    }
  }, [isOpenedDialog]);

  return (
    <Dialog open={isOpenedDialog}>
      <DialogWrapper>
        {/* 결과 텍스트 */}
        <ResultTextWrapper state={resultState} color={resultTextColor}>
          {resultText.split("").map((char, index) => (
            <AnimatedLetter key={index} index={index} state={resultState} color={resultTextColor}>
              {char}
            </AnimatedLetter>
          ))}
        </ResultTextWrapper>

        {/* 팀 정보 */}
        <ResultContainer>
          <TeamWrapper>
            <TeamName color={resultBlueTeamColor}>Blue</TeamName>
            <TeamPercent color={resultBlueTeamColor}>{bluePercentRounded}%</TeamPercent>
            <TeamPlayers>
              {blueTeam.length > 0 ? (
                blueTeam.map((player) => (
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
            <ConfirmButton onClick={navigateToWaitingPage}>게임 대기실로 가기</ConfirmButton>
          </CenterContainer>

          <TeamWrapper>
            <TeamName color={resultRedTeamColor}>Red</TeamName>
            <TeamPercent color={resultRedTeamColor}>{redPercentRounded}%</TeamPercent>
            <TeamPlayers>
              {redTeam.length > 0 ? (
                redTeam.map((player) => (
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
  z-index: 10;
`;

const DialogWrapper = styled.div`
  width: 100%;
  height: 100%;
  padding: 0 50px;
  text-align: center;
  display: flex;
  flex-direction: column;
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

const ResultTextWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 5px;
`;

const AnimatedLetter = styled.span`
  font-size: 140px;
  font-weight: bold;
  text-shadow: 0 0 100px white;

  background: linear-gradient(to bottom, white 20%, ${(props) => props.color} 65%);
  -webkit-text-stroke: 6px black;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  display: inline-block;

  animation: ${(props) =>
    props.state === "win"
      ? "winEffect 1.5s infinite"
      : props.state === "lose"
        ? "loseEffect 5s infinite"
        : "drawEffect 1.5s infinite"};
  animation-delay: ${(props) => (props.state === "lose" ? 0 : props.index * 0.1)}s;

  @keyframes winEffect {
    0% {
      transform: translateY(0);
      text-shadow:
        0 0 20px ${(props) => props.color},
        0 0 40px ${(props) => props.color};
    }
    50% {
      transform: translateY(-15px);
      text-shadow:
        0 0 30px white,
        0 0 60px ${(props) => props.color};
    }
    100% {
      transform: translateY(0);
      text-shadow:
        0 0 20px ${(props) => props.color},
        0 0 40px ${(props) => props.color};
    }
  }

  @keyframes loseEffect {
    0% {
      transform: translateY(0) scale(1);
      opacity: 1;
    }
    20% {
      transform: translateY(-5px) scale(1); /* 위로 살짝 올라감 */
      opacity: 0.7;
    }
    60% {
      transform: translateY(25px) scale(0.9); /* 더 아래로 내려감 */
      opacity: 0.3;
    }
    100% {
      transform: translateY(0) scale(1); /* 원래 위치로 복귀 */
      opacity: 1;
    }
  }

  @keyframes drawEffect {
    0% {
      transform: rotate(0);
    }
    25% {
      transform: rotate(-3deg);
    }
    50% {
      transform: rotate(3deg);
    }
    75% {
      transform: rotate(-3deg);
    }
    100% {
      transform: rotate(0);
    }
  }
`;

const GameImageWrapper = styled.div``;

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
  -webkit-text-stroke: 4px ${(props) => props.color === "#373737"? "#666666" : "white"};
`;

const TeamPercent = styled.div`
  margin-top: -30px;
  font-size: 70px;
  font-weight: bold;
  color: ${(props) => props.color};
  -webkit-text-stroke: 4px ${(props) => props.color === "#373737"? "#666666" : "white"};
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
