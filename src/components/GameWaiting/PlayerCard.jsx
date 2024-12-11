import { styled } from "styled-components";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Typography from "@mui/material/Typography";
import LocalPoliceTwoToneIcon from "@mui/icons-material/LocalPoliceTwoTone";

function PlayerCard(props) {
  const { player, master, color } = props;

  return (
    <WrapperCard className={color}>
      <CardMedia
        sx={{ width: "60px", height: "60px", aspectRatio: "1 / 1" }}
        component="img"
        alt={player.playerName}
        image={player.playerImage}
      />
      <Content>
        <NicknameWrapper>
          <Nickname component="div" variant="subtitle1">
            {player.playerName}
          </Nickname>
          {master === player.playerId && <StyledCrownIcon />} {/* 왕관 아이콘 표시 */}
        </NicknameWrapper>
      </Content>
    </WrapperCard>
  );
}

function EmptyPlayerCard() {
  return (
    <WrapperCard sx={{ backgroundColor: "rgba(0,0,0,0.7)" }}>
      <CardContent sx={{ margin: "auto", color: "#C9C9C9", fontWeight: "bold", fontsize: 20 }}>
        비어 있음
      </CardContent>
    </WrapperCard>
  );
}

function XPlayerCard() {
  return (
    <WrapperCard sx={{ backgroundColor: "rgba(0,0,0,0.7)" }}>
      <XContent>X</XContent>
    </WrapperCard>
  );
}

const WrapperCard = styled(Card)`
  display: flex;
  justify-content: space-between;
  width: 100%;
  max-width: 400px;
  min-width: 200px;
  height: 60px;
  background: "rgba(0, 0, 0, 0.7)";
  align-items: center;
  padding: 10px;
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

const StyledCrownIcon = styled(LocalPoliceTwoToneIcon)`
  color: #ffd700; /* 금색으로 변경 */
  font-size: 1.8rem; /* 크기 키우기 */
  margin-left: 5px; /* 닉네임과 간격 */
  vertical-align: middle; /* 텍스트와 정렬 */
`;

const Nickname = styled(Typography)`
  color: white;
  font-weight: bold;
  font-size: 20px;
`;

const NicknameWrapper = styled.div`
  display: flex;
  align-items: center; /* 세로 정렬 */
`;

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

const XContent = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  text-align: center;
  color: #c9c9c9;
  line-height: 1;
  padding-bottom: 5px;
  font-size: 40px;
`;

export { PlayerCard, EmptyPlayerCard, XPlayerCard };
