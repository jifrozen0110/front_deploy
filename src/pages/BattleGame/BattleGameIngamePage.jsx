import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { styled } from "styled-components";

import PlayPuzzle from "@/components/PlayPuzzle";
import EnemyPuzzle from "@/components/GameIngame/EnemyPuzzle";
import Loading from "@/components/Loading";
import Timer from "@/components/GameIngame/Timer";
import PrograssBar from "@/components/GameIngame/ProgressBar";
import Chatting from "@/components/GameIngame/Chatting";
import ResultModal from "@/components/GameIngame/ResultModal";
import useExitRoom from "@/components/ExitRoom";

import { DoorOpen } from "lucide-react";
import { getRoomId, getSender, getTeam } from "@/socket-utils/storage";
import { socket } from "@/socket-utils/socket2";
import { parsePuzzleShapes } from "@/socket-utils/parsePuzzleShapes";
import { playerConfig, enemyConfig } from "@/puzzle-core";
import { getPuzzlePositionByIndex } from "@/puzzle-core/utils";

import backgroundPath3 from "@/assets/backgrounds/background_winter3.jpg";

import {
  Box,
  Snackbar,
} from "@mui/material";
import { createTheme } from "@mui/material/styles";
import { red, blue } from "@mui/material/colors";
import { useHint } from "@/hooks/useHint";
import Hint from "../../components/Hint";
import { createPortal } from "react-dom";
import { useSnackbar } from "../../hooks/useSnackbar";
import { useSnackbar2 } from "../../hooks/useSnackbar2";
import { setRoomId, setTeam } from "../../socket-utils/storage";

import Inventory from "../../components/GameIngame/Inventory";
import boomPath from "@/assets/effects/boom.gif";
import inkPath from "@/assets/effects/ink.png";
import tornadoPath from "@/assets/effects/tornado.gif";
import blackholePath from "@/assets/effects/blackhole.png";
import framePath from "@/assets/effects/frame.png";

import { attackAudio, puzzleAudio, backgroundAudio } from "@/puzzle-core/addAudio";
import fireAudioPath from "@/assets/audio/fire.mp3";
import mudAudioPath from "@/assets/audio/mud.wav";
import tornadoAudioPath from "@/assets/audio/tornado.mp3";
import blackholeAudioPath from "@/assets/audio/blackhole.mp3";
import frameAudioPath from "@/assets/audio/frame2.mp3";
import beep from "@/assets/audio/beep.mp3";
import puzzleBackground from "@/assets/audio/puzzleBackground.wav";

import './ani.css';
import { authRequest } from "../../apis/requestBuilder";
import { colors } from "../../puzzle-core/color";


const { connect, send, subscribe } = socket;
const {
  getConfig,
  lockPuzzle,
  movePuzzles,
  unLockPuzzle,
  addPiece,
} = playerConfig;

