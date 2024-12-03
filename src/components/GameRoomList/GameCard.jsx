import { useNavigate } from "react-router-dom";
import UserCard from "@/components/UserCard"
import {
  CardContent,
  CardMedia,
  Typography,
  Box,
  Divider,
  Chip,
  CardActionArea,
  Snackbar,
  Button,
} from "@mui/material";
import { styled } from "styled-components";
import { isAxiosError } from "axios";

export default function GameCard({ room, category }) {
  const navigate = useNavigate();
  console.log(room)
  const handleCardClick = async () => {
    if (room.maxPlayers <= room.nowPlayers) {
      alert("방이 꽉 찼습니다.");
    } else {
      navigate(`/game/${category}/waiting/${room.roomId}`);
    }
  };

  return (
    <StyledCard onClick={handleCardClick} disabled={room.roomStatus === "PLAYING"}>
      <CardMedia
        component="img"
        image={room.puzzleImage} // 이미지 경로 수정
        sx={{ width: 280, height: "100%"}}
      />
      <CardContent
        sx={{
          flex: 1,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "0 0 0 15px",
          boxSizing: "border-box",
          gap: "15px",
        }}
      >
        <Typography sx={{ fontWeight: "bold", color: "white", fontSize: "30px", width: "40%", textAlign: "left" }}>
          {room.roomName}
        </Typography>
        <div style={{display: "flex", justifyContent: "space-between", alignItems: "center", width: "60%"}}>
          <div style={{width: "200px"}}>
            <UserCard userImage={room.masterImage} userName={room.masterName} imageSize="40" nameSize="20" />
          </div>
          <Typography sx={{ color: "white" }}>
            {room.gameMode}
          </Typography>
          <Typography sx={{ color: "white" }}>
            {room.puzzlePiece} 피스
          </Typography>
          <Box
            sx={{
              marginRight: "16px",
              color: "white",
              fontSize: "20px"
            }}
          >
            {`${room.nowPlayers}/${room.maxPlayers}`}
          </Box>
        </div>
      </CardContent>
    </StyledCard>
  );
}

const StyledCard = styled(Button)`
  display: flex;
  justify-content: flex-start;
  padding: 0 10px 0 0;
  margin-bottom: 10px;
  width: 100%;
  height: 150px;
  background-color: rgba(0, 0, 0, 0.7);
  border-radius: 8px;
  overflow: hidden;
  backdrop-filter: blur(5px);
  position: relative;
  transition: all 0.3s ease; /* 부드러운 상태 전환 */

  ${(props) =>
    props.disabled &&
    `
      filter: grayscale(100%); /* 흑백 필터 */
      opacity: 0.6; /* 불투명도 조정 */
      pointer-events: none; /* 클릭 불가능 */
      &:after {
        content: "게임 중";
        position: absolute;
        top: 50%;
        left: 140px;
        transform: translate(-50%, -50%);
        background-color: black;
        color: white;
        font-size: 24px;
        font-weight: bold;
        padding: 10px 20px;
        border-radius: 8px;
        text-align: center;
      }
    `}
  
  &:hover {
    background-color: rgba(73, 73, 73, 0.7);
  }
`;
