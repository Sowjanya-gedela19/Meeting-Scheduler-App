import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { SettingsProvider } from "./context/SettingsContext";
import { MeetingsProvider } from "./context/MeetingsContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";
import Home from "./components/Home";
import Login from "./components/login";
import Signup from "./components/Signup";
import Dashboard from "./components/Dashboard";
import CreateMeeting from "./components/CreateMeeting";
import EditMeeting from "./components/EditMeeting";
import MeetingsList from "./components/MeetingsList";
import MeetingDetail from "./components/MeetingDetail";
import MeetingRoom from "./components/MeetingRoom";
import JoinMeeting from "./components/JoinMeeting";
import Availability from "./components/Availability";
import Reminders from "./components/Reminders";
import CalendarView from "./components/CalendarView";
import SettingsPage from "./components/SettingsPage";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SettingsProvider>
          <MeetingsProvider>
            <div className="app-shell">
              <Routes>
                <Route path="/room/:code" element={<MeetingRoom />} />
                <Route path="/join" element={<JoinMeeting />} />
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route element={<ProtectedRoute />}>
                  <Route element={<Layout />}>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/meetings" element={<MeetingsList />} />
                    <Route path="/meetings/new" element={<CreateMeeting />} />
                    <Route path="/meetings/:id/edit" element={<EditMeeting />} />
                    <Route path="/meetings/:id" element={<MeetingDetail />} />
                    <Route path="/availability" element={<Availability />} />
                    <Route path="/reminders" element={<Reminders />} />
                    <Route path="/calendar" element={<CalendarView />} />
                    <Route path="/settings" element={<SettingsPage />} />
                  </Route>
                </Route>
              </Routes>
            </div>
          </MeetingsProvider>
        </SettingsProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