export default function BattleGameIngamePage() {
  const navigate = useNavigate();
  const { roomId: gameId } = useParams();
  const [gameData, setGameData] = useState(null);
  const [isOpenedDialog, setIsOpenedDialog] = useState(false);

  const [time, setTime] = useState(60);
  const [ourPercent, setOurPercent] = useState(0);
  const [enemyPercent, setEnemyPercent] = useState(0);
  const [chatHistory, setChatHistory] = useState([]);
  const [pictureSrc, setPictureSrc] = useState("");
  const [slots, setSlots] = useState(Array(8).fill(0));

  // 게임 결과 데이터를 저장할 상태 변수
  const [ourTeamData, setOurTeamData] = useState([]);
  const [enemyTeamData, setEnemyTeamData] = useState([]);
  const [ourProgressPercent, setOurProgressPercent] = useState(0);
  const [enemyProgressPercent, setEnemyProgressPercent] = useState(0);
  const [ourTeamKey, setOurTeamKey] = useState("");
  const [enemyTeamKey, setEnemyTeamKey] = useState("");
  const [puzzleImage, setPuzzleImage] = useState("");
  const [enemyCanvasScale, setEnemyCanvasScale] = useState(0.6);

  // 게임 데이터를 백엔드 서버로 보내기 위한 함수 정의
  const sendGameDataToBackend = async (data, finishTime) => {

    if (!data.game) {
      console.error('게임 데이터가 응답에 없습니다.');
      return;
    }

    // 총 퍼즐 조각 수 계산
    const totalPieceCount = data.game.picture.widthPieceCnt * data.game.picture.lengthPieceCnt;
    // 퍼즐 이미지 URL 설정
    const puzzleImage = data.game.picture.imageUrl || data.game.picture.encodedString;

    // 팀 정보 포맷팅 함수
    const formatTeam = (team) => team ? team.map(player => ({
      playerId: player.playerId,
      playerImage: player.playerImage,
      playerName: player.playerName,
    })) : null;

    // 백엔드로 보낼 데이터 포맷팅
    const gameDataDto = {
      gameId:data.game.gameId,
      gameName: data.game.gameName,
      gameType: data.game.gameType,
      redTeam: formatTeam(data.game.redTeam),
      blueTeam: formatTeam(data.game.blueTeam),
      players: formatTeam(data.game.players),
      redProgressPercent: data.redProgressPercent !== undefined ? parseFloat(data.redProgressPercent.toFixed(1)) : null,
      blueProgressPercent: data.blueProgressPercent !== undefined ? parseFloat(data.blueProgressPercent.toFixed(1)) : null,
      puzzleImage: puzzleImage,
      totalPieceCount: totalPieceCount,
      battleTimer: data.game.battleTimer,
      startTime: data.game.startTime ? new Date(data.game.startTime).toISOString() : null,
      finishTime: data.game.finishTime ? new Date(data.game.finishTime).toISOString() : null,
    };

    // 백엔드 서버로 데이터 전송
    const userId = getSender(); // 또는 다른 방법으로 userId를 얻으세요.

    await authRequest()
    .post(`/games/end/${userId}`, gameDataDto)
    .then(response => {
      console.log('게임 결과를 백엔드로 전송했습니다.');
    })
    .catch(error => {
      console.error('게임 결과 전송 중 오류 발생', error);
    });
  };

  const [players, setPlayers] = useState([])
  const isGameEndingRef = useRef(false);

  const itemFunc = useMemo(() => {    
    return {
      FIRE(data) {
        const { targets, targetList } = data;
        const isPlayerTeam = targets === getTeam().toUpperCase();
        const {
          getConfig,
          usingItemFire,
        } = isPlayerTeam ? playerConfig : enemyConfig;
        
        const canvasContainer = isPlayerTeam
          ? document.getElementById("canvasContainer")
          : document.getElementById("enemyCanvasContainer");
        const bundles = targets === "RED" ? data.redBundles : data.blueBundles;
        const fireImg = document.createElement("img");
        fireImg.src = boomPath;
        fireImg.className = "boom"
      
        if (targetList === null || targetList.length === 0) {
          return;
        }

        attackAudio(fireAudioPath);
        for (let i = 0; i < targetList.length; i++) {
          const currentTargetIdx = targetList[i];
          const [x, y] = getPuzzlePositionByIndex({
            config: getConfig(),
            puzzleIndex: currentTargetIdx,
          });

          const fireImgCopy = fireImg.cloneNode();

          const scale = canvasContainer.clientWidth / 1000
          if (isPlayerTeam) {
            fireImgCopy.style.left = `${x * scale}px`;
            fireImgCopy.style.top = `${y * scale}px`;
          }else{
            fireImgCopy.style.left = `${x * scale / enemyCanvasScale}px`;
            fireImgCopy.style.top = `${y * scale / enemyCanvasScale}px`;
          }

          canvasContainer.appendChild(fireImgCopy);
          
          setTimeout(() => usingItemFire(bundles, targetList, isPlayerTeam, enemyCanvasScale),500)
          setTimeout(() => {
            if (fireImgCopy.parentNode) {
              fireImgCopy.parentNode.removeChild(fireImgCopy);
            }
          }, 2000);
        }
        
      },
      MUD(data) {
        const { targets } = data;
        const isPlayerTeam = targets === getTeam().toUpperCase();

        const mudImg = document.createElement("img");
        mudImg.src = inkPath;
        mudImg.className = "ink"

        const gameBoard = isPlayerTeam
          ? document.getElementById("gameBoard")
          : document.getElementById("enemyCanvasContainer");
        

        attackAudio(mudAudioPath);
        gameBoard.appendChild(mudImg);

        setTimeout(() => {
          if (mudImg.parentNode) {
            mudImg.parentNode.removeChild(mudImg);
          }
        }, 5000);
      },
      TYPHOON(data){
        const { targets, targetList } = data
        const bundles = targets === "RED" ? data.redBundles : data.blueBundles;
        const isPlayerTeam = targets === getTeam().toUpperCase();
        const {
          usingItemTyphoon,
        } = isPlayerTeam ? playerConfig : enemyConfig;

        const tornadoImg = document.createElement("img");
        const gameBoard = isPlayerTeam
          ? document.getElementById("gameBoard")
          : document.getElementById("enemyCanvasContainer");
        tornadoImg.src = tornadoPath;
        tornadoImg.className = "tornado"

        if (targetList === null || targetList.length === 0) {
          return;
        }

        attackAudio(tornadoAudioPath);
        gameBoard.appendChild(tornadoImg);
        setTimeout(() => usingItemTyphoon(targetList, bundles, isPlayerTeam, enemyCanvasScale), 500);
        setTimeout(() => {
          if (tornadoImg.parentNode) {
            tornadoImg.parentNode.removeChild(tornadoImg);
          }
        }, 1200);
      },
      BROOMSTICK(data){
        const { targets, targetList } = data
        const bundles = targets === "RED" ? data.redBundles : data.blueBundles;
        const isPlayerTeam = targets === getTeam().toUpperCase();
        const {
          usingItemTyphoon,
        } = isPlayerTeam ? playerConfig : enemyConfig;

        if (targetList === null || targetList.length === 0) {
          return;
        }

        const bloomImg = document.createElement("img");
        const gameBoard = isPlayerTeam
          ? document.getElementById("gameBoard")
          : document.getElementById("enemyCanvasContainer");
        bloomImg.src = blackholePath;
        bloomImg.className = "black-hole"

        attackAudio(blackholeAudioPath);
        gameBoard.appendChild(bloomImg);

        setTimeout(() => usingItemTyphoon(targetList, bundles, isPlayerTeam, enemyCanvasScale), 1000);
        setTimeout(() => {
          if (bloomImg.parentNode) {
            bloomImg.parentNode.removeChild(bloomImg);
          }
        }, 2000);
      },
      FRAME(data){
        const { targets, targetList } = data
        const bundles = targets === "RED" ? data.redBundles : data.blueBundles;
        const isPlayerTeam = targets === getTeam().toUpperCase();
        const {
          usingItemFrame,
        } = isPlayerTeam ? playerConfig : enemyConfig;

        const twinkleImg = document.createElement("img");
        const gameBoard = isPlayerTeam
          ? document.getElementById("gameBoard")
          : document.getElementById("enemyCanvasContainer");
        twinkleImg.src = framePath;

        const frame = document.createElement("div")
        frame.className = "frame"
        frame.appendChild(twinkleImg)

        attackAudio(frameAudioPath);
        gameBoard.appendChild(frame);

        setTimeout(() => usingItemFrame(targetList, bundles, isPlayerTeam, enemyCanvasScale), 1000);
        setTimeout(() => {
          if (frame.parentNode) {
            frame.parentNode.removeChild(frame);
          }
        }, 2000);
      },
    }
  }, [])

  const { isShowSnackbar, setIsShowSnackbar, snackMessage, setSnackMessage } = useSnackbar({
    autoClosing: true,
  });

  const {
    isShowSnackbar: isShowRedSnackbar,
    onClose: onCloseRedSnackbar,
    snackMessage: redSnackMessage,
  } = useSnackbar2({
    autoClosing: true,
  });

  const {
    isShowSnackbar: isShowBlueSnackbar,
    onClose: onCloseBlueSnackbar,
    snackMessage: BlueSnackMessage,
  } = useSnackbar2({
    autoClosing: true,
  });

  const { hintList: redHintList, setHintList: setRedHintList, cleanHint: redCleanHint } = useHint();
  const {
    hintList: blueHintList,
    setHintList: setBlueHintList,
    cleanHint: blueCleanHint,
  } = useHint();

  const numOfUsingItemRed = {
    positiveItem: useRef(0),
    attackItem: useRef(0),
  };
  const numOfUsingItemBlue = {
    positiveItem: useRef(0),
    attackItem: useRef(0),
  };

  const isLoaded = useMemo(() => {
    return gameData && gameData[`${getTeam()}Puzzle`] && gameData[`${getTeam()}Puzzle`].board;
  }, [gameData]);

  const handleCloseGame = () => {
    setIsOpenedDialog(false);
    navigate(`/home`, {
      replace: true,
    });
  };

  const handleSnackClose = () => {
    setIsShowSnackbar(false);
  };

  const initializeGame = (data) => {
    const isBlue = data.blueTeam.some((p) => p.playerId === Number(getSender()));
    setTeam(isBlue ? "blue" : "red");
    setRoomId(data.gameId);
    setGameData(data);
    const targetSlot = isBlue ? data.bluePuzzle.inventory : data.redPuzzle.inventory;
    setSlots(targetSlot);
  };

  const changePercent = (data) => {
    const roundTo = (num, decimals) => {
      return parseFloat(num.toFixed(decimals));
    };

    if (getTeam() === "red") {
      setOurPercent(roundTo(data.redProgressPercent, 2)); // 소수점 두 번째 자리까지 반올림
      setEnemyPercent(roundTo(data.blueProgressPercent, 2));
    } else {
      setOurPercent(roundTo(data.blueProgressPercent, 2));
      setEnemyPercent(roundTo(data.redProgressPercent, 2));
    }
  };

  const connectSocket = async () => {
    connect(
      () => {
        console.log("@@@@@@@@@@@@@@@@ 인게임 소켓 연결 @@@@@@@@@@@@@@@@@@");
        subscribe(`/topic/game/room/${gameId}`, (message) => {
          const data = JSON.parse(message.body);

          // 매번 게임이 끝났는지 체크
          if (data.isFinished === true&&data.isStarted===true&& data.message && data.message === "SAVE_RECORD") {
            setTime(0);
            backgroundSound.muted = true;

            const ourTeamKey = `${getTeam()}Team`;
            const enemyTeamKey = getTeam() === "red" ? "blueTeam" : "redTeam";

            const formatTeamData = (team) => {
              return team.map(player => ({
                id: player.playerId,
                name: player.playerName,
                avatar: player.playerImage,
              }));
            };

            setOurTeamData(formatTeamData(data.game[ourTeamKey] || []));
            setEnemyTeamData(formatTeamData(data.game[enemyTeamKey] || []));

            setOurProgressPercent(getTeam() === "red" ? data.redProgressPercent : data.blueProgressPercent);
            setEnemyProgressPercent(getTeam() === "red" ? data.blueProgressPercent : data.redProgressPercent);
            
            const puzzleImageUrl = data.game.picture.imageUrl || data.game.picture.encodedString;
            setPuzzleImage(puzzleImageUrl);

            // 백엔드로 게임 데이터 전송
            sendGameDataToBackend(data, data.game.finishTime);
            // ----------------------------------------------------------------------

            setTimeout(() => setIsOpenedDialog(true), 1000);
            setTimeout(() => window.location.replace(`/game/battle/waiting/${roomId}`), 6000);
            // return;
          }

          // timer 설정
          if (!data.gameType && data.time) {
            setTime(data.time);
          }

          if (data.message in itemFunc) {
            itemFunc[data.message](data);
            if (getTeam().toUpperCase() == "RED") {
              setSlots(data.game.redPuzzle.inventory);
            } else {
              setSlots(data.game.bluePuzzle.inventory);
            }
          }

          if (data.redProgressPercent >= 0 && data.blueProgressPercent >= 0) {
            if (data.message && data.message === "ATTACK") {
              setTimeout(() => {
                changePercent(data);
              }, 2000);
            } else if (data.message && data.message === "MIRROR") {
              setTimeout(() => {
                changePercent(data);
              }, 3000);
            } else {
              changePercent(data);
            }
          }

          // 우리팀 event
          if (data.message && data.team === getTeam().toUpperCase()) {
            if (data.message && data.message === "LOCKED" && data.senderId !== getSender()) {
              const { targets } = data;
              const targetList = JSON.parse(targets);
              targetList.forEach(({ x, y, index }) => lockPuzzle(index, data.team));
              return;
            }
            
            if (data.message && data.message === "MOVE" && data.senderId !== getSender()) {
              const { targets } = data;
              const targetList = JSON.parse(targets);
              targetList.forEach(({ x, y, index }) => movePuzzles(x, y, index));
              return;
            }

            if (data.message && data.message === "UNLOCKED" && data.senderId !== getSender()) {
              const { targets } = data;
              const targetList = JSON.parse(targets);
              targetList.forEach(({ x, y, index }) => unLockPuzzle(index));
              return;
            }

            if (data.message && data.message === "ADD_PIECE") {
              const { targets, combo, comboCnt, team } = data;
              const [fromIndex, toIndex] = targets.split(",").map((piece) => Number(piece));
              addPiece({ fromIndex, toIndex });
              
              if (team === "RED") {
                redCleanHint({ fromIndex, toIndex });
              }
              
              if (team === "BLUE") {
                blueCleanHint({ fromIndex, toIndex });
              }
              
              return;
            }
          }else{
            if (data.message && data.message === "MOVE"){
              const { targets } = data;
              const targetList = JSON.parse(targets);
              targetList.forEach(({ x, y, index }) => enemyConfig.movePuzzles(x*enemyCanvasScale, y*enemyCanvasScale, index));
              return;
            }
            if (data.message && data.message === "ADD_PIECE") {
              const { targets, combo, comboCnt, team } = data;
              const [fromIndex, toIndex] = targets.split(",").map((piece) => Number(piece));
              enemyConfig.addPiece({ fromIndex, toIndex });
              return;
            }
          }
        });

        // 채팅
        subscribe(`/topic/chat/game/${gameId}/${getTeam()}`, (message) => {
          const data = JSON.parse(message.body);
          setChatHistory((prevChat) => [...prevChat, data]); // 채팅 기록에 새로운 채팅 추가
        });

        subscribe(`/topic/game/room/${gameId}/init`, (message) => {
          const data = JSON.parse(message.body);
          initializeGame(data.game);
          changePercent(data)
        });

        subscribe(`/topic/game/room/${gameId}/useItem`, (message) => {
          const data = JSON.parse(message.body);
          if (data.team.toUpperCase() == getTeam().toUpperCase()) {
            setSlots(data.inventory)
            const config = getConfig()
            config.tiles[data.fitPieceIndex].children[0].strokeColor = undefined
            config.tiles[data.fitPieceIndex].children[0].shadowColor = undefined
            config.tiles[data.fitPieceIndex].children[0].originStroke = colors.DEFAULT_STROKE
            config.tiles[data.fitPieceIndex].children[0].originShadow = colors.DEFAULT_SHADOW
          }
          
        });

        subscribe(`/topic/game/room/${gameId}/help`, (message) => {
          const data = JSON.parse(message.body);
          if (data.team.toUpperCase() == getTeam().toUpperCase()) {
            setSlots(data.inventory)
          }
        });

        subscribe(`/topic/game/${gameId}/pointer/init`, message => {
          const data = JSON.parse(message.body)
          setPlayers(data.filter(p => p.team.toUpperCase() == getTeam().toUpperCase()))
          const me = data.find(p => p.playerId == localStorage.getItem("userId"))
          localStorage.setItem('myColor', me.color)
        })

        // 서버로 메시지 전송
        send(`/pub/${gameId}/game/enter`, {}, JSON.stringify({}));
      },
      () => {
        console.log("@@@@@@@@@@@@@@@@@@@@@socket error 발생@@@@@@@@@@@@@@@@@@@@@");
      },
    );
  };

  const useItem = useCallback((keyNumber) => {
    send(
      "/pub/game/puzzle",
      {},
      JSON.stringify({
        type: "GAME",
        roomId: getRoomId(),
        sender: getSender(),
        message: "USE_ITEM",
        targets: keyNumber,
      }),
    );
  }, []);

  const playerId = localStorage.getItem("userId");
  const playerImage = localStorage.getItem("image");
  const playerName = localStorage.getItem("userName");
  const createPlayerRequest = () => ({
    playerId,
    playerImage,
    playerName,
  });
  const roomId = localStorage.getItem('roomId');

  const exitRoom = () => {
    send(`/pub/game/${gameId}/exit`, {}, JSON.stringify(createPlayerRequest()));
    navigate("/home");
  };

  const backgroundSound = backgroundAudio(puzzleBackground);

  useEffect(() => {
    backgroundSound.play();
    setEnemyCanvasScale(0.6); // 상대편 화면 scale 설정
    connectSocket();
    return () => {
      backgroundSound.muted = true;
    }
  }, []);

  useEffect(() => {
    if (gameData) {
      const tempSrc =
        gameData.picture.encodedString === "짱구.jpg"
          ? "https://i.namu.wiki/i/1zQlFS0_ZoofiPI4-mcmXA8zXHEcgFiAbHcnjGr7RAEyjwMHvDbrbsc8ekjZ5iWMGyzJrGl96Fv5ZIgm6YR_nA.webp"
          : // : `data:image/jpeg;base64,${gameData.picture.encodedString}`;
            gameData.picture.encodedString;

      setPictureSrc(tempSrc);
    }
  }, [gameData]);

  useEffect(() => {
    if (time <= 10 && time > 0) {
      puzzleAudio(beep);
    }
  }, [time]);

  const theme = createTheme({
    typography: {
      fontFamily: "'Galmuri11', sans-serif",
    },
  });


  const handleExit = () => {
    if (window.confirm("진심으로 게임 방에서 나가시겠습니까?")){
      exitRoom();
    }
  }

  if (!isLoaded) {
    return (
      <Wrapper>
        <Loading message="게임 정보 받아오는 중..." />
      </Wrapper>
    );
  }

  return (
    <Wrapper>
      <Row style={{ padding: "10px", width: "100%" }}>
        <Board id="gameBoard">
          <div style={{position: "absolute", top: "0px", left: "0px", width: "250px"}}>
            <Timer num={time} color={getTeam()} />
          </div>
          <ProgressContainer>
            <ProgressWrapper>
              <PrograssBar percent={ourPercent} teamColor={getTeam() === "red"? "red":"blue"} />
            </ProgressWrapper>
            <ProgressWrapper>
              <PrograssBar percent={enemyPercent} teamColor={getTeam() !== "red"? "red":"blue"} />
            </ProgressWrapper>
          </ProgressContainer>
          <div style={{position: "absolute", top: "10px", right: "10px", zIndex: 1}}>
            <OutButton onClick={() => handleExit()}>
              <DoorOpen size="40" style={{margin: "auto"}} />
            </OutButton>
          </div>
          <div style={{position: "absolute", bottom: "0px", left: "0px", zIndex: 1}}>
            <Chatting chatHistory={chatHistory} isIngame={true} isBattle={true} style={{width: "200px"}} />
          </div>
          <div style={{position: "absolute", bottom: "0px", right: "0px", maxWidth: "50%", zIndex: 1}}>
            <Inventory slots={slots} useItem={useItem} color={getTeam()}></Inventory>
          </div>
          <PlayPuzzle
            category="battle"
            shapes={parsePuzzleShapes(
              gameData[`${getTeam()}Puzzle`].board,
              gameData.picture.widthPieceCnt,
              gameData.picture.lengthPieceCnt,
            )}
            board={gameData[`${getTeam()}Puzzle`].board}
            picture={gameData.picture}
            bundles={Object.values(gameData[`${getTeam()}Puzzle`].bundles)}
            itemPieces={gameData[`${getTeam()}Puzzle`].itemPiece}
            players={players}
          />
        </Board>
        <GameInfo>
          <ImageContainer>
            <img
              src={pictureSrc}
              alt="퍼즐 그림"
              style={{ maxWidth: "100%", maxHeight: "100%", lineHeight: "0", verticalAlign: "top", objectFit: "contain" }}
            />
          </ImageContainer>
          <OtherTeam>
            <EnemyPuzzle
                  category="battle"
                  shapes={parsePuzzleShapes(
                    gameData[`${getTeam() === "red" ? "blue" : "red"}Puzzle`].board,
                    gameData.picture.widthPieceCnt,
                    gameData.picture.lengthPieceCnt,
                  )}
                  board={gameData[`${getTeam() === "red" ? "blue" : "red"}Puzzle`].board}
                  picture={gameData.picture}
                  bundles={Object.values(gameData[`${getTeam() === "red" ? "blue" : "red"}Puzzle`].bundles)}
                  itemPieces={gameData[`${getTeam() === "red" ? "blue" : "red"}Puzzle`].itemPiece}
                  enemyCanvasScale = {enemyCanvasScale}
                />
          </OtherTeam>
        </GameInfo>
      </Row>

      {getTeam() === "red" ? (
        <>
          {document.querySelector("#canvasContainer") &&
            createPortal(
              <Hint hintList={redHintList} setHintList={setRedHintList} />,
              document.querySelector("#canvasContainer"),
            )}
          <Snackbar
            anchorOrigin={{ vertical: "top", horizontal: "center" }}
            open={isShowRedSnackbar}
            autoHideDuration={1500}
            onClose={onCloseRedSnackbar}
            message={redSnackMessage}
          />
        </>
      ) : (
        <>
          {document.querySelector("#canvasContainer") &&
            createPortal(
              <Hint hintList={blueHintList} setHintList={setBlueHintList} />,
              document.querySelector("#canvasContainer"),
            )}
          <Snackbar
            anchorOrigin={{ vertical: "top", horizontal: "center" }}
            open={isShowBlueSnackbar}
            autoHideDuration={1500}
            onClose={onCloseBlueSnackbar}
            message={BlueSnackMessage}
          />
        </>
      )}

      <Snackbar
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        open={isShowSnackbar}
        autoHideDuration={3000}
        onClose={handleSnackClose}
        message={snackMessage}
      />
      <ResultModal
        isOpenedDialog={isOpenedDialog}
        handleCloseGame={handleCloseGame}
        ourPercent={ourProgressPercent}
        enemyPercent={enemyProgressPercent}
        ourTeamKey={ourTeamKey}
        enemyTeamKey={enemyTeamKey}
        ourTeam={ourTeamData}
        enemyTeam={enemyTeamData}
        image={puzzleImage}
        numOfUsingItemRed={numOfUsingItemRed}
        numOfUsingItemBlue={numOfUsingItemBlue}
        isGameEndingRef={isGameEndingRef}
      />
    </Wrapper>
  );
}

