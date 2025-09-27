// src/App.js
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        {/* later add Login, Register, Search, etc. */}
      </Routes>
    </Router>
  );
}

export default App;
