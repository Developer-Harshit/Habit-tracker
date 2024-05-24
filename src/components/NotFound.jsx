import { Title } from "@solidjs/meta";
import { A } from "@solidjs/router";
import { HttpStatusCode } from "@solidjs/start";

export default function NotFound() {
  return (
    <main>
      <Title>Not Found</Title>
      <HttpStatusCode code={404} />
      <h1>Page Not Found</h1>
      <p>
        Visit
        <br />
        <A href="/">HomePage</A>
        <br />
        <A href="/habits">My Habits</A>
      </p>
    </main>
  );
}
