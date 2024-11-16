import { Route, Routes as ReactRouterRoutes } from "react-router-dom";
import HomePage from "./HomePage";
// import { SingleGame } from "./SingleGame";
import { BattleGame } from "./BattleGame";
import RankPage from "./RankPage";
// import ShopPage from "./ShopPage";
// import OptionsPage from "./OptionsPage";
import ProfilePage from "./ProfilePage";

export function Routes() {
  return (
    <ReactRouterRoutes>
      <Route path="/" element={<BattleGame.ListPage />} />
      <Route path="/rank" element={<RankPage />} />
      {/* <Route path="/shop" element={<ShopPage />} /> */}
      {/* <Route path="/options" element={<OptionsPage />} /> */}
      <Route path="/user/:userId" element={<ProfilePage />} />
      <Route path="/game/battle" element={<BattleGame.ListPage />} />
      <Route path="/game/battle/waiting/:roomId" element={<BattleGame.WaitingPage />} />
      <Route path="/game/battle/ingame/:roomId" element={<BattleGame.IngamePage />} />
    </ReactRouterRoutes>
  );
}
