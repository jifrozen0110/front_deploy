import Header from "../components/Header";
import { useEffect, useState } from "react";
import { authRequest, SERVER_END_POINT } from "../apis/requestBuilder";
import { BackGround, LoginButtonBox, MainBox, PaddingDiv } from "../components/styled/styled";
import { useNavigate } from "react-router-dom";
import { getCookie } from "../hooks/cookieUtil";
import styled from "styled-components";

const width = 100

export default function ProfilePage() {
  const [userData, setUserData] = useState({})
  const navi = useNavigate()

  console.log(SERVER_END_POINT)
  console.log(getCookie('jwt'))
  useEffect(() => {
    const getUserInfo = async () => {
      const res = await authRequest().get("/api/user/info")
      if(typeof res.data === 'string'){
        navi("/")
      }else{
        localStorage.setItem("email", res.data.email)
        localStorage.setItem("image", res.data.image)
        localStorage.setItem("provider", res.data.provider)
        localStorage.setItem("userId", res.data.userId)
        localStorage.setItem("userName", res.data.userName)
        setUserData(res.data)
      }
    }
    getUserInfo()
  }, [])

  return (
    <>
      <BackGround>
        <MainBox style={{
          backgroundColor: 'unset',
          width:'100vw',
          height:'100vh',
        }}>
          <Header />
          <InfoWraper>
            <div style={{
              backgroundImage:`url(${userData.image})`,
              display:'inline-block',
              width:width,
              height:width,
              backgroundSize:"cover",
              backgroundPosition:"center",
              borderRadius:width / 2,
            }}></div>
            <div>
              <h1>{userData.userName}</h1>
              <h3>{userData.email}</h3>
            </div>
          </InfoWraper>
          <InfoWraper>
            <ChildDiv>
              <h4>퍼즐</h4>
            </ChildDiv>
            <ChildDiv>
              <AttributeTitle>승률</AttributeTitle>
              <h1>72.5%</h1>
            </ChildDiv>
            <ChildDiv>
              랭킹
            </ChildDiv>
          </InfoWraper>
        </MainBox>
      </BackGround>
    </>
  );
}


const InfoWraper = styled.div`
  padding:20px;
  border-radius:20px;
  background:white;
  margin: 0 auto;
  width:700px;
  display:flex;
  gap: 20px;
  box-shadow: 0px 2px 4px -1px rgba(0, 0, 0, 0.2), 0px 4px 5px 0px rgba(0, 0, 0, 0.14), 0px 1px 10px 0px rgba(0, 0, 0, 0.12);
  margin-bottom: 20px;
`

const ChildDiv = styled.div`
  flex:1;
  word-break: break-all;
`

const AttributeTitle = styled.h4`
  margin: 0;
  color: #777777;z
`