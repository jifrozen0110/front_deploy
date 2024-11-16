import { useNavigate } from "react-router-dom";
import ImageIcon from "./ImageIcon";
import HeaderPuzzleImage from "@/assets/icons/header_puzzle.png";
import HeaderRankImage from "@/assets/icons/header_rank.png";
import HeaderShopImage from "@/assets/icons/header_shop.png";
import Logo from "@/assets/logo.png";
import { AppBar, Toolbar, Button } from "@mui/material";
import { authRequest } from "../apis/requestBuilder";
import { useEffect } from "react";
import { getCookie, removeCookie, setCookie } from "../hooks/cookieUtil";

export default function Header() {
  const navigate = useNavigate();

  useEffect(() => {
    if (!getCookie('jwt')) 
      navigate("/")
  },[])

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
  }

  return (
    <AppBar
      position="static"
      color="default"
      elevation={0}
      sx={{ borderBottom: (theme) => `1px solid ${theme.palette.divider}` }}
    >
      <Toolbar sx={{ flexWrap: "wrap" }}>
        <div style={{ flexGrow: 1 }}>
          <ImageIcon imageSource={Logo} size="lg" onClick={() => navigate("/")} />
        </div>
        <nav style={{ display: "flex", gap: "20px" }}>
          <ImageIcon imageSource={HeaderPuzzleImage} size="md" onClick={() => navigate("/game")} />
          <ImageIcon imageSource={HeaderRankImage} size="md" onClick={() => navigate("/rank")} />
          <ImageIcon imageSource={HeaderShopImage} size="md" onClick={() => navigate("/shop")} />
          <Button variant="outlined" sx={{ my: 1, mx: 1.5 }} onClick={logout}>
            Logout
          </Button>
        </nav>
      </Toolbar>
    </AppBar>
  );
}

{
  /* <ImageIcon imageSource={headerPuzzleImage} size="lg" onClick={() => navigate("/game")} />
<ImageIcon imageSource={headerRankImage} size="lg" onClick={() => navigate("/rank")} />
<ImageIcon imageSource={headerShopImage} size="lg" onClick={() => navigate("/shop")} /> */
}
