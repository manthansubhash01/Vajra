import { useState, useEffect } from "react";
import Home from "./pages/Home";

function App() {
  const [data, setData] = useState(null);

  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL || "";
    fetch(`${apiUrl}/api/health`)
      .then((res) => res.json())
      .then((data) => setData(data))
      .catch((err) => console.error("Error fetching health check:", err));
  }, []);

  return (
    <div className="w-full min-h-screen">
      <Home />
    </div>
  );
}

export default App;
