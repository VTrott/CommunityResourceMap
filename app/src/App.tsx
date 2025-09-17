import { Routes, Route, Link } from 'react-router-dom';
import HealthPage from './pages/Health';
export default function App() {
  return (
    <>
      <nav><Link to="/">Map</Link> | <Link to="/submit">Submit</Link> | <Link to="/admin">Admin</Link> | <Link to="/health">Health</Link></nav>
      <Routes>
        <Route path="/" element={<div>Map</div>} />
        <Route path="/submit" element={<div>Submit form</div>} />
        <Route path="/admin" element={<div>Moderation queue</div>} />
        <Route path="/health" element={<HealthPage />} />
      </Routes>
    </>
  );
}
