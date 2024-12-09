import { styled } from "styled-components";
import LinearProgress from "@mui/material/LinearProgress";
import { red, blue } from "@mui/material/colors";
import React, { useState, useEffect } from "react";
import { getTeam } from "@/socket-utils/storage";

export default function PrograssBar({ percent, teamColor: team_color}) {
  const bar_color = team_color === "red" ? red[400] : blue[400];
  const [displayedPercent, setDisplayedPercent] = useState(percent);

  useEffect(() => {
    const roundedPercent = Math.round(percent * 10) / 10; // 목표값: 소수 첫 번째 자리까지 반올림
    const duration = 500; // 전체 목표 도달 시간 (밀리초)
    const steps = Math.abs(roundedPercent - displayedPercent) * 10; // 소수 첫 번째 자리 기준 단계 수
    const intervalTime = duration / steps; // 각 단계별 속도 (밀리초)
    const step =
      roundedPercent > displayedPercent
        ? 0.1
        : roundedPercent < displayedPercent
        ? -0.1
        : 0;
  
    const interval = setInterval(() => {
      setDisplayedPercent((prev) => {
        const nextValue = Math.round((prev + step) * 10) / 10; // 소수 첫 번째 자리로 반올림
        if (nextValue === roundedPercent) {
          clearInterval(interval);
          return roundedPercent; // 최종 값도 반올림된 값
        }
        return nextValue;
      });
    }, intervalTime); // 숫자가 변화하는 속도를 단계별로 설정
    return () => clearInterval(interval);
  }, [percent, displayedPercent]);

  return (
    <ProgressContainer>
      <PercentText style={{ color: `${bar_color}` }}>{displayedPercent}%</PercentText>
      <BorderLinearProgress
        variant="determinate"
        value={displayedPercent}
        team_color={team_color} // team_color 전달
        bar_color={bar_color} // bar_color 전달
        sx={{
          backgroundColor: "white",
          "& span.MuiLinearProgress-bar": {
            transform: `translateX(${getTeam() === team_color ? 100 - displayedPercent : -(100 - displayedPercent)}%) !important`,
          },
        }}
      />
    </ProgressContainer>
  );
}

const ProgressContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const PercentText = styled.span`
  margin-top: -3px;
  position: absolute;
  z-index: 1; /* 진행 바 위에 표시되도록 설정 */
  font-size: 30px;
  font-weight: bold;
  text-shadow: 
    2px 2px 2px white,
    -2px -2px 2px white,
    2px -2px 2px white,
    -2px 2px 2px white,
    2px 0px 2px white,
    -2px 0px 2px white,
    0px -2px 2px white,
    0px 2px 2px white,
    2px 2px 2px white,
    -2px -2px 2px white,
    2px -2px 2px white,
    -2px 2px 2px white,
    2px 0px 2px white,
    -2px 0px 2px white,
    0px -2px 2px white,
    0px 2px 2px white;
  pointer-events: none;
`;

const BorderLinearProgress = styled(LinearProgress)`
  width: 100%;
  height: 100%;
  border-radius: ${({ team_color }) => (getTeam() === team_color ? "30px 0 0 30px" : "0 30px 30px 0")};
  box-sizing: border-box;

  /* Progress bar 색상 */
  & .MuiLinearProgress-bar {
    background-color: ${({ bar_color }) => bar_color}; /* bar_color를 사용 */
  }

  /* Border 처리 */
  border: 2px solid ${({ bar_color }) => bar_color};
  border-right: ${({ team_color, bar_color }) =>getTeam() === team_color ? "none" : `2px solid ${bar_color}`};
  border-left: ${({ team_color, bar_color }) =>getTeam() === team_color ? `2px solid ${bar_color}` : "none"};
`;
