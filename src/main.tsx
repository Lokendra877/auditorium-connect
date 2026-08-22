import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { attachDeviceHeader } from "./lib/device-header";

attachDeviceHeader();

createRoot(document.getElementById("root")!).render(<App />);

