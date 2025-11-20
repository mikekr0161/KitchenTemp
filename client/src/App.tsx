import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import PrivateRoute from './components/PrivateRoute';
import Checklists from './pages/Checklists';
import TemperatureLogs from './pages/TemperatureLogs';
import Waste from './pages/Waste';
import Menu from './pages/Menu';
import Shifts from './pages/Shifts';
import Training from './pages/Training';
import Leaderboard from './pages/Leaderboard';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<PrivateRoute />}>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="/checklists" element={<Checklists />} />
            <Route path="/temperature" element={<TemperatureLogs />} />
            <Route path="/waste" element={<Waste />} />
            <Route path="/menu" element={<Menu />} />
            <Route path="/shifts" element={<Shifts />} />
            <Route path="/training" element={<Training />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
