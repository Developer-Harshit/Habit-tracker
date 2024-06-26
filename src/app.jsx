import { MetaProvider, Title, Link } from "@solidjs/meta";
import { A, Router, Route } from "@solidjs/router";
import { Suspense, lazy } from "solid-js";
import Habits from "~/pages/habits.jsx";
import Todos from "~/pages/todos.jsx";
import Home from "~/pages/home.jsx";
import fourOfour from "~/pages/404.jsx";
import navClasses from "~/css/nav.module.css";
import "./css/globals/base.css";
import "./css/globals/btn.css";
import "./css/globals/fonts.css";
import "./css/globals/scroll.css";

const routerRoot = props => (
  <MetaProvider>
    <Title>Habit Tracker</Title>

    <Suspense>
      <header>
        <nav class={navClasses.navBar}>
          <div class={navClasses.navWrapper}>
            <div class={navClasses.logo}>
              <A href="/" class="btn2">
                <span class="material-symbols-outlined icon"> spa </span>
                Logo
              </A>
            </div>

            <ul class={navClasses.menu}>
              <li>
                <A class="btn2" href="/">
                  Home
                </A>
              </li>
              <li>
                <A class="btn2" href="/habits">
                  My Habits
                </A>
              </li>
            </ul>
          </div>
        </nav>
      </header>
      {props.children}
      <footer>
        Website developed by
        <a class="btn2" href="/">
          Harshit
        </a>
      </footer>
    </Suspense>
  </MetaProvider>
);

export default function App() {
  return (
    <Router root={routerRoot}>
      <Route path="/" component={Home}></Route>
      <Route path="/habits" component={Habits}></Route>
      <Route path="/habits/:id" component={Todos}></Route>
      <Route path="/*404" component={fourOfour}></Route>
    </Router>
  );
}
