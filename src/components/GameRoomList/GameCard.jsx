import { useNavigate } from "react-router-dom";
import { CardContent, CardMedia, Typography, Box, Divider, Chip, CardActionArea, Snackbar, Button } from "@mui/material";
import styled from "styled-components";

export default function GameCard({ room, category }) {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/game/${category}/waiting/${room.roomId}`);
  };

  return (
    <StyledCard onClick={handleCardClick}>
      <CardMedia
        component="img"
        image="https://via.placeholder.com/151" // 이미지 경로 수정
        sx={{ width: 100, height: 100, marginLeft: "10px", borderRadius: "8px" }}
      />
      <CardContent
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "0 16px",
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: "bold", color: "white" }}>
          {room.roomName}
        </Typography>
        <Typography variant="body2" sx={{ color: "white" }}>
          {room.gameMode}
        </Typography>
        <Typography variant="body2" sx={{ color: "white" }}>
          {room.puzzlePiece}피스
        </Typography>
      </CardContent>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginRight: "16px",
          color: "white",
          fontWeight: "bold",
        }}
      >
        {`${room.nowPlayers}/${room.maxPlayers}`}
      </Box>
    </StyledCard>
  );
}

const StyledCard = styled(Button)`
  display: flex;
  padding: 25px 20px;
  width: 100%;
  background-color: #42a5f5; // 파란색 배경
  border-radius: 8px;
  box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.2);
  &:hover {
    background-color: orange;
    box-shadow: 5px 5px 10px rgba(0, 0, 0, 0.3);
  }
`;