export function TextInput(props) {
  const id = props.name.replaceAll(" ", "");
  const max = 50;
  return (
    <li>
      <label htmlFor={id}>{props.name}</label>
      <input
        required={props.required}
        value={props.value()}
        onInput={e => props.setValue(e.target.value)}
        id={id}
        maxlength={50}
      />
      <span>
        {props.value().length}/{max}
      </span>
    </li>
  );
}

export function NumberInput(props) {
  const id = props.name.replaceAll(" ", "");
  return (
    <li>
      <label htmlFor={id}>{props.name}</label>
      <input
        type="number"
        required={props.required}
        value={props.value()}
        onInput={e => props.setValue(e.target.value)}
        id={id}
        min="1"
      />
      <span>days</span>
    </li>
  );
}

export function ColorInput(props) {
  const id = props.name.replaceAll(" ", "");
  return (
    <li>
      <label htmlFor={id}>{props.name}</label>
      <input
        onInput={e => props.setValue(e.target.value)}
        required={props.required}
        value={props.value()}
        type="color"
        id={id}
      />
      <input type="text" value={props.value()} onInput={e => props.setValue(e.target.value)} />
    </li>
  );
}

export function Checkbox(props) {
  const id = props.name.replaceAll(" ", "");
  return (
    <>
      <input
        required={props.required}
        type="checkbox"
        checked={props.value()}
        onChange={e => props.setValue(e.target.checked)}
        id={id}
      />
      <label style="display:inline;margin-left:8px" htmlFor={id}>
        {props.name}
      </label>
    </>
  );
}

export function SwitchInput(props) {
  return (
    <span class="tickInput">
      <label style={{ display: "inline", "margin-right": " 8px" }}>{props.name}</label>
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
