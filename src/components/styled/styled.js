import styled from "styled-components";

export const BackGround = styled.div`
    position: relative;
    width: 100vw;
    height: 100vh;
    background-image: url(background.png);
    background-size: cover;
`;

export const PaddingDiv = styled.div`
    height: calc(50vh - 250px)
`

export const LoginButtonBox = styled.div`
    width: 350px;
    height: 500px;
    background-color : rgb(255,255,255,0.5);
    margin: 0 auto;
    backdrop-filter: blur(7px);
`

export const MainBox = styled.div`
    margin: 0 auto;
    backdrop-filter: blur(7px);
`