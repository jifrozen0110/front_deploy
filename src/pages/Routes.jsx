import { Route, Routes as ReactRouterRoutes } from "react-router-dom";
import HomePage from "./HomePage";
// import { SingleGame } from "./SingleGame";
import { BattleGame } from "./BattleGame";
import RankPage from "./RankPage";
// import ShopPage from "./ShopPage";
// import OptionsPage from "./OptionsPage";
import ProfilePage from "./ProfilePage";
import Gallery from "./Gallery";
import LoginPage from "./LoginPage";
import LoginRedirect from "./login/LoginRedirect";

export function Routes() {
  return (
    <ReactRouterRoutes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/login/redirect" element={<LoginRedirect />} />
      <Route path="/home" element={<HomePage />} />
      <Route path="/rank" element={<RankPage />} />
      {/* <Route path="/shop" element={<ShopPage />} /> */}
      {/* <Route path="/options" element={<OptionsPage />} /> */}
      {/* <Route path="/user" element={<ProfilePage />} />
      <Route path="/user/gallery" element={<Gallery />} />
      <Route path="/game/battle" element={<BattleGame.ListPage />} /> */}
      <Route path="/game/battle/waiting/:roomId" element={<BattleGame.WaitingPage />} />
      <Route path="/game/battle/ingame/:roomId" element={<BattleGame.IngamePage />} />
    </ReactRouterRoutes>
  );
}
