import { styled } from "styled-components";
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
      <Wrapper color={color}>
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
  padding: 15px 0;
  border-right: 4px solid ${getTeam() === "red" ? red[400] : blue[400]};
  border-bottom: 4px solid ${getTeam() === "red" ? red[400] : blue[400]};
  border-radius: 0 0 10px 0;
`;