const Wrapper = styled.div`
  position: relative;
  height: 100vh;
  background-image: url(${backgroundPath3});
  background-size: cover;
  background-attachment: fixed;
  box-sizing: border-box;
  overflow: hidden;
  display: flex; /* Flex 컨테이너 */
  justify-content: space-between;
  gap: 10px;
  user-select: none; /* 텍스트 선택 금지 */
`;

const ImageContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex: 1;  
  width: 100%;
  background-color: rgba(0,0,0, 0.4);
  border-radius: 10px;
  overflow: hidden;
`

const Row = styled(Box)`
  display: flex;
  justify-content: space-between;
  box-sizing: border-box;
  gap: 10px;
`;

const GameInfo = styled(Box)`
  flex: 1;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  gap: 10px;
  align-items: center;
  width: 30%;
`;

const OtherTeam = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  border-radius: 10px;
  box-sizing: border-box;
  border: 6px solid ${getTeam() === "red" ? blue[400] : red[400]};
  background-color: rgba(255, 255, 255, 0.8);
  aspect-ratio: 4 / 3;
`;

const Board = styled.div`
  display: flex;
  box-sizing: border-box;
  height: 100%;
  width: 66%;
  border-radius: 10px;
  border: 6px solid ${getTeam() === "red" ? red[400] : blue[400]};
  background-color: rgba(255, 255, 255, 0.8);
  position: relative;
  z-index: 1;
`;

const ProgressContainer = styled.div`
  display: flex;
  box-sizing: border-box;
  position: absolute;
  top: 10px;
  left: 280px;
  width: calc(100% - 380px);
  height: 60px;
  // background-color: rgba(255, 255, 255, 0.8);
  border-radius: 10px;
`;

const ProgressWrapper = styled(Box)`
  height: 100%;
  width: 80%;
  margin: 0 auto;
`;

const OutButton = styled.button`
  background-color: orange;
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.25);
  box-sizing: border-box;
  color: white;
  border: none;
  border-radius: 5px;
  width: 60px;
  height: 60px;
  padding: 0;
  cursor: pointer;
  &:hover {
    background-color: darkorange;
  }
`;
