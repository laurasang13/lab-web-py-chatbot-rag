import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage/HomePage";
import FeelingPage from "./pages/FeelingsPage/FeelingPage";
import Navbar from "./components/Navbar/Navbar";
import MoodDetailPage from "./pages/MoodDetailPage/MoodDetailPage";
import SignUpPage from "./components/SignUp/SignUpPage"
import UserProfilePage from "./pages/UserProfilePage/UserProfilePage"
import CurrentMood from "./components/CurrentMood/CurrentMood";
import Footer from "./components/Footer/Footer"
import FakeLogin from "./components/FakeLogin/FakeLogin";
import "../src/index.css";

function App() {

  return (
    <BrowserRouter>
      <div className="app-container">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/feelings" element={<FeelingPage />} />
            <Route path="/HomePage" element={<HomePage />} />
            <Route path="/mood/:slug" element={<MoodDetailPage />} />
            <Route path="/SignUpPage" element={<SignUpPage />} />
            <Route path="/UserProfilePage" element={<UserProfilePage />} />
            <Route path="/CurrentMood" element={<CurrentMood />} />
            <Route path="/MoodDetail" element={<MoodDetailPage />} />
            <Route path="fakelogin" element={<FakeLogin />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;