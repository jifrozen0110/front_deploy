import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import {
  Button,
  Modal,
  Box,
  Grid,
  Typography,
  TextField,
  FormControl,
  FormLabel,
  FormControlLabel,
  RadioGroup,
  Radio,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { deepPurple } from "@mui/material/colors";
import { request } from "@/apis/requestBuilder";
import { authRequest } from "../../apis/requestBuilder";

export default function CreateRoomButton({ category }) {
  const navigate = useNavigate();
  const [roomName, setRoomName] = useState("퍼즐 한 판 !!");
  const [gameMode, setGameMode] = useState("battle"); // Default value
  const [puzzleImage, setPuzzleImage] = useState("https://images.unsplash.com/photo-1731413263252-cbce5c09f8c2?q=80&w=2940&auto=format&fit=crop"); // Default image
  const [puzzlePiece, setPuzzlePiece] = useState(100); // Default puzzle pieces
  const [maxPlayers, setMaxPlayers] = useState(4); // Default max players
  const [isOpenedModal, setIsOpenedModal] = useState(false);

  const playerId = localStorage.getItem("userId");
  const playerImage = localStorage.getItem("image");
  const playerName = localStorage.getItem("userName");

  const handleGameMode = (e) => {
    setGameMode(e.target.value);
  };

  const handlePuzzlePiece = (e) => {
    setPuzzlePiece(e.target.value);
  };

  const handleRoomSize = (e) => {
    const count = Number(e.target.value);
    if (2 <= count && count <= 8) {
      setMaxPlayers(count);
    }
  };

  const handleClose = () => {
    setGameMode("일반 모드");
    setPuzzlePiece("100");
    setGameMode("battle");
    setRoomName("퍼즐 한 판 !!");
    setMaxPlayers(4);
    setIsOpenedModal(false);
  };

  const createRoom = async () => {
    // if (roomName!="" || puzzleImage!="") {
    //   alert("필수 정보가 누락되었습니다.");
    //   return;
    // }

    const requestData = {
      roomName,
      gameMode,
      puzzleImage,
      puzzlePiece,
      maxPlayers,
      playerId,
      playerImage,
      playerName,
    };
    console.log(requestData);

    try {
      const { data } = await authRequest().post("/api/rooms", requestData);
      const { roomId } = data; // Assume roomId is returned
      console.log(`${roomId} : 방 만들기 성공`);
      navigate(`/game/${category}/waiting/${roomId}`);
    } catch (error) {
      console.error("방 생성에 실패했습니다.", error);
      alert("방 생성 중 오류가 발생했습니다.");
    }
  };

  const theme = createTheme({
    typography: {
      fontFamily: "'Galmuri11', sans-serif",
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            color: deepPurple[700],
            fontSize: "15px",
            height: "80%",
            backgroundColor: "#fff",
            "&:hover": {
              backgroundColor: deepPurple[100],
            },
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            margin: "3% auto",
            "& label": {
              color: deepPurple[200],
            },
            "& label.Mui-focused": {
              color: deepPurple[700],
            },
            "& .MuiOutlinedInput-root": {
              color: deepPurple[700],
              "& fieldset": {
                borderColor: deepPurple[200],
              },
              "&:hover fieldset": {
                borderColor: deepPurple[400],
              },
              "&.Mui-focused fieldset": {
                borderColor: deepPurple[700],
              },
            },
            "& .MuiFormHelperText-root": {
              color: deepPurple[400],
            },
          },
        },
      },
      MuiFormLabel: {
        styleOverrides: {
          root: {
            color: deepPurple[200],
            "&.Mui-focused": {
              color: deepPurple[400],
            },
          },
        },
      },
      MuiRadio: {
        styleOverrides: {
          root: {
            "&.Mui-checked": {
              color: deepPurple[400],
            },
          },
        },
      },
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <CreateButton onClick={() => setIsOpenedModal(true)}>
        방 만들기
      </CreateButton>
      <Modal
        open={isOpenedModal}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: "background.paper",
            border: "1px solid #ccc",
            borderRadius: "10px",
            boxShadow: 24,
            p: 4,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Typography id="modal-modal-title" variant="h5">
            {category === "cooperation" ? "협동" : "배틀"}방 만들기
          </Typography>
          <Grid container id="modal-modal-description" spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12}>
              <TextField
                label="방 제목"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                autoFocus
                sx={{ width: "100%" }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="퍼즐 이미지 URL"
                value={puzzleImage}
                onChange={(e) => setPuzzleImage(e.target.value)}
                sx={{ width: "100%" }}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl>
                <FormLabel id="radio-game-mode">게임 모드</FormLabel>
                <RadioGroup row value={gameMode} onChange={handleGameMode}>
                  <FormControlLabel value="normal" control={<Radio />} label="일반 모드" />
                  <FormControlLabel value="battle" control={<Radio />} label="아이템 모드" />
                  <FormControlLabel value="timeAttack" control={<Radio />} label="타임어택" />
                </RadioGroup>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl>
                <FormLabel id="radio-puzzle-piece">퍼즐 조각 수</FormLabel>
                <RadioGroup row value={puzzlePiece} onChange={handlePuzzlePiece}>
                  <FormControlLabel value={20} control={<Radio />} label="20" />
                  <FormControlLabel value={50} control={<Radio />} label="50" />
                  <FormControlLabel value={80} control={<Radio />} label="80" />
                  <FormControlLabel value={100} control={<Radio />} label="100" />
                  <FormControlLabel value={150} control={<Radio />} label="150" />
                </RadioGroup>
              </FormControl>
            </Grid>
            <Grid item xs={9}>
              <FormControl>
                <FormLabel id="radio-room-size">최대 인원수</FormLabel>
                <RadioGroup row value={maxPlayers} onChange={handleRoomSize}>
                  <FormControlLabel value={2} control={<Radio />} label="2" />
                  <FormControlLabel value={4} control={<Radio />} label="4" />
                  <FormControlLabel value={6} control={<Radio />} label="6" />
                  <FormControlLabel value={8} control={<Radio />} label="8" />
                </RadioGroup>
              </FormControl>
            </Grid>
            <Grid item xs={3}>
              <Button
                disabled={!roomName}
                onClick={createRoom}
                sx={{ width: "100%", height: "50px", padding: "2%", margin: "15% auto" }}
              >
                방 만들기
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Modal>
    </ThemeProvider>
  );
}

const CreateButton = styled(Button)`
  height: 60px;
  background-color: orange;
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.25);
  color: white;
  &:hover {
    background-color: darkorange;
  }
`;