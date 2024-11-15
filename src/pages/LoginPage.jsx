import styled from "styled-components";
import { Button } from "@mui/material";
import naverLogo from "/src/assets/icons/login/naver_logo.png"
import kakaoLogo from "/src/assets/icons/login/kakao_logo.png"
import googleLogo from "/src/assets/icons/login/google_logo.png"

const serverBase = 'http://localhost:8080'

export default function LoginPage() {
    const oauth2Login = provider => window.location.href = `${serverBase}/oauth2/authorization/${provider}`
    return (
        <BackGround>
            <PaddingDiv />
            <LoginButtonBox>
                <div style={{
                    textAlign:"center",
                    paddingTop:100
                }}>
                    <img src="logo.png" alt=""  style={{width:60}}/>
                    <h1 style={{
                        color:"#7b95b7", 
                        fontSize:"2.5em",
                        textShadow: "3px 0 white, -3px 0 white, 0 3px white, 0 -3px white, 3px 3px white, -3px -3px white, -3px 3px white, 3px -3px white"
                        }}>Puzzle Share</h1>
                </div>
                <div style={{
                    display:"flex",
                    flexDirection:"column",
                    paddingTop:30,
                    gap:10,
                    width:250,
                    margin:"0 auto"
                }}>
                    <Button style={{
                        color:"white",
                        background:"#03c75a",
                        fontWeight:600
                    }} onClick={() => oauth2Login("naver")}><img src={naverLogo} style={{width:40}}/>네이버 로그인</Button>
                    <Button style={{
                        color:"rgb(0 0 0 / 85%)",
                        background:"#FEE500",
                        fontWeight:600
                    }} onClick={() => oauth2Login("kakao")}><img src={kakaoLogo} style={{height:20, margin:10}}/> 카카오 로그인</Button>
                    <Button style={{
                        color:"#5f6368",
                        background:"#FFFFFF",
                        fontWeight:600
                    }} onClick={() => oauth2Login("google")}><img src={googleLogo} style={{height:20, margin:10}}/> 구글 로그인</Button>
                </div>
            </LoginButtonBox>
        </BackGround>
  );
}

const BackGround = styled.div`
    position: relative;
    width: 100vw;
    height: 100vh;
    background-image: url(background.png);
    background-size: cover;
`;
const PaddingDiv = styled.div`
    height: calc(50vh - 250px)
`
const LoginButtonBox = styled.div`
    width: 350px;
    height: 500px;
    // background-color : rgb(255,255,255,0.5);
    margin: 0 auto;
    backdrop-filter: blur(7px);
`