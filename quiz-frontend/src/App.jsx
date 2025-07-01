import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import QuizPage from './pages/QuizPage';
import History from './pages/History';
import LeaderboardPage from './pages/Leaderboard';
import AdminQuestionManager from './pages/AdminQuestionManager';
import ContributeQuestion from './pages/ContributeQuestion';
import Practice from './pages/Practice';
import PendingQuestionsPage from './pages/PendingQuestionsPage';


function App() {
  return (
    <Router>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/login' element={<Login />} />
        <Route path='/register' element={<Register />} />
        <Route path="/contribute" element={<ContributeQuestion />} />

        {/* Protected Routes */}
        <Route
          path='/dashboard'
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path='/quiz/:category'
          element={
            <ProtectedRoute>
              <QuizPage />
            </ProtectedRoute>
          }
        />
        <Route
          path='/practice/:category' // ✅ added Practice route
          element={
            <ProtectedRoute>
              <Practice />
            </ProtectedRoute>
          }
        />
        <Route
          path='/history'
          element={
            <ProtectedRoute>
              <History />
            </ProtectedRoute>
          }
        />
        <Route
          path='/leaderboard'
          element={
            <ProtectedRoute>
              <LeaderboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path='/admin'
          element={
            <ProtectedRoute>
              <AdminQuestionManager />
            </ProtectedRoute>
          }
        />
        <Route
          path="/pending-questions"
          element={
            <ProtectedRoute>
              <PendingQuestionsPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
