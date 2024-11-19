import { useEffect } from "react";
import styled from "styled-components";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Typography from "@mui/material/Typography";

function PlayerCard(props) {
  const { player, color } = props;
  console.log(player);

  return (
    <WrapperCard sx={{ height: "80%" }} className={color}>
      <CardMedia
        sx={{ width: "100px", height: "100px" }}
        component="img"
        alt={player.playerName}
        image={player.playerImage}
      />
      <Content>
        <Nickname component="div" variant="subtitle1">
          {player.playerName}
        </Nickname>
        {/* <State component="div" variant="subtitle2">
          {state}
        </State> */}
      </Content>
      {/* <GameOpenVidu gameId={gameId} playerName={player.playerName} /> */}
    </WrapperCard>
  );
}

function EmptyPlayerCard() {
  return (
    <WrapperCard sx={{backgroundColor: "rgba(0,0,0,0.7)"}}>
      <CardContent sx={{margin: "auto", color: "#C9C9C9", fontWeight: "bold", fontsize: 20}}>
        비어 있음
      </CardContent>
    </WrapperCard>
  );
}

function XPlayerCard() {
  return (
    <WrapperCard sx={{backgroundColor: "rgba(0,0,0,0.7)"}}>
      <CardContent sx={{margin: "auto", color: "#C9C9C9", fontWeight: "bold", fontsize: 500}}>
        X
      </CardContent>
    </WrapperCard>
  );
}

const WrapperCard = styled(Card)`
  display: flex;
  justify-content: space-between;
  width: 100%;
  height: 100px;
  background: "rgba(0, 0, 0, 0.7)";
  align-items: center;
  padding: 20px;
  border-radius: 10px;

  & img {
    border-radius: 10px;
  }

  background-color: ${(props) => {
    if (props.className === "red") {
      return "#FE5B5E";
    } else if (props.className === "blue") {
      return "#5BAFFE";
    }
  }};
`;

const Nickname = styled(Typography)`
  color: white;
  font-weight: bold;
  font-size: 30px;
`

const Content = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  margin-top: 5px;
  margin-left: 20px;
  &:last-child {
    padding: 0;
  }
`;

const State = styled.div`
  display: inline-block;
  padding: 8px 16px;
  font-size: 18px;
  font-weight: bold;
  color: ${(props) => {
    switch (props.children) {
      case "방 장":
        return "white";
      case "준비 중":
        return "black";
      case "준비 완료":
        return "white";
      default:
        return "white";
    }
  }};
  background-color: ${(props) => {
    switch (props.children) {
      case "방 장":
        return "#FF5722";
      case "준비 중":
        return "#FFEB3B";
      case "준비 완료":
        return "#4CAF50";
    }
  }};
  border-radius: 15px;
  text-align: center;
  white-space: nowrap;
  user-select: none;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); /* 약간의 그림자 */
`;

export { PlayerCard, EmptyPlayerCard, XPlayerCard };
