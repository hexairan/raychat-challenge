import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ClientWidget from './pages/ClientWidget';
import AgentDashboard from './pages/AgentDashboard';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/client" element={<ClientWidget />} />
        <Route path="/webapp" element={<AgentDashboard />} />
        <Route path="*" element={<Navigate to="/client" />} />
      </Routes>
    </Router>
  );
}

export default App;
