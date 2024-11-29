import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { styled } from "styled-components";
import { Plus } from "lucide-react";
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
  Alert,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { deepPurple } from "@mui/material/colors";
import { authRequest } from "../../apis/requestBuilder";

const DEFAULT_IMAGE_URL =
  "https://i.namu.wiki/i/1zQlFS0_ZoofiPI4-mcmXA8zXHEcgFiAbHcnjGr7RAEyjwMHvDbrbsc8ekjZ5iWMGyzJrGl96Fv5ZIgm6YR_nA.webp";

export default function CreateRoomButton({ category }) {
  const navigate = useNavigate();
  const [roomName, setRoomName] = useState("퍼즐 한 판 !!");
  const [gameMode, setGameMode] = useState("battle"); // Default value
  const [puzzleImage, setPuzzleImage] = useState(DEFAULT_IMAGE_URL); // Default image

  const [puzzlePiece, setPuzzlePiece] = useState(100); // Default puzzle pieces
  const [maxPlayers, setMaxPlayers] = useState(4); // Default max players
  const [isOpenedModal, setIsOpenedModal] = useState(false);

  // width과 length 상태는 더 이상 사용되지 않으므로 제거
  // const [width, setWidth] = useState(0);
  // const [length, setLength] = useState(0);

  const [isImageLoading, setIsImageLoading] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertSeverity, setAlertSeverity] = useState("info"); // 'success', 'error', 'warning', 'info'

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

  const handlePuzzleImageChange = (e) => {
    const inputValue = e.target.value.trim();

    if (inputValue === "짱구.jpg") {
      setPuzzleImage(DEFAULT_IMAGE_URL);
      setAlertMessage("짱구.jpg는 기본 이미지로 대체되었습니다.");
      setAlertSeverity("warning");
    } else {
      setPuzzleImage(inputValue);
      setAlertMessage("");
      setAlertSeverity("info");
    }
  };

  // 이미지 크기 요청
  useEffect(() => {
    if (!puzzleImage) return;

    const fetchImageDimensions = async () => {
      setIsImageLoading(true);
      setImageError(false);
      setAlertMessage("");
      try {
        const response = await authRequest().post("/api/rooms/image/dimensions", null, {
          params: { imageUrl: puzzleImage },
        });

        const isValid = response.data;

        if (isValid) {
          setAlertMessage("이미지 URL이 유효합니다.");
          setAlertSeverity("success");
        } else {
          setAlertMessage("이미지 URL이 유효하지 않아 기본 이미지가 사용되었습니다.");
          setAlertSeverity("warning");
          setPuzzleImage(DEFAULT_IMAGE_URL);
        }
      } catch (error) {
        console.error("이미지 크기 가져오기 실패:", error);
        if (error.response) {
          const { error: errorCode, message } = error.response.data;

          if (errorCode === "InvalidImageUrl") {
            setAlertMessage("이미지 URL이 유효하지 않습니다. 기본 이미지로 대체됩니다.");
            setAlertSeverity("warning");
            setPuzzleImage(DEFAULT_IMAGE_URL);
          } else {
            setAlertMessage(message || "이미지 처리 중 오류가 발생했습니다.");
            setAlertSeverity("error");
          }
        } else {
          setAlertMessage("이미지 처리 중 네트워크 오류가 발생했습니다.");
          setAlertSeverity("error");
        }
        setImageError(true);
      } finally {
        setIsImageLoading(false);
      }
    };

    fetchImageDimensions();
  }, [puzzleImage]);

  const handleClose = () => {
    setGameMode("battle");
    setPuzzlePiece(100);
    setRoomName("퍼즐 한 판 !!");
    setMaxPlayers(4);
    setPuzzleImage(DEFAULT_IMAGE_URL);
    // setWidth(0);
    // setLength(0);
    setIsOpenedModal(false);
    setImageError(false);
    setAlertMessage("");
    setAlertSeverity("info");
  };

  const isValidImageUrl = (url) => {
    try {
      new URL(url);
      return /\.(jpeg|jpg|gif|png|webp|bmp)$/.test(url);
    } catch (e) {
      return false;
    }
  };

  const createRoom = async () => {
    if (!roomName || !puzzleImage || isImageLoading || imageError) {
      alert("필수 정보가 누락되었거나 이미지 처리에 실패했습니다.");
      return;
    }

    if (!isValidImageUrl(puzzleImage)) {
      alert("유효한 이미지 URL을 입력해주세요.");
      return;
    }

    const requestData = {
      roomName,
      gameMode: "battle",
      puzzleImage,
      puzzlePiece: 100,
      maxPlayers,
      playerId,
      playerImage,
      playerName,
    };
    console.log("방 생성 요청 데이터:", requestData);

    try {
      const { data } = await authRequest().post("/api/rooms", requestData);
      const { roomId } = data; // Assume roomId is returned
      console.log(`${roomId} : 방 만들기 성공`);
      navigate(`/game/${category}/waiting/${roomId}`);
    } catch (error) {
      console.error("방 생성에 실패했습니다.", error);

      if (
        error.response &&
        error.response.data &&
        error.response.data.error === "InvalidImageUrl"
      ) {
        alert("이미지 URL이 유효하지 않습니다. 기본 이미지로 대체됩니다.");
        setPuzzleImage(DEFAULT_IMAGE_URL);
      } else {
        alert("방 생성 중 오류가 발생했습니다.");
      }
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
            border: `1px solid ${deepPurple[700]}`,
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
        <RotatingIcon size="28" />방 만들기
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
          {alertMessage && (
            <Alert severity={alertSeverity} sx={{ mb: 2 }}>
              {alertMessage}
            </Alert>
          )}
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
                onChange={handlePuzzleImageChange}
                sx={{ width: "100%" }}
                placeholder="이미지 URL을 입력하세요"
              />
            </Grid>
            <Grid item xs={12} style={{ paddingTop: "0"}}>
              <Typography variant="subtitle1">이미지 미리보기:</Typography>
              <img
                src={puzzleImage}
                alt="퍼즐 이미지 미리보기"
                style={{ width: "100%", maxHeight: "300px", objectFit: "contain" }}
                onError={() => {
                  setPuzzleImage(DEFAULT_IMAGE_URL);
                  setAlertMessage("이미지 로딩에 실패했습니다. 기본 이미지로 대체되었습니다.");
                  setAlertSeverity("warning");
                }}
              />
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
  font-size: 25px;
  padding: 10px 20px;
  &:hover {
    background-color: darkorange;
    svg {
      transform: rotate(90deg);
    }
  }
`;

const RotatingIcon = styled(Plus)`
  margin-right: 5px;
  transition: transform 0.3s;
`;