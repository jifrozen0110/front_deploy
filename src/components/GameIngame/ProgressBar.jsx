import styled from "styled-components";
import LinearProgress from "@mui/material/LinearProgress";
import { getTeam } from "@/socket-utils/storage";
import { red, blue, deepPurple } from "@mui/material/colors";

export default function PrograssBar({ percent, isEnemy }) {
  const barColor = getTeam() === "red" ? red[400] : blue[400];

  return (
    <BorderLinearProgress
      variant="determinate"
      value={percent}
      sx={{
        backgroundColor: "white",
        "& span.MuiLinearProgress-bar": {
          transform: `translateY(-${100 - percent}%) !important`,
          backgroundColor: barColor,
          borderRadius: "8px",
        },
      }}
    />
  );
}

const BorderLinearProgress = styled(LinearProgress)`
  width: 20px;
  height: 100%;
`;
