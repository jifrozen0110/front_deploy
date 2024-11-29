import { useState, useEffect, useRef } from "react";
import { OpenVidu } from "openvidu-browser";
import axios from "axios";
import UserAudioComponent from "./UserAudioComponent";
import IconButton from "@mui/material/IconButton";
import MicIcon from "@mui/icons-material/Mic";
import MicOffIcon from "@mui/icons-material/MicOff";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { red, blue, deepPurple } from "@mui/material/colors";

const OPENVIDU_SERVER_URL = import.meta.env.VITE_SERVER_END_POINT;

const GameOpenVidu = ({ gameId, playerName, color = "purple" }) => {
  const [mySessionId, setMySessionId] = useState(gameId);
  const [myUserName, setMyUserName] = useState(playerName);
  const [session, setSession] = useState(null);
  const publisher = useRef(null);
  const [subscribers, setSubscribers] = useState([]);
  const [isUnMuted, setIsUnMuted] = useState(true);

  useEffect(() => {
    joinSession();

    const onbeforeunload = (event) => {
      leaveSession();
    };

    window.addEventListener("beforeunload", onbeforeunload);

    return () => {
      window.removeEventListener("beforeunload", onbeforeunload);
      leaveSession();
    };
  }, []);

  useEffect(() => {
    if (publisher.current) {
      publisher.current.publishAudio(isUnMuted);
    }
  }, [publisher, isUnMuted]);

  const deleteSubscriber = (streamManager) => {
    setSubscribers((prevSubscribers) => prevSubscribers.filter((sub) => sub !== streamManager));
  };

  const joinSession = async () => {
    const OV = new OpenVidu();
    const mySession = OV.initSession();

    mySession.on("streamCreated", (event) => {
      const subscriber = mySession.subscribe(event.stream, undefined);
      setSubscribers((prevSubscribers) => [...prevSubscribers, subscriber]);
    });

    mySession.on("streamDestroyed", (event) => {
      deleteSubscriber(event.stream.streamManager);
    });

    mySession.on("exception", (exception) => {
      console.warn(exception);
    });

    try {
      // 백엔드에서 토큰 받아오기
      const response = await axios.post(
        OPENVIDU_SERVER_URL + "/api/get-token",
        { sessionId: mySessionId },
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
      const token = response.data;

      await mySession.connect(token, { clientData: myUserName });

      const publisherOV = await OV.initPublisherAsync(undefined, {
        audioSource: undefined,
        videoSource: false,
        publishAudio: isUnMuted,
        publishVideo: false,
        resolution: "640x480",
        frameRate: 30,
        insertMode: "APPEND",
        mirror: false,
      });

      mySession.publish(publisherOV);
      publisher.current = publisherOV;
    } catch (error) {
      console.error("There was an error connecting to the session:", error);
    }

    setSession(mySession);
  };

  const leaveSession = () => {
    if (session) {
      session.disconnect();
    }

    setSession(null);
    setSubscribers([]);
  };

  const toggleMute = () => {
    setIsUnMuted((prev) => !prev);
  };
  const theme = createTheme({
    typography: {
      fontFamily: "'Galmuri11', sans-serif",
    },
    palette: {
      redTeam: {
        light: red[300],
        main: red[400],
        dark: red[500],
        darker: red[600],
        contrastText: "#fff",
      },
      blueTeam: {
        light: blue[300],
        main: blue[400],
        dark: blue[500],
        darker: blue[600],
        contrastText: "#fff",
      },
      purple: {
        light: deepPurple[300],
        main: deepPurple[400],
        dark: deepPurple[500],
        darker: deepPurple[600],
        contrastText: "#fff",
      },
    },
  });

  const renderSession = () => {
    return (
      <div id="session">
        <div id="session-header">
          <ThemeProvider theme={theme}>
            <IconButton
              aria-label="mic"
              onClick={toggleMute}
              sx={{ color: "white" }}
            >
              {isUnMuted ? <MicOffIcon fontSize="inherit" /> : <MicIcon fontSize="inherit" />}
            </IconButton>
          </ThemeProvider>
        </div>

        <div id="video-container" className="col-md-6">
          {subscribers.map((sub, i) => (
            <div key={sub.id} className="stream-container col-md-6 col-xs-6">
              <span>{sub.id}</span>
              <UserAudioComponent streamManager={sub} />
            </div>
          ))}
        </div>
      </div>
    );
  };

  return <div>{session && renderSession()}</div>;
};

export default GameOpenVidu;
