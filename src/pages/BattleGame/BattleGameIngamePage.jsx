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

import { LogOut, ArrowLeft, Settings, DoorOpen, XCircle } from "lucide-react";
import { getRoomId, getSender, getTeam } from "@/socket-utils/storage";
import { socket } from "@/socket-utils/socket2";
import { parsePuzzleShapes } from "@/socket-utils/parsePuzzleShapes";
import { playerConfig, enemyConfig } from "@/puzzle-core";
import { getPuzzlePositionByIndex, updateGroupByBundles } from "@/puzzle-core/utils";
import { groupPuzzlePieces } from "@/puzzle-core/index";
import BackgroundPath from "@/assets/backgrounds/background2.png";

import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  Snackbar,
  Button,
  ButtonBase,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { red, blue, deepPurple } from "@mui/material/colors";
import { useHint } from "@/hooks/useHint";
import Hint from "../../components/Hint";
import { createPortal } from "react-dom";
import { useSnackbar } from "../../hooks/useSnackbar";
import { useInventory } from "../../hooks/useInventory";
import { useSnackbar2 } from "../../hooks/useSnackbar2";
import { setRoomId, setTeam } from "../../socket-utils/storage";

import Inventory from "../../components/GameIngame/Inventory";
import firePath from "@/assets/effects/fire.gif";
import boomPath from "@/assets/effects/boom.gif";
import mudPath from "@/assets/effects/mud.png";
import inkPath from "@/assets/effects/ink.png";
import tornadoPath from "@/assets/effects/tornado.gif";
import bloomPath from "@/assets/effects/blooming.gif";
import blackholePath from "@/assets/effects/blackhole.png";
import twinklePath from "@/assets/effects/twinkle.gif";
import framePath from "@/assets/effects/frame.png";

import { addAudio } from "../../puzzle-core/attackItem";
import fireAudioPath from "@/assets/audio/fire.mp3";
import mudAudioPath from "@/assets/audio/mud.wav";
import tornadoAudioPath from "@/assets/audio/tornado.mp3";
import bloomAudioPath from "@/assets/audio/blooming.mp3";
import blackholeAudioPath from "@/assets/audio/blackhole.mp3";
import frameAudioPath from "@/assets/audio/frame2.mp3";

import './ani.css';
import { authRequest } from "../../apis/requestBuilder";
import { colors } from "../../puzzle-core/color";


const { connect, send, subscribe, disconnect } = socket;
// const {
//   getConfig,
//   lockPuzzle,
//   movePuzzle,
//   unLockPuzzle,
//   addPiece,
//   usingItemFire,
//   usingItemTyphoon,
//   usingItemFrame,
// } = playerConfig;

