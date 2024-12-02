import { useEffect, useRef, useState } from "react";
import { styled } from "styled-components";
import { Link, useLocation } from "react-router-dom";
import { Box, Tabs, Tab } from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { deepPurple } from "@mui/material/colors";
import music from "@/assets/audio/wait_game.mp3";
import muteImg from "@/assets/icons/mute.png";
import plauMusicImg from "@/assets/icons/playMusic.png";
import "./sound.css";


export default function GamePageNavigation() {
  const audioRef = useRef(null);
  const [isMute, setIsMute] = useState(true);
  const [volume, setVolume] = useState(0.5);


  const toggleMusic = () => {
    if (!audioRef.current) return;
    audioRef.current.muted = !isMute;
    setIsMute(!isMute);
  };

  const handleVolumeChange = (event) => {
    const newVolume = parseFloat(event.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const theme = createTheme({
    typography: {
      fontFamily: "'Galmuri11', sans-serif",
    },
    components: {
      MuiTabs: {
        styleOverrides: {
          root: {
            height: "100%",
          },
          indicator: {
            backgroundColor: deepPurple[700],
          },
        },
      },
      MuiTab: {
        styleOverrides: {
          root: {
            fontSize: "20px",
            color: deepPurple[500],
            padding: "20px 0",
            "&:hover": {
              backgroundColor: deepPurple[200],
              color: deepPurple[700],
            },
          },
        },
      },
    },
  });

  useEffect(() => {
    audioRef.current.play()
  },[])

  return (
    <Container>
      <ThemeProvider theme={theme}>
        <div style={{
          display:"flex",
          paddingLeft:50,
          height:60,
          alignItems:"center"
        }}>
            <div onClick={toggleMusic} style={{
              backgroundImage: `url(${isMute ? muteImg : plauMusicImg})`,
              backgroundSize:"contain",
              backgroundRepeat:"no-repeat",
              width:35,
              height:35
            }}></div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={volume}
            onChange={handleVolumeChange}
            className="volume-slider"
          />
          <audio ref={audioRef} src={music} loop autoPlay muted={isMute}></audio>
        </div>

      </ThemeProvider>
    </Container>
  );
}

const Container = styled(Box)`
  width: 350px;
  height: 100%;
  margin-top: auto;
  margin-right: auto;
  z-index: 100;

  & .Mui-selected {
    color: #fff;
    font-weight: bold;
  }
`;
