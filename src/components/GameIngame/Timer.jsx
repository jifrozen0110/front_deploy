import { styled, keyframes, css } from "styled-components";
import { getTeam } from "@/socket-utils/storage";
import { Typography } from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { red, blue, deepPurple } from "@mui/material/colors";
import { useMemo } from "react";

export default function Timer({ num, isCooperation = false, color }) {
  const isPressing = useMemo(() => {
    return !isCooperation && num <= 30; // 배틀게임이고, 30초 이하라면
  }, [isCooperation, num]);

  const min = useMemo(() => {
    return String(Math.floor(num / 60));
  }, [num]);

  const sec = useMemo(() => {
    const tempSec = num % 60;
    return tempSec <= 9 ? `0${tempSec}` : String(tempSec);
  }, [num]);

  const urgencyLevel = useMemo(() => {
    if (isCooperation || num == 0) return 0;
    if (num <= 10) return 3; // 매우 긴박
    if (num <= 20) return 2; // 긴박
    if (num <= 30) return 1; // 약간 긴박
    return 0; // 여유
  }, [isCooperation, num]);

  const teamColor = isCooperation ? deepPurple[300] : getTeam() === "red" ? red[400] : blue[400];

  const TypoStyle = {
    color: urgencyLevel > 0 ? "orange" : teamColor,
    fontWeight: 800,
    WebkitTextStroke: "2px white",
    transform: urgencyLevel > 0 ? `scale(${1 + urgencyLevel * 0.1})` : "scale(1)",
    transition: "transform 0.2s",
  };

  const theme = createTheme({
    typography: {
      fontFamily: "'Galmuri11', sans-serif",
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <Wrapper urgencyLevel={urgencyLevel} color={color}>
        <Typography variant="h3" sx={TypoStyle}>
          {min} : {sec}
        </Typography>
      </Wrapper>
    </ThemeProvider>
  );
}

const flashBackground = keyframes`
  0% {
    background-color: red;
  }
  50% {
    background-color: transparent;
  }
  100% {
    background-color: red;
  }
`;

const Wrapper = styled.div`
  width: 100%;
  text-align: center;
  padding: 15px 0;
  border-right: 4px solid ${getTeam() === "red" ? red[400] : blue[400]};
  border-bottom: 4px solid ${getTeam() === "red" ? red[400] : blue[400]};
  border-radius: 0 0 10px 0;

  ${({ urgencyLevel }) =>
    urgencyLevel > 0 &&
    css`
      animation: ${flashBackground} ${1 / urgencyLevel}s infinite; // 긴박함에 따라 점멸 속도 변경
    `}
`;