export default function BattleGameIngamePage() {
  const navigate = useNavigate();
  const { roomId: gameId } = useParams();
  const [gameData, setGameData] = useState(null);
  const [gameDataDto, setGameDataDto] = useState(null);
  const [isOpenedDialog, setIsOpenedDialog] = useState(false);

  const [time, setTime] = useState(0);
  const [ourPercent, setOurPercent] = useState(0);
  const [enemyPercent, setEnemyPercent] = useState(0);
  const [chatHistory, setChatHistory] = useState([]);
  const [pictureSrc, setPictureSrc] = useState("");
  const [slots, setSlots] = useState(Array(8).fill(0));
  const [startTime, setStartTime] = useState(null);

  // 게임 결과 데이터를 저장할 상태 변수
  const [ourTeamData, setOurTeamData] = useState([]);
  const [enemyTeamData, setEnemyTeamData] = useState([]);
  const [ourProgressPercent, setOurProgressPercent] = useState(0);
  const [enemyProgressPercent, setEnemyProgressPercent] = useState(0);
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
      gameName: data.game.gameName,
      gameType: data.game.gameType,
      redTeam: formatTeam(data.game.redTeam),
      blueTeam: formatTeam(data.game.blueTeam),
      players: formatTeam(data.game.players),
      redProgressPercent: data.redProgressPercent !== undefined ? Math.round(data.redProgressPercent) : null,
      blueProgressPercent: data.blueProgressPercent !== undefined ? Math.round(data.blueProgressPercent) : null,
      puzzleImage: puzzleImage,
      totalPieceCount: totalPieceCount,
      startTime: data.game.startTime ? new Date(data.game.startTime).toISOString() : null,
      finishTime: data.game.finishTime ? new Date(data.game.finishTime).toISOString() : null,
    };

    console.log('전송할 게임 데이터:', gameDataDto);

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

        console.log("fire 맞을거임");

        for (let i = 0; i < targetList.length; i++) {
          const currentTargetIdx = targetList[i];
          const [x, y] = getPuzzlePositionByIndex({
            config: getConfig(),
            puzzleIndex: currentTargetIdx,
          });

          console.log("x, y", x, y);

          const fireImgCopy = fireImg.cloneNode();

          fireImgCopy.style.left = `${x}px`;
          fireImgCopy.style.top = `${y}px`;

          canvasContainer.appendChild(fireImgCopy);
          
          setTimeout(() => {
            if (fireImgCopy.parentNode) {
              console.log("불 효과 삭제");
              usingItemFire(bundles, targetList, isPlayerTeam, enemyCanvasScale);
              fireImgCopy.parentNode.removeChild(fireImgCopy);
            }
          }, 2000);
        }
        addAudio(fireAudioPath);
        
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
        

        addAudio(mudAudioPath);
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

        addAudio(tornadoAudioPath);
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

        addAudio(blackholeAudioPath);
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

        addAudio(frameAudioPath);
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
    navigate(`/game/battle`, {
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
    console.log("gamedata is here!", gameData, data);
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

  // const temp = true;

  const connectSocket = async () => {
    connect(
      () => {
        console.log("@@@@@@@@@@@@@@@@ 인게임 소켓 연결 @@@@@@@@@@@@@@@@@@");
        subscribe(`/topic/game/room/${gameId}`, (message) => {
          const data = JSON.parse(message.body);
          if(data.message !== 'MOVE'){
            console.log("##################");
            console.log(data);
          }

          // 매번 게임이 끝났는지 체크
          if (data.isFinished === true) {

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

            setTimeout(() => {
              setIsOpenedDialog(true);
            }, 1000);
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

          // 진행도
          // ATTACK일때 2초 뒤(효과 지속 시간과 동일) 반영
          // MIRROR일때 3초 뒤(효과 지속 시간과 동일) 반영
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
              targetList.forEach(({ x, y, index }) => movePuzzle(x, y, index));
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
              targetList.forEach(({ x, y, index }) => enemyConfig.movePuzzle(x*enemyCanvasScale, y*enemyCanvasScale, index));
              return;
            }
          }
        });

        // 채팅
        subscribe(`/topic/chat/game/${gameId}/${getTeam()}`, (message) => {
          const data = JSON.parse(message.body);
          console.log("채팅왔다", data);
          setChatHistory((prevChat) => [...prevChat, data]); // 채팅 기록에 새로운 채팅 추가
        });

        subscribe(`/topic/game/room/${gameId}/init`, (message) => {
          const data = JSON.parse(message.body);
          console.log("init");
          console.log(data);
          initializeGame(data.game);
          changePercent(data)
        });

        subscribe(`/topic/game/room/${gameId}/useItem`, (message) => {
          const data = JSON.parse(message.body);
          if (data.team.toUpperCase() == getTeam().toUpperCase()) {
            setSlots(data.inventory)
            const config = getConfig()
            config.tiles[data.fitPieceIndex].strokeColor = colors.DEFAULT_STROKE
            config.tiles[data.fitPieceIndex].shadowColor = colors.DEFAULT_SHADOW
            config.tiles[data.fitPieceIndex].originStroke = colors.DEFAULT_STROKE
            config.tiles[data.fitPieceIndex].originShadow = colors.DEFAULT_SHADOW
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
        // window.alert("게임이 종료되었거나 입장할 수 없습니다.");
        // navigate(`/game/battle`, {
        //   replace: true,
        // });
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
    console.log("방 나가기~");
    send(`/pub/room/${roomId}/exit`, {}, JSON.stringify(createPlayerRequest()));
  };

  useExitRoom(exitRoom, isGameEndingRef);

  useEffect(() => {
    // if (roomId !== getRoomId() || !getSender()) {
    //   navigate("/game/battle", {
    //     replace: true,
    //   });
    //   return;
    // }
    setEnemyCanvasScale(0.6) // 상대편 화면 scale 설정
    connectSocket();

    // eslint-disable-next-line
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

  const theme = createTheme({
    typography: {
      fontFamily: "'Galmuri11', sans-serif",
    },
  });

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
          <div style={{position: "absolute", top: "10px", right: "10px"}}>
            <OutButton onClick={() => navigate("/game/battle")}>
              <DoorOpen size="40" style={{margin: "auto"}} />
            </OutButton>
          </div>
          <div style={{position: "absolute", bottom: "0px", left: "0px"}}>
            <Chatting chatHistory={chatHistory} isIngame={true} isBattle={true} style={{width: "200px"}} />
          </div>
          <div style={{position: "absolute", bottom: "0px", right: "0px", maxWidth: "50%"}}>
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
              style={{ maxWidth: "100%", lineHeight: "0", verticalAlign: "top", objectFit: "contain" }}
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
          <ProgressContainer>
            <ProgressWrapper>
              <PrograssBar percent={enemyPercent} teamColor={getTeam() !== "red"? "red":"blue"} />
            </ProgressWrapper>
            <ProgressWrapper>
              <PrograssBar percent={ourPercent} teamColor={getTeam() === "red"? "red":"blue"} />
            </ProgressWrapper>
          </ProgressContainer>
        </GameInfo>
      </Row>

      {getTeam() === "red" ? (
        <>
          {/* <ItemInventory
            prevItemInventory={prevRedItemInventory}
            itemInventory={redItemInventory}
            onUseItem={handleUseItem}
          /> */}
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
          {/* <ItemInventory
            prevItemInventory={prevBlueItemInventory}
            itemInventory={blueItemInventory}
            onUseItem={handleUseItem}
          /> */}
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

      {/* <ThemeProvider theme={theme}>
            <Dialog open={isOpenedDialog} onClose={handleCloseGame}>
              <DialogTitle>게임 결과</DialogTitle>
            </Dialog>
          </ThemeProvider> */}

      <ResultModal
        isOpenedDialog={isOpenedDialog}
        handleCloseGame={handleCloseGame}
        ourPercent={ourProgressPercent}
        enemyPercent={enemyProgressPercent}
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
  background-image: url(${BackgroundPath});
  background-size: cover;
  background-attachment: fixed;
  box-sizing: border-box;

  display: flex; /* Flex 컨테이너 */
  justify-content: space-between;
  gap: 10px;
  user-select: none; /* 텍스트 선택 금지 */
`;

const ImageContainer = styled.div`
  width: 100%;
  max-height: 50%;
  text-align: center;
  background-color: rgba(0,0,0, 0.4);
  border-radius: 5px;
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
`;

const ProgressContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  padding: 5px;
  gap: 5px;
  width: 100%;
  background-color: rgba(255, 255, 255, 0.8);
  border-radius: 5px;
`;

const ProgressWrapper = styled(Box)`
  height: 100%;
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
