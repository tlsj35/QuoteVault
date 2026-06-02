import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Quotes from "./pages/Quotes";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/quotes" element={<Quotes />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;