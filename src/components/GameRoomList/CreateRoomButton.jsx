import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { styled } from "styled-components";
import { Plus } from "lucide-react";
import {
  Button,
  Modal,
  Box,
  Grid,
  Typography,
  FormControl,
  FormLabel,
  RadioGroup,
  Radio,
  Alert,
  TextField,
  FormControlLabel,
  ToggleButtonGroup,
  ToggleButton,
  CircularProgress, // 추가
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { deepPurple } from "@mui/material/colors";
import { authRequest } from "../../apis/requestBuilder";

const predefinedImages = [
  {
    name: "짱구",
    url: "https://i.namu.wiki/i/1zQlFS0_ZoofiPI4-mcmXA8zXHEcgFiAbHcnjGr7RAEyjwMHvDbrbsc8ekjZ5iWMGyzJrGl96Fv5ZIgm6YR_nA.webp",
    puzzlePiece: 72, // 짱구 이미지의 퍼즐 조각 수
  },
  {
    name: "치이카와",
    url: "https://ynoblesse.com/wp-content/uploads/2023/07/358520758_1425769678257003_8801872512201663407_n.jpg",
    puzzlePiece: 72, // 치이카와 이미지의 퍼즐 조각 수
  },
  {
    name: "배틀그라운드",
    url: "https://i.namu.wiki/i/zLs_c5RLdQZF3lf3QN-rrVFa-8C0QcMRsEk0UhoAwOEEW56lvrUh51E04eQu0Uuvmsgx-Wu-6F_eAIzAxk0hXw.webp",
    puzzlePiece: 144, // 배틀그라운드 이미지의 퍼즐 조각 수
  },
];

const DEFAULT_IMAGE_URL = predefinedImages[0].url; // 기본 이미지 설정

export default function CreateRoomButton({ category }) {
  const navigate = useNavigate();
  const [roomName, setRoomName] = useState("퍼즐 한 판 !!");
  const [puzzleImage, setPuzzleImage] = useState(DEFAULT_IMAGE_URL);
  const [customImageUrl, setCustomImageUrl] = useState(""); // 사용자 정의 이미지 URL
  const [validatedImageUrl, setValidatedImageUrl] = useState(DEFAULT_IMAGE_URL); // 유효성 검사된 이미지 URL
  const [puzzlePiece, setPuzzlePiece] = useState(72);
  const [maxPlayers, setMaxPlayers] = useState(4);
  const [isOpenedModal, setIsOpenedModal] = useState(false);

  const [alertMessage, setAlertMessage] = useState(
    "이미지 URL을 입력하고 퍼즐 생성 버튼을 눌러주세요.",
  );
  const [alertSeverity, setAlertSeverity] = useState("info");

  const playerId = localStorage.getItem("userId");
  const playerImage = localStorage.getItem("image");
  const playerName = localStorage.getItem("userName");

  const [battleTimer, setBattleTimer] = useState(180); // 기본값을 3분으로 설정

  // 새로 추가된 상태 변수
  const [imageWidth, setImageWidth] = useState(0);
  const [imageHeight, setImageHeight] = useState(0);
  const [showPreview, setShowPreview] = useState(false); // 미리보기 표시 여부
  const [loading, setLoading] = useState(false); // 로딩 상태

  const handleRoomSize = (e) => {
    const count = Number(e.target.value);
    if (2 <= count && count <= 8) {
      setMaxPlayers(count);
    }
  };

  const handleCustomImageUrlChange = (e) => {
    setCustomImageUrl(e.target.value.trim());
    setPuzzleImage(e.target.value.trim());
    setShowPreview(false); // 이미지 변경 시 미리보기 숨김
  };

  const handlePredefinedImageSelect = (event, newImageUrl) => {
    if (newImageUrl) {
      const selectedImage = predefinedImages.find((image) => image.url === newImageUrl);
      if (selectedImage) {
        setPuzzleImage(newImageUrl);
        setCustomImageUrl("");
        setValidatedImageUrl(newImageUrl);
        setPuzzlePiece(selectedImage.puzzlePiece); // 선택된 이미지의 퍼즐 조각 수 설정
        setImageWidth(0); // 기본값으로 초기화
        setImageHeight(0); // 기본값으로 초기화
        setShowPreview(true); // 미리보기 표시
        setAlertMessage("미리 정의된 이미지를 선택했습니다.");
        setAlertSeverity("success");
      }
    }
  };

  // 이미지 URL 유효성 검사 함수 수정
  const validateImageUrl = async () => {
    let imageUrl = customImageUrl || puzzleImage;

    if (!imageUrl) {
      setAlertMessage("이미지 URL을 입력하거나 이미지를 선택하세요.");
      setAlertSeverity("warning");
      setShowPreview(false);
      return;
    }

    if (!isValidImageUrl(imageUrl)) {
      setAlertMessage("유효한 이미지 URL을 입력해주세요.");
      setAlertSeverity("warning");
      setShowPreview(false);
      return;
    }

    try {
      setLoading(true); // 로딩 시작
      const response = await authRequest().post("/api/rooms/image/dimensions", null, {
        params: { imageUrl },
      });

      const data = response.data;

      if (data && data.puzzlePiece) {
        setValidatedImageUrl(imageUrl);
        setPuzzlePiece(data.puzzlePiece);
        setImageWidth(data.width);
        setImageHeight(data.height);
        setShowPreview(true); // 미리보기 표시
        setAlertMessage("이미지 URL이 유효합니다.");
        setAlertSeverity("success");
      } else {
        console.log(data);
        setAlertMessage("이미지 URL이 유효하지 않아 기본 이미지가 사용되었습니다.");
        setAlertSeverity("warning");
        setPuzzleImage(DEFAULT_IMAGE_URL);
        setValidatedImageUrl(DEFAULT_IMAGE_URL);
        setPuzzlePiece(predefinedImages.find((img) => img.url === DEFAULT_IMAGE_URL).puzzlePiece);
        setImageWidth(0);
        setImageHeight(0);
        setShowPreview(false);
      }
    } catch (error) {
      console.error("이미지 유효성 검사 실패:", error);
      if (error.response && error.response.data) {
        const message = error.response.data.data.message;
        console.log(message);
        if (message) {
          setAlertMessage(message); // 백엔드에서 전송한 에러 메시지 표시
        } else {
          setAlertMessage("이미지 처리 중 오류가 발생했습니다.");
        }

        if (!message) {
          setPuzzleImage(DEFAULT_IMAGE_URL);
          setValidatedImageUrl(DEFAULT_IMAGE_URL);
          setPuzzlePiece(predefinedImages.find((img) => img.url === DEFAULT_IMAGE_URL).puzzlePiece);
          setImageWidth(0);
          setImageHeight(0);
          setShowPreview(false);
          setAlertSeverity("warning");
        } else {
          setAlertSeverity("error");
          setShowPreview(false);
        }
      } else {
        setAlertMessage("이미지 처리 중 네트워크 오류가 발생했습니다.");
        setAlertSeverity("error");
        setShowPreview(false);
      }
    } finally {
      setLoading(false); // 로딩 종료
    }
  };

  const handleClose = () => {
    setRoomName("퍼즐 한 판 !!");
    setMaxPlayers(4);
    setPuzzleImage(DEFAULT_IMAGE_URL);
    setCustomImageUrl("");
    setValidatedImageUrl(DEFAULT_IMAGE_URL);
    setPuzzlePiece(72);
    setImageWidth(0);
    setImageHeight(0);
    setBattleTimer(180); // 기본값을 3분으로 설정
    setIsOpenedModal(false);
    setShowPreview(false); // 미리보기 숨김
    setAlertMessage("이미지 URL을 입력하고 퍼즐 생성 버튼을 눌러주세요.");
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
    let imageUrl = validatedImageUrl;

    if (!roomName || !imageUrl) {
      alert("필수 정보가 누락되었습니다.");
      return;
    }

    if (!isValidImageUrl(imageUrl)) {
      alert("유효한 이미지 URL을 입력하고 퍼즐 생성 버튼을 눌러주세요.");
      return;
    }

    const requestData = {
      roomName,
      gameMode: category,
      puzzleImage: imageUrl,
      puzzlePiece,
      maxPlayers,
      playerId,
      playerImage,
      playerName,
      width: imageWidth, // 이미지 너비 추가
      height: imageHeight, // 이미지 높이 추가
    };

    if (category === "battle") {
      requestData.battleTimer = battleTimer;
    }

    console.log("방 생성 요청 데이터:", requestData);

    try {
      const { data } = await authRequest().post("/api/rooms", requestData);
      const { roomId } = data;
      console.log(`${roomId} : 방 만들기 성공`);
      navigate(`/game/${category}/waiting/${roomId}`);
    } catch (error) {
      console.error("방 생성에 실패했습니다.", error);

      if (
        error.response &&
        error.response.data &&
        error.response.data.error === "Invalid battle timer"
      ) {
        alert("배틀 타이머가 유효하지 않습니다. 다시 선택해주세요.");
      } else if (
        error.response &&
        error.response.data &&
        error.response.data.error === "InvalidImageUrl"
      ) {
        alert("이미지 URL이 유효하지 않습니다. 기본 이미지로 대체됩니다.");
        setPuzzleImage(DEFAULT_IMAGE_URL);
        setValidatedImageUrl(DEFAULT_IMAGE_URL);
        setPuzzlePiece(predefinedImages.find((img) => img.url === DEFAULT_IMAGE_URL).puzzlePiece);
        setImageWidth(0);
        setImageHeight(0);
        setShowPreview(false);
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
      MuiToggleButton: {
        styleOverrides: {
          root: {
            border: `1px solid ${deepPurple[200]}`,
            "&.Mui-selected": {
              borderColor: deepPurple[700],
              backgroundColor: deepPurple[100],
            },
            "&:hover": {
              backgroundColor: deepPurple[50],
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
            width: 800,
            bgcolor: "background.paper",
            border: "1px solid #ccc",
            borderRadius: "10px",
            boxShadow: 24,
            p: 4,
          }}
        >
          {/* 알림 메시지를 표시 */}
          <Alert severity={alertSeverity} sx={{ mb: 2 }}>
            {alertMessage}
          </Alert>

          <Typography id="modal-modal-title" variant="h5" sx={{ mb: 2 }}>
            {category === "cooperation" ? "협동" : "배틀"}방 만들기
          </Typography>
          <Grid container spacing={2}>
            {/* 왼쪽: 입력 부분 */}
            <Grid item xs={12} md={6}>
              <TextField
                label="방 제목"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                autoFocus
                fullWidth
                sx={{ mb: 2 }}
              />

              <Typography variant="subtitle1" sx={{ mb: 1 }}>
                이미지 선택:
              </Typography>
              <ToggleButtonGroup
                value={puzzleImage}
                exclusive
                onChange={handlePredefinedImageSelect}
                fullWidth
                sx={{
                  display: "flex",
                  justifyContent: "space-around",
                  mb: 2,
                }}
              >
                {predefinedImages.map((image) => (
                  <ToggleButton key={image.name} value={image.url} sx={{ padding: 1 }}>
                    <img
                      src={image.url}
                      alt={image.name}
                      style={{
                        width: "100px",
                        height: "100px",
                        objectFit: "cover",
                        borderRadius: "5px",
                      }}
                    />
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>

              {/* 원하는 이미지로 퍼즐 만들기 */}
              <Typography variant="subtitle1" sx={{ mb: 1 }}>
                원하는 이미지로 퍼즐 만들기:
              </Typography>
              <Grid container alignItems="center">
                <Grid item xs={8}>
                  <TextField
                    label="이미지 URL"
                    value={customImageUrl}
                    onChange={handleCustomImageUrlChange}
                    fullWidth
                    placeholder="이미지 URL을 입력하세요"
                  />
                </Grid>
                <Grid item xs={4} sx={{ pl: 2 }}>
                  <Button
                    variant="outlined"
                    onClick={validateImageUrl}
                    sx={{ height: "56px" }}
                    fullWidth
                  >
                    퍼즐 생성
                  </Button>
                </Grid>
              </Grid>

              <FormControl component="fieldset" fullWidth sx={{ mt: 2 }}>
                <FormLabel component="legend">최대 인원수</FormLabel>
                <RadioGroup
                  row
                  value={maxPlayers}
                  onChange={handleRoomSize}
                  sx={{ justifyContent: "space-around", mt: 1 }}
                >
                  <FormControlLabel value={2} control={<Radio />} label="2" />
                  <FormControlLabel value={4} control={<Radio />} label="4" />
                  <FormControlLabel value={6} control={<Radio />} label="6" />
                  <FormControlLabel value={8} control={<Radio />} label="8" />
                </RadioGroup>
              </FormControl>

              {category === "battle" && (
                <FormControl component="fieldset" fullWidth sx={{ mt: 2 }}>
                  <FormLabel component="legend">배틀 타이머</FormLabel>
                  <ToggleButtonGroup
                    value={battleTimer}
                    exclusive
                    onChange={(event, newTimer) => {
                      if (newTimer !== null) {
                        setBattleTimer(newTimer);
                      }
                    }}
                    fullWidth
                    sx={{ mt: 1, display: "flex", justifyContent: "space-around" }}
                  >
                    <ToggleButton value={60}>1분</ToggleButton>
                    <ToggleButton value={180}>3분</ToggleButton>
                    <ToggleButton value={300}>5분</ToggleButton>
                    <ToggleButton value={480}>8분</ToggleButton>
                    <ToggleButton value={600}>10분</ToggleButton>
                  </ToggleButtonGroup>
                </FormControl>
              )}

              <Button
                disabled={!roomName}
                onClick={createRoom}
                variant="contained"
                color="primary"
                fullWidth
                sx={{ height: "50px", marginTop: "20px" }}
              >
                방 만들기
              </Button>
            </Grid>
            {/* 오른쪽: 이미지 미리보기 */}
            <Grid item xs={12} md={6}>
              {/* 미리보기를 조건부로 렌더링 */}
              {showPreview && (
                <>
                  {loading ? (
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        height: "100%",
                      }}
                    >
                      <CircularProgress />
                    </Box>
                  ) : (
                    <>
                      <img
                        src={validatedImageUrl}
                        alt="퍼즐 이미지 미리보기"
                        style={{
                          width: "100%",
                          maxHeight: "500px",
                          objectFit: "contain",
                          borderRadius: "10px",
                          border: "1px solid #ccc",
                          marginTop: "10px",
                        }}
                        onError={(e) => {
                          e.target.src = DEFAULT_IMAGE_URL;
                          setAlertMessage("이미지 로딩에 실패하여 기본 이미지로 대체됩니다.");
                          setAlertSeverity("warning");
                          setPuzzleImage(DEFAULT_IMAGE_URL);
                          setValidatedImageUrl(DEFAULT_IMAGE_URL);
                          setPuzzlePiece(
                            predefinedImages.find((img) => img.url === DEFAULT_IMAGE_URL)
                              .puzzlePiece,
                          );
                          setImageWidth(0);
                          setImageHeight(0);
                          setShowPreview(false);
                        }}
                      />
                      {/* 퍼즐 조각 수 및 이미지 크기 표시 */}
                      {puzzlePiece && (
                        <Typography variant="subtitle1" sx={{ mb: 2, color: deepPurple[500] }}>
                          선택된 퍼즐 조각 수: {puzzlePiece}
                        </Typography>
                      )}
                      {imageWidth > 0 && imageHeight > 0 && (
                        <Typography variant="subtitle1" sx={{ mb: 2, color: deepPurple[500] }}>
                          이미지 크기: {imageWidth}px x {imageHeight}px
                        </Typography>
                      )}
                    </>
                  )}
                </>
              )}
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
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
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
