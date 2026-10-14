import { Navigate, Route, Routes } from "react-router-dom";
import { MainLayout } from "./layouts/MainLayout";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import ExploreResources from "./pages/ExploreResources";
import ShareResource from "./pages/ShareResource";
import PostNeed from "./pages/PostNeed";
import SmartMatches from "./pages/SmartMatches";
import MatchManagement from "./pages/MatchManagement";
import MyListings from "./pages/MyListings";
import Impact from "./pages/Impact";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route element={<MainLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/explore" element={<ExploreResources />} />
        <Route path="/share" element={<ShareResource />} />
        <Route path="/post-need" element={<PostNeed />} />
        <Route path="/matches" element={<SmartMatches />} />
        <Route path="/matches/manage" element={<MatchManagement />} />
        <Route path="/my-listings" element={<MyListings />} />
        <Route path="/impact" element={<Impact />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
