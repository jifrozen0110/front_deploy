import { useEffect, useState,useMemo, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { IconButton, Button, createTheme, ThemeProvider } from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Chatting from "@/components/Chatting";
import CreateRoomButton from "@/components/GameRoomList/CreateRoomButton";
import GameRoomListBoard from "@/components/GameRoomList/GameRoomListBoard";
import { request } from "@/apis/requestBuilder";
import { getSender } from "@/socket-utils/storage";
import backgroundPath from "@/assets/backgrounds/background.png";
import { socket } from "../../socket-utils/socket2";
import { setRoomId, setSender, setTeam } from "../../socket-utils/storage";
import { deepPurple } from "@mui/material/colors";
import UserListSidebar from "../../components/GameRoomList/UserListSidebar";
import { authRequest } from "../../apis/requestBuilder";
import music from "@/assets/audio/wait_game.mp3"

const { connect, send, subscribe, disconnect } = socket;

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

export default function BattleGameListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [roomList, setRoomList] = useState(null);
  const [pageNumber, setPageNumber] = useState(0);
  const isLoading = useMemo(() => roomList === null, [roomList]);
  const audioTag = useRef(null)
  const [chatList, setChatList] = useState([])

  const refetchAllRoom = () => {
    fetchAllRoom();
  };

  const fetchAllRoom = async () => {
    const res = await authRequest().get(`/api/rooms?page=${pageNumber}`);
    const { data: fetchedRoomList } = res;
    setRoomList(fetchedRoomList);
  };

  useEffect(() => {
    fetchAllRoom();
    audioTag.current.muted = false
    connect(() => {
      subscribe('/topic/chat/main', message => {
        const data = JSON.parse(message.body)
        setChatList(preChatList => [...preChatList, data])
      })
    })
  }, []);

  useEffect(() => {
    // 페이지 번호가 변경될 때 데이터 가져오기
    setPageNumber(parseInt(searchParams.get("page"), 10) || 0);
  }, [pageNumber]);

  function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      return parts.pop().split(";").shift();
    }
  }

  const quickMatching = () => {
    const sender = getCookie("userId");
    if (!sender) {
      alert("로그인한 유저만 이용할 수 있는 기능입니다.");
      return;
    }

    connect(() => {
      //대기 큐 입장했다고 보내기
      send(
        "/app/game/message",
        {},
        JSON.stringify({
          type: "QUICK",
          sender: sender,
          member: true,
        }),
      );

      //랜덤 매칭 큐 소켓
      subscribe(`/topic/game/room/quick/${sender}`, (message) => {
        const data = JSON.parse(message.body);
        if (data.message === "WAITING") {
          alert("waiting");
        } else if (data.message === "GAME_START") {
          setRoomId(data.targets);
          setSender(sender);
          if (data.team === "RED") {
            setTeam("red");
          } else {
            setTeam("blue");
          }
          window.location.replace(`/game/battle/ingame/${data.targets}`);
        }
      });

      //응답 메시지 파싱
    });
  };
  return (
    <>
      <audio ref={audioTag} src={music} autoPlay loop muted></audio>
      {isLoading ? (
        <Wrapper>
          <Header />
          <div>Loading...</div>
          <Footer />
        </Wrapper>
      ) : (
        <Wrapper>
          <Header />
          <ContentContainer>
            <LeftSidebar>
              <CreateRoomButtonContainer>
                <CreateRoomButton category="battle" style={{width: "100%"}} />
                <IconButton aria-label="refresh" onClick={refetchAllRoom} sx={{ marginLeft: "auto" }}>
                  <RefreshIcon />
                </IconButton>
              </CreateRoomButtonContainer>
              <Chatting chatList={chatList} path={"/pub/chat/main"}/>
            </LeftSidebar>
            <GameRoomListBoard category="battle" roomList={roomList} />
            <RightSidebar>
              <UserListSidebar />
            </RightSidebar>
          </ContentContainer>
        </Wrapper>
      )}
    </>
  );  
}

const Wrapper = styled.div`
  position: relative;
  height: 100vh;
  background-image: url(${backgroundPath});
  background-size: cover;
  background-attachment: fixed;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    backdrop-filter: blur(5px); /* 블러 효과 추가 */
    z-index: 0; /* 배경 위에 위치 */
  }

  > * {
    position: relative; /* 자식 요소를 블러 바깥으로 제외 */
    z-index: 1;
  }
`;

const CreateRoomButtonContainer = styled.div`
  display: flex;
  background-color: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(40px);
  flex-direction: column;
  padding: 15px; 10px;
  gap: 15px;
`

const ContentContainer = styled.div`
  display: flex;
  justify-content: space-between;
  height: calc(100vh - 66px);
`;

const LeftSidebar = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 25%;
`;

const RightSidebar = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 25%;
`;
