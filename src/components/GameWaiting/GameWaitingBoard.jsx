import { useState } from "react";
import styled from "styled-components";
import Grid from "@mui/material/Unstable_Grid2";
import Typography from "@mui/material/Typography";
import { PlayerCard, EmptyPlayerCard, XPlayerCard } from "@/components/GameWaiting/PlayerCard";
import Button from "@mui/material/Button";
import LeftArrow from "@/assets/icons/gameRoom/left_arrow.png";
import Gear from "@/assets/icons/gameRoom/gear.png";
import Invite from "@/assets/icons/gameRoom/invite.png";
import TeamChange from "@/assets/icons/gameRoom/team_change.png";

export default function GameWaitingBoard(props) {
  const { data, allowedPiece, category } = props;
  const redTeams = data.player.filter((player) => player.isRedTeam);
  const blueTeams = data.player.filter((player) => !player.isRedTeam);

  let emptyPlayerCount = [0, 0];
  if (category === "battle") {
    emptyPlayerCount[0] = parseInt(data.maxPlayerCount / 2) - redTeams.length;
    emptyPlayerCount[1] = parseInt(data.maxPlayerCount / 2) - blueTeams.length;
  }

  const makeEmptyPlayer = (count) => {
    return Array(count)
      .fill(null)
      .map((_, i) => (
        <EmptyPlayerCard />
      ));
  };

  const gameStartCallback = () => {
    send(
      `/app/room/start`,
      {},
      JSON.stringify({
        roomId: gameId,
      }),
    );
  };

  const handleGameStart = () => {
    if (!getSender()) {
      window.alert("방을 다시 생성해주세요.");
      return;
    }
    setIsShowToIngameLoadingModal(true);
  };

  const handleChangeTeam = (value) => {
    const targetTeamLength = value === "red" ? redTeam.players.length : blueTeam.players.length;

    if (getTeam() === value) {
      // alert(`이미 ${value}팀입니다!`);
      setSnackMessage(`이미 ${value}팀입니다!`);
      setSnackOpen(true);
    } else if (parseInt(roomSize / 2) === targetTeamLength) {
      // alert(`${value}팀의 정원이 가득찼습니다!`);
      setSnackMessage(`${value}팀의 정원이 가득찼습니다!`);
      setSnackOpen(true);
    } else {
      setTeam(value);
      setTeamSocket();
    }
  };

  const handleSnackClose = () => {
    setSnackOpen(false);
  };

  const theme = createTheme({
    typography: {
      fontFamily: "'Galmuri11', sans-serif",
    },
    palette: {
      redTeam: {
        light: red[300],
        main: red[400],
        dark: red[500],
        darker: red[600],
        contrastText: "#fff",
      },
      blueTeam: {
        light: blue[300],
        main: blue[400],
        dark: blue[500],
        darker: blue[600],
        contrastText: "#fff",
      },
      purple: {
        light: deepPurple[200],
        main: deepPurple[300],
        dark: deepPurple[400],
        darker: deepPurple[600],
        contrastText: "#fff",
      },
    },
  });

  return (
    <Wrapper container spacing={4}>
      <Header>
        <ButtonGroup>
          <HeaderButton>
            <div style={{ textAlign: "center" }}>
              <img src={LeftArrow} alt="나가기" className="icon" style={{ display: "block", margin: "0 auto" }} />
              나가기
            </div>
          </HeaderButton>
          <HeaderButton>
            <div style={{textAlign:"center"}}>
              <img src={TeamChange} alt="이동" className="icon" style={{display:"block", margin:"0 auto"}} />
              이동
            </div>
          </HeaderButton>
          <HeaderButton>
            <div style={{textAlign:"center"}}>
              <img src={Gear} alt="설정" className="icon" style={{display:"block", margin:"0 auto"}} />
              설정
            </div>
          </HeaderButton>
          <HeaderButton>
            <div style={{textAlign:"center"}}>
              <img src={Invite} alt="초대" className="icon" style={{display:"block", margin:"0 auto"}} />
              초대
            </div>
          </HeaderButton>
        </ButtonGroup>
      </Header>

      <Body>
        <MainSection>
          <TeamSection>
            <Team variant="h6" color="blue">파란팀</Team>
            <TeamGrid>
              {redTeams.map((player) => (
                <PlayerCard player={player} color="blue" />
              ))}
              {makeEmptyPlayer(emptyPlayerCount[2])}
              {makeEmptyPlayer(emptyPlayerCount[2])}
            </TeamGrid>
          </TeamSection>

          <Versus>VS</Versus>

          <TeamSection>
            <Team variant="h6" color="red">빨간팀</Team>
            <TeamGrid>
              {blueTeams.map((player) => (
                <PlayerCard player={player} color="red" />
              ))}
              {makeEmptyPlayer(emptyPlayerCount[2])}
              {makeEmptyPlayer(emptyPlayerCount[2])}
            </TeamGrid>
          </TeamSection>
        </MainSection>

        <PuzzleDetails>
          <PuzzleImage>
            {/* <img src={data.image} alt="Puzzle" /> */}
            <img src="https://images.unsplash.com/photo-1731413263252-cbce5c09f8c2?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="Puzzle" />
          </PuzzleImage>
          <Details style={{borderBottom: "white solid 1px"}}>
            <Title>{data.title}</Title>
          </Details>
          <Details>
            <Typography variant="subtitle1" style={{fontSize: "35px"}}>아이템전</Typography>
            <Typography variant="subtitle1" style={{fontSize: "35px"}}>100 피스</Typography>
            <Typography variant="subtitle1" style={{fontSize: "35px"}}>{data.curPlayerCount}/{data.maxPlayerCount}</Typography>
            <StartButton>시작</StartButton>
          </Details>
        </PuzzleDetails>
      </Body>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  height: 100%;
  background-image: url(../../background.png);
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

const Header = styled.div`
  align-items: center;
  width: 100%;
`;

const HeaderButton = styled(Button)`
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