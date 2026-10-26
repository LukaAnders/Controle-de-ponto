import { createRoot } from "react-dom/client";
import { Provider } from "./context/AppContext";
import App from "./App";
import "./styles/index.css";

createRoot(document.getElementById("root")!).render(
  <Provider>
    <App />
  </Provider>,
);
