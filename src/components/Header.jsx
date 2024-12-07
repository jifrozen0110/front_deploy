import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { styled } from "styled-components";
import ImageIcon from "./ImageIcon";
import Logo from "@/assets/logo.png";
import { AppBar, Toolbar, Button } from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { deepPurple } from "@mui/material/colors";
import GamePageNavigation from "@/components/GamePageNavigation";
import { authRequest } from "../apis/requestBuilder";
import { getCookie, removeCookie } from "../hooks/cookieUtil";
import { logout } from "../hooks/login";

export default function Header({ parentUpdate, goProfile, goHome }) {
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
    if (!token){
      authRequest()
        .get("/api/user/refresh")
        .then((res) => {
          const { userId, userName, image, email, provider } = res.data;
          if (!userId) {
            navigate("/")
          }
          localStorage.setItem("userId", userId);
          localStorage.setItem("userName", userName);
          localStorage.setItem("image", image);
          localStorage.setItem("email", email);
          localStorage.setItem("provider", provider);
        })
        .catch((err) => navigate("/"));
      }
  }, []);

  // const moveProfile = async () => {
  //   navigate(`/user`);
  // };

  return (
    <HeaderBar>
      <Toolbar sx={{ flexWrap: "wrap" }}>
        <div onClick={() => goHome()} style={{ display: "flex", alignItems: "center", cursor: "pointer"}}>
          <div>
            <ImageIcon imageSource={Logo} size="lg" />
          </div>
          <div style={{color: "black", fontWeight: "bold", fontSize: "30px", marginLeft: "5px"}}>
            <span style={{ color: "red "}}>P</span>uzzle <span style={{ color: "blue"}}>S</span>hare
          </div>
        </div>

        <GamePageNavigation />
        <nav style={{ display: "flex", gap: "20px" }}>
          <ThemeProvider theme={theme}>
            <Button variant="text" size="large" onClick={() => goProfile()}>
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
  background-color: /* #c4b6fb */ white;
  position: relative
`;
