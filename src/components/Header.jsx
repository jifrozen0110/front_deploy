import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import ImageIcon from "./ImageIcon";
import HeaderPuzzleImage from "@/assets/icons/header_puzzle.png";
import HeaderRankImage from "@/assets/icons/header_rank.png";
import Logo from "@/assets/logo.png";
import { AppBar, Toolbar, Button } from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { deepPurple } from "@mui/material/colors";
import GamePageNavigation from "@/components/GamePageNavigation";
import { authRequest } from "../apis/requestBuilder";
import { getCookie, removeCookie } from "../hooks/cookieUtil";

export default function Header() {
  const navigate = useNavigate();

  const theme = createTheme({
    typography: {
      fontFamily: "'Galmuri11', sans-serif",
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            color: deepPurple[700],
            fontSize: "20px",
          },
        },
      },
    },
  });

  useEffect(() => {
    const token = getCookie("jwt");
    if(!token)
      navigate("/");
  }, []);

  const logout = async () => {
    const res = await authRequest().get('/api/user/logout')
    if(res?.data?.resultCode === 'OK'){
      localStorage.removeItem("email")
      localStorage.removeItem("image")
      localStorage.removeItem("provider")
      localStorage.removeItem("userId")
      localStorage.removeItem("userName")
      removeCookie("jwt")
      navigate("/")
    }
  };

  const moveProfile = async () => {
    navigate(`/user`);
  };

  return (
    <HeaderBar>
      <Toolbar sx={{ flexWrap: "wrap" }}>
        <ImageIcon imageSource={Logo} size="lg" onClick={() => navigate("/")} />
        <GamePageNavigation />

        <nav style={{ display: "flex", gap: "20px" }}>
          <ImageIcon imageSource={HeaderPuzzleImage} size="md" onClick={() => navigate("/game")} />
          <ImageIcon imageSource={HeaderRankImage} size="md" onClick={() => navigate("/rank")} />
          <ThemeProvider theme={theme}>
              <Button variant="text" size="large" onClick={moveProfile}>
                mypage
              </Button>
            <Button variant="text" size="large" onClick={logout}>
              Logout
            </Button>
          </ThemeProvider>
        </nav>
      </Toolbar>
    </HeaderBar>
  );
}

const HeaderBar = styled(AppBar)`
  position: static;
  background-color: /* #c4b6fb */ white;
  margin-bottom:20px;
`;