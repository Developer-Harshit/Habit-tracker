import { MetaProvider, Title } from "@solidjs/meta";
import { A, Router, Route } from "@solidjs/router";
import { Suspense, lazy } from "solid-js";
import navClasses from "./css/nav.module.css";
import "./global.css";

// Route Componemts

const routes = [
  {
    path: "/",
    component: lazy(() => import("./routes/index.jsx"))
  },
  {
    path: "/about",
    component: lazy(() => import("./routes/about.jsx"))
  },
  {
    path: "tasks",
    component: lazy(() => import("./routes/habits/index.jsx")),
    children: [
      {
        path: "tasks/:id",
        component: lazy(() => import("./routes/habits/[id].jsx"))
      }
    ]
  },
  {
    path: "/*404",
    component: lazy(() => import("./routes/[...404].jsx"))
  }
];
import Habits from "./routes/habits/index.jsx";
import Habit from "./routes/habits/[id].jsx";
import Home from "./routes/index.jsx";
import About from "./routes/about.jsx";
import fourOfour from "./routes/[...404].jsx";
const routerRoot = props => (
  <MetaProvider>
    <Title>My App</Title>
    <header>
      <nav class={navClasses.navBar}>
        <div class={navClasses.navWrapper}>
          <div class={navClasses.logo}>
            <A href="/">
              <span class="material-symbols-outlined icon"> spa </span>
              Logo
            </A>
          </div>

          <ul class={navClasses.menu}>
            <li>
              <A href="/">Home</A>
            </li>
            <li>
              <A href="/">About.me</A>
            </li>
          </ul>
        </div>
      </nav>
    </header>
    <Suspense>{props.children}</Suspense>
    <footer>
      Website developed by
      <a href="/"> Harshit </a>
    </footer>
  </MetaProvider>
);

export default function App() {
  return (
    <Router root={routerRoot}>
      <Route path="/" component={Home}></Route>
      <Route path="/about" component={About}></Route>
      <Route path="/habits" component={Habits}></Route>
      <Route path="/habits/:id" component={Habit}></Route>
      <Route path="/*404" component={fourOfour}></Route>
    </Router>
  );
}
