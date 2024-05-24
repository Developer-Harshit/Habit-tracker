import { isValidHex } from "~/lib/utils";
import optionCss from "~/css/option.module.css";
import { Show, createSignal } from "solid-js";
export function TextInput(props) {
  return (
    <li>
      <label htmlFor={props.id}>{props.name}</label>
      <input
        required={props.required}
        value={props.value()}
        onInput={e => props.setValue(e.target.value)}
        id={props.id}
        maxlength={props.max}
      />
      <span class="text4">
        {props.value().length}/{props.max}
      </span>
    </li>
  );
}

export function NumberInput(props) {
  return (
    <li>
      <label htmlFor={props.id}>{props.name}</label>
      <input
        type="number"
        required={props.required}
        value={props.value()}
        onInput={e => props.setValue(e.target.value)}
        id={props.id}
        min={1}
      />
      <span class="text4">days</span>
    </li>
  );
}

export function OptionsInput(props) {
  const [isVisible, setVisible] = createSignal(false);

  return (
    <li>
      <label htmlFor={props.id}>{props.name}</label>
      <input
        type="text"
        style={"display:none"}
        id={props.id}
        value={props.value().color ? props.value().color : ""}
      />
      <div class={optionCss.colorSelect}>
        <span onClick={() => setVisible(!isVisible())}>
          {props.value().name}
          <span style={{ "background-color": props.value().color }}></span>
        </span>
        <Show when={isVisible()}>
          <ul>
            <For each={props.items}>
              {(item, i) => (
                <li
                  style={{ "background-color": item.color }}
                  onClick={e => {
                    props.setValue(item);
                    setVisible(false);
                  }}
                >
                  <span>{item.name}</span>
                </li>
              )}
            </For>
          </ul>
        </Show>
      </div>
    </li>
  );
}

export function ColorInput(props) {
  return (
    <li>
      <label htmlFor={props.id}>{props.name}</label>
      <input
        onInput={e => {
          console.log(e);
          props.setValue(e.target.value);
        }}
        required={props.required}
        value={props.value()}
        type="color"
        id={props.id}
      />
      <input
        type="text"
        required
        value={props.value()}
        onChange={e => {
          let val = e.target.value;
          if (!isValidHex(val)) val = "";
          props.setValue(val);
        }}
      />
    </li>
  );
}

export function Checkbox(props) {
  return (
    <>
      <input
        required={props.required}
        type="checkbox"
        checked={props.value()}
        onChange={e => props.setValue(e.target.checked)}
        id={props.id}
      />
      <label style="display:inline;margin-left:8px" htmlFor={props.id}>
        {props.name}
      </label>
    </>
  );
}

export function SwitchInput(props) {
  return (
    <span class="tickInput">
      <label htmlFor={props.id} style={{ display: "inline", "margin-right": " 8px" }}>
        {props.name}
      </label>

      <input type="text" style={"display:none"} id={props.id} value={props.value()} />
      <span>
        <button
          classList={{ active: props.value(), btn3: true }}
          onClick={() => props.setValue(true)}
          type="button"
        >
          on
        </button>
        <button
          classList={{ active: !props.value(), btn3: true }}
          onClick={() => props.setValue(false)}
          type="button"
        >
          off
        </button>
      </span>
    </span>
  );
}
