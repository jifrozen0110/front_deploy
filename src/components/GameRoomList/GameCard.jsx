import { useNavigate } from "react-router-dom";
import UserCard from "@/components/UserCard"
import {
  CardContent,
  CardMedia,
  Typography,
  Box,
  Button,
} from "@mui/material";
import { styled } from "styled-components";
import { User, Puzzle, Timer } from "lucide-react";

export default function GameCard({ room, category }) {
  const navigate = useNavigate();
  const handleCardClick = async () => {
    if (room.maxPlayers <= room.nowPlayers) {
      alert("방이 꽉 찼습니다.");
    } else {
      navigate(`/game/${category}/waiting/${room.roomId}`);
    }
  };

  return (
    <StyledCard onClick={handleCardClick} disabled={room.roomStatus === "PLAYING"}>
      <StyledCardMedia
        component="img"
        image={room.puzzleImage} // 이미지 경로 수정
        alt="Puzzle Image"
      />
      <CardContent
        sx={{
          flex: 1,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          boxSizing: "border-box",
          gap: "15px",
        }}
      >
        <Typography sx={{ fontWeight: "bold", fontSize: "20px", width: "40%", textAlign: "left" }}>
          {room.roomName}
        </Typography>
        <div style={{width: "150px"}}>
          <UserCard userImage={room.masterImage} userName={room.masterName} imageSize="40" nameSize="20" color="black" />
        </div>
        <div style={{display: "flex", flexDirection: "column", alignItems: "start", width: "20%", gap: "5px"}}>
          <Typography sx={{display: "flex", alignItems: "center", gap: "5px"}}>
            <Timer size="15"/>{room.battleTimer/60}분
          </Typography>
          <Typography sx={{display: "flex", alignItems: "center", gap: "5px"}}>
            <Puzzle size="15"/>{room.puzzlePiece} 피스
          </Typography>
          <Box sx={{display: "flex", alignItems: "center", gap: "5px"}}>
            <User size="15"/>{`${room.nowPlayers}/${room.maxPlayers}`}
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
  background-color: white;
  color: black;
  border-radius: 8px;
  overflow: hidden;
  backdrop-filter: blur(5px);
  position: relative;
  box-shadow: 0 4px 4px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;

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
        left: 115px;
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
    background-color: rgba(255, 255, 255, 0.9); /* 배경색 변경 */
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.4); /* 그림자 강조 */
  }

  &:hover .card-image {
    object-fit: cover;
    transition: transform 0.1s ease; /* 부드러운 전환 */
  }
`;

const StyledCardMedia = styled(CardMedia)`
  width: 230px;
  height: 100%;
  object-fit: cover; /* 기본 상태에서는 cover */
  transition: all 0.3s ease; /* 부드러운 전환 효과 */
`;
