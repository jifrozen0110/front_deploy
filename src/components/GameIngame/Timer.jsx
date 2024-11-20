import styled from "styled-components";
import { getTeam } from "@/socket-utils/storage";
import { Typography } from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { red, blue, deepPurple } from "@mui/material/colors";
import { useMemo } from "react";

export default function Timer({ num, isCooperation = false }) {
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

  const teamColor = isCooperation ? deepPurple[300] : getTeam() === "red" ? red[400] : blue[400];

  const TypoStyle = {
    color: isPressing ? "orange" : teamColor,
    fontWeight: 800,
    WebkitTextStroke: "2px white", // 글자 테두리
  };

  const theme = createTheme({
    typography: {
      fontFamily: "'Galmuri11', sans-serif",
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <Wrapper>
        <Typography variant="h3" sx={TypoStyle}>
          {min} : {sec}
        </Typography>
      </Wrapper>
    </ThemeProvider>
  );
}

const Wrapper = styled.div`
  width: 100%;
  text-align: center;
  background-color: rgba(255, 255, 255, 0.4); /* 반투명 배경 */
  backdrop-filter: blur(40px); /* 블러 효과 */
  padding: 25px 0 30px;
  border-radius: 10px;
`;
