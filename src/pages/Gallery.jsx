import Header from "../components/Header";
import { useEffect, useState } from "react";
import { authRequest, SERVER_END_POINT } from "../apis/requestBuilder";
import { BackGround, LoginButtonBox, MainBox, PaddingDiv } from "../components/styled/styled";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import GalleryWall from "@/components/MyPage/GalleryWall";
import { ChevronLeft } from 'lucide-react';

const width = 100

export default function Gallery() {
  const [forUpdate, setForUpdate] = useState(0)
  const forceUpdate = () => setForUpdate(forUpdate + 1)
  const navigate = useNavigate();

  const moveMyPage = async () => {
    navigate(`/user`);
  };

  return (
    <>
      <BackGround style={{paddingBottom: "50px"}}>
        <Header parentUpdate={forceUpdate} />

        <InfoWraper style={{marginTop: "40px"}}>
          <SubSection onClick={moveMyPage} style={{marginBottom: "30px", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer"}}>
            <InfoTitle>
              <ChevronLeft size={20} />
              갤러리
              <SubDetail style={{marginLeft: "10px"}}>17</SubDetail>
            </InfoTitle>
          </SubSection>
          <GalleryWall />
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

const SubSection = styled.div`
  margin-right: auto;
`;

const InfoTitle = styled.span`
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 20px;
  font-weight: bold;
`;

const SubDetail = styled.span`
  font-size: 14px;
  color: #606060;
  margin-top: 4px;
  display: block;
`;
