import { createRoot } from "react-dom/client";
import { Provider } from "./contexto/ContextoApp";
import App from "./App";
import "./estilos/index.css";

createRoot(document.getElementById("root")!).render(
  <Provider>
    <App />
  </Provider>,
);
