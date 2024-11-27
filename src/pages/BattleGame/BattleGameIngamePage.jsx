import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { styled } from "styled-components";

import PlayPuzzle from "@/components/PlayPuzzle";
import Loading from "@/components/Loading";
import Timer from "@/components/GameIngame/Timer";
import PrograssBar from "@/components/GameIngame/ProgressBar";
import Chatting2 from "@/components/GameWaiting/Chatting";
import Chatting from "@/components/Chatting";
import ResultModal from "@/components/GameIngame/ResultModal";
import useExitRoom from "@/components/ExitRoom";

import { getRoomId, getSender, getTeam } from "@/socket-utils/storage";
import { socket } from "@/socket-utils/socket2";
import { parsePuzzleShapes } from "@/socket-utils/parsePuzzleShapes";
import { configStore } from "@/puzzle-core";
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
import mudPath from "@/assets/effects/mud.png";
import tornadoPath from "@/assets/effects/tornado.gif";
import bloomPath from "@/assets/effects/blooming.gif";
import twinklePath from "@/assets/effects/twinkle.gif";

import { addAudio } from "../../puzzle-core/attackItem";
import fireAudioPath from "@/assets/audio/fire.mp3";
import mudAudioPath from "@/assets/audio/mud.wav";
import tornadoAudioPath from "@/assets/audio/tornado.mp3";
import bloomAudioPath from "@/assets/audio/blooming.mp3";
import frameAudioPath from "@/assets/audio/frame2.mp3";

import './ani.css';
import { colors } from "../../puzzle-core/color";

const { connect, send, subscribe, disconnect } = socket;
const {
  getConfig,
  lockPuzzle,
  movePuzzle,
  unLockPuzzle,
  addPiece,
  usingItemFire,
  usingItemTyphoon,
  usingItemFrame,
} = configStore;

