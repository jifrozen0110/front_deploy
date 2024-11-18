import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styled from "styled-components";

import PlayPuzzle from "@/components/PlayPuzzle";
import Loading from "@/components/Loading";
import Timer from "@/components/GameIngame/Timer";
import PrograssBar from "@/components/GameIngame/ProgressBar";
import Chatting from "@/components/GameWaiting/Chatting";
import ResultModal from "@/components/GameIngame/ResultModal";

import { getRoomId, getSender, getTeam } from "@/socket-utils/storage";
import { socket } from "@/socket-utils/socket2";
import { parsePuzzleShapes } from "@/socket-utils/parsePuzzleShapes";
import { configStore } from "@/puzzle-core";
import { updateGroupByBundles } from "@/puzzle-core/utils";

import redTeamBackgroundPath from "@/assets/backgrounds/background.png";
import blueTeamBackgroundPath from "@/assets/backgrounds/background.gif";

import { Box, Dialog, DialogTitle, DialogContent, Snackbar } from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { red, blue, deepPurple } from "@mui/material/colors";
import { useHint } from "@/hooks/useHint";
import Hint from "../../components/Hint";
import { createPortal } from "react-dom";
import { useSnackbar } from "../../hooks/useSnackbar";
import { useInventory } from "../../hooks/useInventory";
import { useSnackbar2 } from "../../hooks/useSnackbar2";

const { connect, send, subscribe, disconnect } = socket;
const { getConfig, lockPuzzle, movePuzzle, unLockPuzzle, addPiece } = configStore;

export default function BattleGameIngamePage() {
  const navigate = useNavigate();
  const { roomId } = useParams();
  const [gameData, setGameData] = useState(null);
  const [isOpenedDialog, setIsOpenedDialog] = useState(false);

  const [time, setTime] = useState(0);
  const [ourPercent, setOurPercent] = useState(0);
  const [enemyPercent, setEnemyPercent] = useState(0);
  const [chatHistory, setChatHistory] = useState([]);
  const [pictureSrc, setPictureSrc] = useState("");

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
    setGameData(data);
    console.log("gamedata is here!", gameData, data);
  };

  const changePercent = (data) => {
    if (getTeam() === "red") {
      setOurPercent(data.redProgressPercent);
      setEnemyPercent(data.blueProgressPercent);
    } else {
      setOurPercent(data.blueProgressPercent);
      setEnemyPercent(data.redProgressPercent);
    }
  };

  // const temp = true;

  const connectSocket = async () => {
    connect(
      () => {
        console.log("@@@@@@@@@@@@@@@@ 인게임 소켓 연결 @@@@@@@@@@@@@@@@@@");
        subscribe(`/topic/game/room/${roomId}`, (message) => {
          const data = JSON.parse(message.body);
          console.log(data);

          // console.log(
          //   data.finished,
          //   Boolean(data.finished),
          //   data.redProgressPercent === 100,
          //   data.blueProgressPercent === 100,
          //   data.time,
          // );
          // console.log(
          //   Boolean(data.finished) ||
          //     data.redProgressPercent === 100 ||
          //     data.blueProgressPercent === 100 ||
          //     (data.time !== undefined && data.time <= 0),
          // );

          // 매번 게임이 끝났는지 체크
          if (data.finished === true) {
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

          // 게임정보 받기
          if (data.gameType && data.gameType === "BATTLE") {
            initializeGame(data);
            setTimeout(() => {
              console.log("번들로 그룹화 해볼게", getConfig(), data[`${getTeam()}Puzzle`].bundles);
              updateGroupByBundles({
                config: getConfig(),
                bundles: data[`${getTeam()}Puzzle`].bundles,
              });
            }, 400);

            return;
          }

          // 진행도
          // ATTACK일때 2초 뒤(효과 지속 시간과 동일) 반영
          // MIRROR일때 3초 뒤(효과 지속 시간과 동일) 반영
          if (data.redProgressPercent >= 0 && data.blueProgressPercent >= 0) {
            console.log("진행도?", data.redProgressPercent, data.blueProgressPercent);
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
              targetList.forEach(({ x, y, index }) => lockPuzzle(x, y, index));
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
              targetList.forEach(({ x, y, index }) => unLockPuzzle(x, y, index));
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
        subscribe(`/topic/chat/room/${roomId}`, (message) => {
          const data = JSON.parse(message.body);
          console.log("채팅왔다", data);
          const { userid, chatMessage, time, teamColor } = data;
          if (teamColor === getTeam().toUpperCase()) {
            const receivedMessage = { userid, chatMessage, time }; // 받은 채팅
            setChatHistory((prevChat) => [...prevChat, receivedMessage]); // 채팅 기록에 새로운 채팅 추가
          }
        });

        // 서버로 메시지 전송
        send(
          "/app/game/message",
          {},
          JSON.stringify({
            type: "ENTER",
            roomId: getRoomId(),
            sender: getSender(),
          }),
        );
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

  useEffect(() => {
    if (roomId !== getRoomId() || !getSender()) {
      navigate("/game/battle", {
        replace: true,
      });
      return;
    }

    connectSocket();

    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (gameData) {
      const tempSrc =
        gameData.picture.encodedString === "짱구.jpg"
          ? "https://i.namu.wiki/i/1zQlFS0_ZoofiPI4-mcmXA8zXHEcgFiAbHcnjGr7RAEyjwMHvDbrbsc8ekjZ5iWMGyzJrGl96Fv5ZIgm6YR_nA.webp"
          : `data:image/jpeg;base64,${gameData.picture.encodedString}`;

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
        />
        <Row>
          <ProgressWrapper>
            <PrograssBar percent={ourPercent} isEnemy={false} />
          </ProgressWrapper>
          <ProgressWrapper>
            <PrograssBar percent={enemyPercent} isEnemy={true} />
          </ProgressWrapper>
        </Row>

        <Col>
          <Timer num={time} />
          <h3>이 그림을 맞춰주세요!</h3>
          <img
            src={pictureSrc}
            alt="퍼즐 그림"
            style={{ width: "100%", borderRadius: "10px", margin: "5px" }}
          />
          <Chatting chatHistory={chatHistory} isIngame={true} isBattle={true} />
        </Col>
      </Board>

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
      />
    </Wrapper>
  );
}

const Wrapper = styled.div`
  height: 100vh;
  min-height: 1000px;
  background-image: ${getTeam() === "red"
    ? `url(${redTeamBackgroundPath})`
    : `url(${blueTeamBackgroundPath})`};
`;

const Row = styled(Box)`
  display: flex;
  height: 100%;
  margin-left: 10px;
`;

const Col = styled(Box)`
  display: flex;
  flex-grow: 1;
  flex-direction: column;
  align-items: center;
  margin-left: 10px;
`;

const Board = styled.div`
  width: 1320px;
  height: 754px;
  display: flex;
  position: relative;
  top: 50px;
  margin: auto;
  padding: 2%;
  padding-right: 1.5%;
  border-radius: 20px;
  border: 3px solid ${getTeam() === "red" ? red[400] : blue[400]};
  background-color: rgba(255, 255, 255, 0.8);
`;

const ProgressWrapper = styled(Box)`
  margin: 0 1px;
  display: inline-block;
  transform: rotate(180deg);
`;