import { MetaProvider, Title } from "@solidjs/meta";
import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { Suspense } from "solid-js";
import "./global.css";

export default function App() {
  return (
    <Router
      base={import.meta.env.SERVER_BASE_URL}
      root={props => (
        <MetaProvider>
          <Title>My App</Title>

          <a href="/">Index</a>
          <a href="/about">About</a>
          <a href="/task/hi">Task</a>
          <Suspense>{props.children}</Suspense>
        </MetaProvider>
      )}
    >
      <FileRoutes />
    </Router>
  );
}
