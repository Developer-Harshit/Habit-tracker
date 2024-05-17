import { Title } from "@solidjs/meta";

import loadingCss from "~/css/loading.module.css";
export default function Loading() {
  return (
    <main>
      <Title>Loading...</Title>
      <div class={loadingCss.col}></div>

      <ul class={loadingCss.loading}>
        <li></li>
        <li></li>
        <li></li>
      </ul>
    </main>
  );
}
