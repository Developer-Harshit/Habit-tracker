import barCss from "~/css/bar.module.css";
export default function ProgressBar(props) {
  return (
    <div class={barCss.bar}>
      <div style={{ "--size": props.bSize }}></div>
    </div>
  );
}
