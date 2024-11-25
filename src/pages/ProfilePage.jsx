import Header from "../components/Header";
import { useEffect, useState } from "react";
import { authRequest, SERVER_END_POINT } from "../apis/requestBuilder";
import { BackGround, LoginButtonBox, MainBox, PaddingDiv } from "../components/styled/styled";
import { useNavigate } from "react-router-dom";
import { styled } from "styled-components";
import GalleryWall from "@/components/MyPage/GalleryWall";
import { Camera, ChevronRight, Swords, Handshake, User, Star } from 'lucide-react';

const width = 100

export default function ProfilePage() {
  const [userData, setUserData] = useState({})
  const [forUpdate, setForUpdate] = useState(0)
  const navigate = useNavigate()
  const forceUpdate = () => setForUpdate(forUpdate + 1)

  const records = [
    {
      id: 1,
      title: "방 제목입니다111",
      mode: "대전",
      detail: "2024.11.17 15:32",
      status: "승리"
    },
    {
      id: 2,
      title: "방 제목입니다222",
      mode: "협동",
      detail: "2024.11.17 14:45",
      status: "완료"
    },
    {
      id: 3,
      title: "방 제목입니다333",
      mode: "솔로",
      detail: "2024.11.16 19:23",
      status: "실패"
    },
  ];

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
  }, [forUpdate])

  const moveGalleryWall = async () => {
    navigate(`/user/gallery`);
  };

  return (
    <>
      <BackGround style={{paddingBottom: "50px"}}>
        <Header parentUpdate={forceUpdate} />

        <InfoWraper style={{marginTop: "50px", padding: "35px"}}>
          <Profile>
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
              <div style={{fontSize: "32px", fontWeight: "bold"}}>{userData.userName}</div>
              <div style={{fontSize: "20px"}}>{userData.email}</div>
            </div>
          </Profile>
        </InfoWraper>

        <InfoWraper style={{marginTop: "40px"}}>
          <SubSection style={{marginBottom: "30px", display: "flex", justifyContent: "space-between", alignItems: "center"}}>
            <InfoTitle>
              <Camera size={20} color="#3B82F6" />
              갤러리
              <SubDetail>17</SubDetail>
            </InfoTitle>
            <div onClick={moveGalleryWall} style={{display: "flex", alignItem: "center", color: "grey", cursor: "pointer"}}>
              더보기
              <ChevronRight size={20} style={{margin: "auto 0"}} />
            </div>
          </SubSection>
          <GalleryWall count={3} />
        </InfoWraper>

        <InfoWraper style={{zIndex: "0"}}>
          <Battle>
            <SubSection>
              <InfoTitle>
                <Swords size={20} color="#FE5B5E" />
                대전 모드
              </InfoTitle>
            </SubSection>
            <SubSection>
              <Subtitle>승률</Subtitle>
              <SubValue>72.5%</SubValue>
              <SubDetail>180승 / 248게임</SubDetail>
            </SubSection>
            <SubSection>
              <Subtitle>랭킹</Subtitle>
              <SubValue>#127</SubValue>
            </SubSection>
          </Battle>
        </InfoWraper>

        <InfoWraper style={{zIndex: "0"}}>
          <SubSection>
            <InfoTitle>
              <Star size={20} color="orange" />
              최근 게임 기록
            </InfoTitle>
          </SubSection>
          <Record>
            {records.map((record) => (
              <RecordCard key={record.id}>
                <IconContainer style={{ 
                  backgroundColor: record.mode=="대전"? "rgba(254, 91, 94, 0.1)":
                                    record.mode=="협동"? "rgba(34, 197, 94, 0.1)":
                                    record.mode=="솔로"? "rgba(168, 85, 247, 0.1)":"grey" }}>
                  {record.mode=="대전"? <Swords size={20} color="#FE5B5E" />:
                    record.mode=="협동"? <Handshake size={20} color="#22C55E" />:
                    record.mode=="솔로"? <User size={20} color="#A855F7" />:""}
                </IconContainer>
                <RecordContent>
                  <RecordTitle>{record.title}</RecordTitle>
                  <RecordDetail>{record.detail}</RecordDetail>
                </RecordContent>
                <RecordResult
                  style={{
                    color: (record.status=="승리"? "#15803D": record.status=="완료"? "#A855F7":"#801515"),
                    backgroundColor: (record.status=="승리"? "#DCFCE7": record.status=="완료"? "#F3E8FF":"#FCDCDC")
                  }}>
                  {record.status}
                </RecordResult>
              </RecordCard>
            ))}
          </Record>
        </InfoWraper>
      </BackGround>
    </>
  );
}

const InfoWraper = styled.div`
  padding: 30px 25px;
  border-radius: 10px;
  background: white;
  box-sizing: border-box;
  max-width: 1000px;
  margin: 25px auto 0;
  box-shadow: 0px 2px 4px -1px rgba(0, 0, 0, 0.2), 0px 4px 5px 0px rgba(0, 0, 0, 0.14), 0px 1px 10px 0px rgba(0, 0, 0, 0.12);
`

const Profile = styled.div`
  display: flex;
  gap: 35px;
  width: 100%;
  box-sizing: border-box;
`

const MoreButton = styled.button`

`

const Battle = styled.div`
  box-sizing: border-box;
  display: flex;
  justify-content: space-around;
`

const Record = styled.div`
  margin-top: 30px;
  display: flex;
  flex-direction: column;
  gap: 15px; /* 카드 간격 조정 */
`;

const RecordCard = styled.div`
  display: flex;
  align-items: center;
  padding: 15px 20px;
  background-color: #F5F5F5;
  border-radius: 10px;
  gap: 20px; /* 아이콘과 텍스트 간격 */
`;

const RecordContent = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const RecordTitle = styled.div`
  font-size: 16px;
  font-weight: bold;
  color: #333333;
`;

const RecordDetail = styled.div`
  font-size: 14px;
  color: #707070;
  margin-top: 4px;
`;

const RecordResult = styled.span`
  margin-left: auto;
  padding: 5px 15px;
  border-radius: 5px;
  font-weight: bold ;
  font-size: 14px;
`

const SubSection = styled.div`
  margin-right: auto;
`;

const InfoTitle = styled.span`
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 20px;
  font-weight: bold;
`;

const Subtitle = styled.span`
  font-size: 16px;
  color: #707070;
`;

const SubValue = styled.span`
  font-size: 24px;
  font-weight: bold;
  color: #1a73e8;
  margin-top: 8px;
  display: block;
`;

const SubDetail = styled.span`
  font-size: 14px;
  color: #606060;
  margin-top: 4px;
  display: block;
`;

const IconContainer = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%; /* 원 모양 */
  display: flex;
  align-items: center;
  justify-content: center;
`