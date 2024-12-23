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
  CircularProgress,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { deepPurple } from "@mui/material/colors";
import { authRequest } from "../../apis/requestBuilder";
import { ChevronRight, ChevronLeft } from "lucide-react";

import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";

const predefinedImages = [
  {
    name: "짱구",
    url: "d83e4746-fcde-4079-8023-5e498446aa6a-20150306001045_0.jpg",
  },
  {
    name: "치이카와",
    url: "8cbe296e-ff5e-4ab5-881b-bca536ee599f-358520758_1425769678257003_8801872512201663407_n.jpg",
  },
  {
    name: "문지캠퍼스",
    url: "e5e81451-8396-4cc1-b08f-67d3c650bd54-Kakao-Talk-20241202-141212588.jpg",
  },
  {
    name: "몬스터 주식회사",
    url: "20241208_011319_f10e1d8b-aadc-4efb-881b-30090087f30e.jpg",
  },
];

const IMAGES_PER_SLIDE = 3;

export default function CreateRoomButton({ category }) {
  const navigate = useNavigate();
  const [roomName, setRoomName] = useState("퍼즐 한 판 !!");
  const [puzzleImage, setPuzzleImage] = useState("");
  const [customImageUrl, setCustomImageUrl] = useState("");
  const [validatedImageUrl, setValidatedImageUrl] = useState("");
  const [puzzlePiece, setPuzzlePiece] = useState(0);
  const [maxPlayers, setMaxPlayers] = useState(4);
  const [isOpenedModal, setIsOpenedModal] = useState(false);

  const [alertMessage, setAlertMessage] = useState(
    "이미지를 선택하고 퍼즐 생성 버튼을 눌러주세요.",
  );
  const [alertSeverity, setAlertSeverity] = useState("info");

  const playerId = localStorage.getItem("userId");
  const playerImage = localStorage.getItem("image");
  const playerName = localStorage.getItem("userName");

  const [battleTimer, setBattleTimer] = useState(180);

  const [imageWidth, setImageWidth] = useState(0);
  const [imageLength, setImageLength] = useState(0);
  const [showPreview, setShowPreview] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isPuzzleGenerated, setIsPuzzleGenerated] = useState(false);

  const [inputMode, setInputMode] = useState("default"); // 입력 모드 (URL 또는 파일)
  const [selectedFile, setSelectedFile] = useState(null); // 선택한 파일

  const [currentIndex, setCurrentIndex] = useState(0);

  const currentImages = predefinedImages.slice(
    currentIndex,
    currentIndex + IMAGES_PER_SLIDE
  );
  const canMoveLeft = currentIndex > 0;
  const canMoveRight = currentIndex + IMAGES_PER_SLIDE < predefinedImages.length;


  const handleRoomSize = (e) => {
    const count = Number(e.target.value);
    if (2 <= count && count <= 8) {
      setMaxPlayers(count);
    }
  };

  const handleCustomImageUrlChange = (e) => {
    setCustomImageUrl(e.target.value.trim());
    setPuzzleImage(e.target.value.trim());
    setShowPreview(false);
    setIsPuzzleGenerated(false);
  };

  const handlePredefinedImageSelect = async (event, newImageUrl) => {
    if (newImageUrl) {
      setInputMode("default");
      setCustomImageUrl("");
      setPuzzleImage(newImageUrl);
      setValidatedImageUrl("");
      setPuzzlePiece(0);
      setImageWidth(0);
      setImageLength(0);
      setShowPreview(false);
      setIsPuzzleGenerated(false);

      // 디폴트 이미지 선택 시 validateImageUrl 호출
      await validateImageUrl(newImageUrl);
    }
  };

  // 이미지 URL 유효성 검사 함수
  const validateImageUrl = async (imageParam) => {
    const uploadImage = async (endpoint, formData) => {
      return authRequest().post(endpoint, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    };

    let response;
    try {
      const formData = new FormData();
      if (inputMode === "url" || inputMode === "default" ) {
        formData.append("imageUrl", imageParam || customImageUrl || puzzleImage);
        response = await uploadImage("/api/rooms/image-url/dimensions", formData);
      } else {
        formData.append("imageFile", selectedFile);
        response = await uploadImage("/api/rooms/image-file/dimensions", formData);
      }
      // 응답 데이터 처리
    } catch (error) {
      setAlertMessage("이미지 업로드에 실패했습니다. 다시 시도해주세요.");
      setAlertSeverity("error"); 
      setShowPreview(false);
      setIsPuzzleGenerated(false);
    }
    const imageUrl = response.data.imageUrl;

    if (!imageUrl) {
      setAlertMessage("이미지 URL을 입력하거나 이미지를 선택하세요.");
      setAlertSeverity("warning");
      setShowPreview(false);
      setIsPuzzleGenerated(false);
      return;
    }

    if (!isValidImageUrl(imageUrl)) {
      setAlertMessage("유효한 이미지 URL을 입력해주세요.");
      setAlertSeverity("warning");
      setShowPreview(false);
      setIsPuzzleGenerated(false);
      return;
    }

    const data = response.data;

    if (data && data.puzzlePiece > 0) {
      setValidatedImageUrl(imageUrl);
      setPuzzlePiece(data.puzzlePiece);
      setImageWidth(data.width);
      setImageLength(data.length);
      setShowPreview(true);
      setAlertMessage("이미지 URL이 유효합니다.");
      setAlertSeverity("success");
      setIsPuzzleGenerated(true);
    } else {
      setAlertMessage("이미지 처리 중 오류가 발생했습니다.");
      setAlertSeverity("error");
      setShowPreview(false);
      setIsPuzzleGenerated(false);
    }
  };

  const handleClose = () => {
    setRoomName("퍼즐 한 판 !!");
    setMaxPlayers(4);
    setPuzzleImage("");
    setCustomImageUrl("");
    setValidatedImageUrl("");
    setPuzzlePiece(0);
    setImageWidth(0);
    setImageLength(0);
    setBattleTimer(180);
    setIsOpenedModal(false);
    setShowPreview(false);
    setIsPuzzleGenerated(false);
    setAlertMessage("이미지를 선택하고 퍼즐 생성 버튼을 눌러주세요.");
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
      width: imageWidth,
      height: imageLength,
    };

    if (category === "battle") {
      requestData.battleTimer = battleTimer;
    }

    try {
      const { data } = await authRequest().post("/api/rooms", requestData);
      const { roomId } = data;
      navigate(`/game/${category}/waiting/${roomId}`);
    } catch (error) {
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
        <RotatingIcon size="20" />방 만들기
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

              <Grid container alignItems="center" sx={{ marginTop: 2 }}>
                {/* 원하는 이미지로 퍼즐 만들기 */}
                <Grid item xs={12}>
                  {/* URL과 FILE 전환 버튼 */}
                  <ToggleButtonGroup
                    value={inputMode}
                    exclusive
                    onChange={(event, newMode) => {
                      if (newMode !== null) {
                        setInputMode(newMode);
                        setPuzzleImage("DEFAULT_IMAGE_URL");
                        setValidatedImageUrl("");
                        setPuzzlePiece(0);
                        setImageWidth(0);
                        setImageLength(0);
                        setShowPreview(false);
                        setIsPuzzleGenerated(false);
                      }
                    }}
                    aria-label="Input mode selection"
                  >
                    <ToggleButton value="default" aria-label="Default input" style={{borderBottom: "none", borderBottomLeftRadius: "0"}}>
                      기본 이미지
                    </ToggleButton>
                    <ToggleButton value="url" aria-label="URL input" style={{borderBottom: "none"}}>
                      URL
                    </ToggleButton>
                    <ToggleButton value="file" aria-label="File input" style={{borderBottom: "none", borderBottomRightRadius: "0"}}>
                      File
                    </ToggleButton>
                  </ToggleButtonGroup>
                </Grid>

                {/* Default 선택 */}
                {inputMode === "default" && (
                  <>
                    <div style={{ position: "relative", width: "100%", maxWidth: "800px", margin: "0 auto" }}>
                      {/* 왼쪽 슬라이드 버튼 */}
                      {canMoveLeft && (
                        <button
                          style={{
                            position: "absolute",
                            left: "-20px",
                            top: "45%",
                            transform: "translateY(-50%)",
                            background: "rgba(0, 0, 0, 0.5)",
                            color: "white",
                            border: "none",
                            borderRadius: "50%",
                            width: "40px",
                            height: "40px",
                            cursor: "pointer",
                            zIndex: 10,
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                          }}
                          onClick={() => setCurrentIndex(currentIndex - IMAGES_PER_SLIDE)}
                        >
                          <ChevronLeft/>
                        </button>
                      )}

                      {/* 이미지 그룹 */}
                      <ToggleButtonGroup
                        value={puzzleImage}
                        exclusive
                        fullWidth
                        onChange={handlePredefinedImageSelect}
                        sx={{
                          display: "flex",
                          justifyContent: "space-around",
                          mb: 2,
                        }}
                      >
                        {Array.from({ length: IMAGES_PER_SLIDE }, (_, index) => {
                          const image = currentImages[index];
                          return image ? (
                            <ToggleButton
                              key={image.name}
                              value={image.url}
                              selected={puzzleImage === image.url}
                              sx={{
                                padding: 1,
                                borderRadius: "5px",
                                border: puzzleImage === image.url ? "1px solid orange" : "1px solid #ccc",
                              }}
                              style={{borderTopLeftRadius: "0"}}
                            >
                              <img
                                src={`https://puzzleshare-gallery.s3.ap-northeast-2.amazonaws.com/${image.url}`}
                                alt={image.name}
                                style={{
                                  width: "100px",
                                  height: "100px",
                                  objectFit: "cover",
                                  borderRadius: "5px",
                                }}
                              />
                            </ToggleButton>
                          ) : (
                            <ToggleButton
                              sx={{
                                padding: 1,
                                borderRadius: "5px",
                                border: "1px solid #ccc",
                              }}
                            />
                          );
                        })}
                      </ToggleButtonGroup>

                      {/* 오른쪽 슬라이드 버튼 */}
                      {canMoveRight && (
                        <button
                          style={{
                            position: "absolute",
                            right: "-20px",
                            top: "45%",
                            transform: "translateY(-50%)",
                            background: "rgba(0, 0, 0, 0.5)",
                            color: "white",
                            border: "none",
                            borderRadius: "50%",
                            width: "40px",
                            height: "40px",
                            cursor: "pointer",
                            zIndex: 10,
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                          }}
                          onClick={() => setCurrentIndex(currentIndex + IMAGES_PER_SLIDE)}
                        >
                          <ChevronRight/>
                        </button>
                      )}
                    </div>
                  </>
                )}

                {/* URL 입력 */}
                {inputMode === "url" && (
                  <>
                    <Grid item xs={8.5}>
                      <TextField
                        label="이미지 URL"
                        value={customImageUrl}
                        onChange={handleCustomImageUrlChange}
                        fullWidth
                        placeholder="이미지 URL을 입력하세요"
                        style={{margin: "0"}}
                        InputProps={{
                          style: {
                            borderTopLeftRadius: "0px", // 입력 필드 자체 반지름 제거
                          },
                        }}
                      />
                    </Grid>
                  </>
                )}

                {/* 파일 업로드 */}
                {inputMode === "file" && (
                  <>
                    <Grid item xs={8.5}>
                      <TextField
                        type="file"
                        onChange={(e) => setSelectedFile(e.target.files[0])}
                        inputProps={{
                          accept: "image/jpeg, image/png, image/webp", // 지원하는 파일 형식
                        }}
                        fullWidth
                        style={{margin: "0"}}
                        InputProps={{
                          style: {
                            borderTopLeftRadius: "0px", // 입력 필드 자체 반지름 제거
                          },
                        }}
                      />
                    </Grid>
                  </>
                )}
                
                {(inputMode === "url" || inputMode === "file") && (
                  <>
                    <Grid item xs={3.5} sx={{ pl: 1 }}>
                      <Button
                        variant="outlined"
                        onClick={() => validateImageUrl()}
                        sx={{ height: "56px" }}
                        fullWidth
                      >
                        퍼즐 생성
                      </Button>
                    </Grid>
                  </>
                )}
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
                disabled={!roomName || !isPuzzleGenerated}
                onClick={createRoom}
                variant="contained"
                color="primary"
                fullWidth
                sx={{ height: "50px", marginTop: "20px" }}
              >
                방 만들기
              </Button>
            </Grid>
            
            <Grid item xs={12} md={6}>
              {/* 알림 메시지를 표시 */}
              <Alert severity={alertSeverity} sx={{ mt: 1.5 }}>
                {alertMessage}
              </Alert>

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
                          maxHeight: "400px",
                          objectFit: "contain",
                          borderRadius: "10px",
                          border: "1px solid #ccc",
                          marginTop: "10px",
                        }}
                        onError={(e) => {
                          e.target.src = "";
                          setPuzzleImage("");
                          setValidatedImageUrl("");
                          setPuzzlePiece(0);
                          setImageWidth(0);
                          setImageLength(0);
                          setShowPreview(false);
                          setIsPuzzleGenerated(false);
                        }}
                      />
                      {/* 퍼즐 조각 수 및 이미지 크기 표시 */}
                      {puzzlePiece && (
                        <Typography variant="subtitle1" sx={{ color: deepPurple[500] }}>
                          선택된 퍼즐 조각 수: {puzzlePiece}
                        </Typography>
                      )}
                      {imageWidth > 0 && imageLength > 0 && (
                        <Typography variant="subtitle1" sx={{ mb: 2, color: deepPurple[500] }}>
                          이미지 크기: {imageWidth} x {imageLength} (px)
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
  height: 100%;
  background-color: orange;
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.25);
  color: white;
  font-size: 20px;
  padding: 10px;
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
