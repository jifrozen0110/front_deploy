import styled from "styled-components";

export const BackGround = styled.div`
    position: relative;
    min-height: 100vh;
    background-image: url(background.png);
    background-size: cover;
    background-attachment: fixed;

    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        backdrop-filter: blur(5px); /* 블러 효과 추가 */
        z-index: 0; /* 배경 위에 위치 */
    }

    > * {
        position: relative; /* 자식 요소를 블러 바깥으로 제외 */
        z-index: 1;
    }
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