import { Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import BarberDashboard from './pages/BarberDashboard';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route
        path="/barber"
        element={
          <ProtectedRoute roles={['barber']}>
            <BarberDashboard />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