export default function BattleGameIngamePage() {
  const navigate = useNavigate();
  const { roomId: gameId } = useParams();
  const [gameData, setGameData] = useState(null);
  const [isOpenedDialog, setIsOpenedDialog] = useState(false);

  const [time, setTime] = useState(0);
  const [ourPercent, setOurPercent] = useState(0);
  const [enemyPercent, setEnemyPercent] = useState(0);
  const [chatHistory, setChatHistory] = useState([]);
  const [pictureSrc, setPictureSrc] = useState("");
  const [slots, setSlots] = useState(Array(8).fill(0));
  const [players, setPlayers] = useState([])
  const isGameEndingRef = useRef(false);

  const itemFunc = useMemo(() => {
    return {
      FIRE(data) {
        const { targets, targetList } = data;
        const bundles = targets === "RED" ? data.redBundles : data.blueBundles;
        const fireImg = document.createElement("img");
        const canvasContainer = document.getElementById("canvasContainer");
        fireImg.src = firePath;

        fireImg.style.zIndex = 100;
        fireImg.style.position = "absolute";
        fireImg.style.width = "100px";
        fireImg.style.height = "150px";
        fireImg.style.transform = "translate(-50%, -90%)";

        // fire 당하는 팀의 효과
        if (targets === getTeam().toUpperCase()) {
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
            addAudio(fireAudioPath);

            setTimeout(() => {
              if (fireImgCopy.parentNode) {
                console.log("불 효과 삭제");
                usingItemFire(bundles, targetList);
                fireImgCopy.parentNode.removeChild(fireImgCopy);
              }
            }, 2000);
          }
        } else {
          // fire 발동하는 팀의 효과
          // console.log("fire 보낼거임");
          // fireImg.style.left = "1080px";
          // fireImg.style.top = "750px";
          // canvasContainer.appendChild(fireImg);
          // addAudio(fireAudioPath);
          // setTimeout(() => {
          //   console.log("불 효과 삭제");
          //   if (fireImg.parentNode) {
          //     fireImg.parentNode.removeChild(fireImg);
          //   }
          // }, 2000);
        }

        // setTimeout(() => {
        //   if (targetList && targets === getTeam().toUpperCase()) {
        //     console.log("fire 발동 !!");
        //   }
        // }, 2000);
      },
      MUD(data) {
        const { targets } = data;
        if (getTeam().toUpperCase() !== targets) {
          return;
        }
        const mudImg = document.createElement("img");
        mudImg.src = mudPath;
        mudImg.style.zIndex = 100;
        mudImg.style.position = "absolute";
        mudImg.style["-webkit-user-drag"] = "none";
        mudImg.style["-khtml-user-drag"] = "none";
        mudImg.style["-moz-user-drag"] = "none";
        mudImg.style["-o-user-drag"] = "none";
        mudImg.style["user-drag"] = "none";
        mudImg.style["pointer-events"] = "none";
        mudImg.style["max-height"] = "100%";

        const gameBoard = document.getElementById("gameBoard");

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
        if (getTeam().toUpperCase() !== targets) {
          return
        }

        const tornadoImg = document.createElement("img");
        const gameBoard = document.getElementById("gameBoard");
        tornadoImg.src = tornadoPath;

        tornadoImg.style.zIndex = 100;
        tornadoImg.style.position = "absolute";
        tornadoImg.style["pointer-events"] = "none";
        tornadoImg.style.width = "40%";
        tornadoImg.style.height = "45%";

        if (targetList === null || targetList.length === 0) {
          return;
        }

        tornadoImg.style.animation = "moveAround 1.2s linear infinite";

        addAudio(tornadoAudioPath);
        gameBoard.appendChild(tornadoImg);
        usingItemTyphoon(targetList, bundles)

        setTimeout(() => {
          if (tornadoImg.parentNode) {
            tornadoImg.parentNode.removeChild(tornadoImg);
          }
        }, 1200);
      },
      BROOMSTICK(data){
        const { targets, targetList } = data
        const bundles = targets === "RED" ? data.redBundles : data.blueBundles;
        if (getTeam().toUpperCase() !== targets) {
          return
        }
        if (targetList === null || targetList.length === 0) {
          return;
        }

        const bloomImg = document.createElement("img");
        const gameBoard = document.getElementById("gameBoard");
        bloomImg.src = bloomPath;

        bloomImg.style.zIndex = 100;
        bloomImg.style.position = "absolute";
        bloomImg.style["pointer-events"] = "none";
        bloomImg.style.width = "75%";
        bloomImg.style.height = "75%";

        addAudio(bloomAudioPath);
        gameBoard.appendChild(bloomImg);

        setTimeout(() => usingItemTyphoon(targetList, bundles), 1000);
        setTimeout(() => {
          if (bloomImg.parentNode) {
            bloomImg.parentNode.removeChild(bloomImg);
          }
        }, 2000);
      },
      FRAME(data){
        const { targets, targetList } = data
        const bundles = targets === "RED" ? data.redBundles : data.blueBundles;
        if (getTeam().toUpperCase() !== targets) {
          return
        }

        const twinkleImg = document.createElement("img");
        const gameBoard = document.getElementById("gameBoard");
        twinkleImg.src = twinklePath;

        twinkleImg.style.zIndex = 100;
        twinkleImg.style.position = "absolute";
        twinkleImg.style["pointer-events"] = "none";
        twinkleImg.style.width = "100%";
        twinkleImg.style.height = "100%";

        addAudio(frameAudioPath);
        gameBoard.appendChild(twinkleImg);

        setTimeout(() => usingItemFrame(targetList, bundles), 1000);
        setTimeout(() => {
          if (twinkleImg.parentNode) {
            twinkleImg.parentNode.removeChild(twinkleImg);
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
            console.log(data);
          }

          // 매번 게임이 끝났는지 체크
          if (data.isFinished === true) {
            // if (temp === true) {
            // disconnect();
            console.log("게임 끝남 !"); // TODO : 게임 끝났을 때 effect
            console.log(data, gameData);
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
      <LeftSidebar>
        <OutButton onClick={() => navigate("/game/battle")}>
          나가기
        </OutButton>
        <Chatting2 chatHistory={chatHistory} isIngame={true} isBattle={true} />
        {/* <Chatting /> */}
      </LeftSidebar>
      <Row style={{ padding: "10px 10px 10px 0", width: "80%", boxSizing: "border-box" }}>
        <Board id="gameBoard">
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
          <img
            src={pictureSrc}
            alt="퍼즐 그림"
            style={{ width: "100%" }}
          />
          <Row>
            <ProgressContainer>
              <ProgressWrapper>
                <PrograssBar
                  percent={ourPercent}
                  teamColor={getTeam() === "red" ? "red" : "blue"}
                />
              </ProgressWrapper>
              <ProgressWrapper>
              <PrograssBar percent={enemyPercent} teamColor={getTeam() !== "red"? "red":"blue"} />
              </ProgressWrapper>
            </ProgressContainer>
            <Col>
              <OtherTeam>
                <div style={{ width: "100%", textAlign: "center", fontSize: "50px"}}>
                  상대팀 화면
                </div>
              </OtherTeam>
              <Timer num={time} />
              <Inventory slots={slots} useItem={useItem}></Inventory>
              {/* <MiniMap>
                <div style={{ width: "100%", textAlign: "center", fontSize: "50px"}}>
                  미니맵
                </div>
              </MiniMap> */}
            </Col>
          </Row>
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
        ourPercent={ourPercent}
        enemyPercent={enemyPercent}
        ourTeam={gameData[`${getTeam()}Team`].players}
        enemyTeam={getTeam() === "red" ? gameData.blueTeam.players : gameData.redTeam.players}
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

const LeftSidebar = styled.div`
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  height: 100%;
  width: 20%;
`;

const ProgressContainer = styled.div`
  display: flex;
  box-sizing: border-box;
  gap: 10px;
`;

const Row = styled(Box)`
  display: flex;
  justify-content: space-between;
  box-sizing: border-box;
  height: 100%;
  width: 100%;
  gap: 10px;
`;

const Col = styled(Box)`
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  gap: 10px;
  flex-grow: 1;
  align-items: center;
`;

const GameInfo = styled(Box)`
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  gap: 10px;
  width: 30%;
  align-items: center;
`;

const OtherTeam = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  height: 200px;
  background-color: lightgrey;
  aspect-ratio: 3 / 4;
`;

const Board = styled.div`
  width: 70%;
  height: 100%;
  display: flex;
  box-sizing: border-box;
  border-radius: 10px;
  border: 6px solid ${getTeam() === "red" ? red[400] : blue[400]};
  background-color: rgba(255, 255, 255, 0.8);
  position: relative;
`;

const ItemContainer = styled.div`
  display: flex;
  align-items: center;

  width: 100%;
  height: 100%;
  box-sizing: border-box;
  border-radius: 10px;
  border: 4px solid white;
  background-color: ${getTeam() === "red" ? red[400] : blue[400]};
`;

const MiniMap = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  height: 100%;
  border-radius: 10px;
  background-color: white;
`;

const ProgressWrapper = styled(Box)`
  display: inline-block;
  transform: rotate(180deg);
`;

const OutButton = styled.button`
  background-color: orange;
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.25);
  box-sizing: border-box;
  color: white;
  border: none;
  border-radius: 0 0 10px 0;
  width: 100%;
  font-size: 2.4em;
  padding: 10px;
  cursor: pointer;
  &:hover {
    background-color: darkorange;
  }
`;
