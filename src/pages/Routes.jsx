import { Route, Routes as ReactRouterRoutes } from "react-router-dom";
import HomePage from "./HomePage";
import { BattleGame } from "./BattleGame";
import RankPage from "./RankPage";
import LoginPage from "./LoginPage";
import LoginRedirect from "./login/LoginRedirect";

export function Routes() {
  return (
    <ReactRouterRoutes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/login/redirect" element={<LoginRedirect />} />
      <Route path="/home" element={<HomePage />} />
      <Route path="/rank" element={<RankPage />} />
      <Route path="/game/battle/waiting/:roomId" element={<BattleGame.WaitingPage />} />
      <Route path="/game/battle/ingame/:roomId" element={<BattleGame.IngamePage />} />
    </ReactRouterRoutes>
  );
}
