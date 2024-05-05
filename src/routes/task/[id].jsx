import { Title } from "@solidjs/meta";
import { useParams } from "@solidjs/router";

import { createSignal, batch, For } from "solid-js";

import { createStore } from "solid-js/store";

function removeItem(array, index) {
  return [...array.slice(0, index), ...array.slice(index + 1)];
}

export default function Task() {
  const params = useParams();
  const [newText, setText] = createSignal("");
  const [newRepeat, setRepeat] = createSignal(false);
  const [newDuration, setDuration] = createSignal(1);
  const [tasks, setTasks] = createStore([]);

  const addTask = e => {
    e.preventDefault();
    batch(() => {
      const date = new Date();
      date.setHours(0, 0, 0, 0);
      setTasks(tasks.length, {
        text: newText(),
        done: false,

        start: date[Symbol.toPrimitive]("number"),
        duration: 86400000 * newDuration(),
        repeat: newRepeat()
      });
      setText("");
      setDuration(1);
      setRepeat(false);
    });
  };
  const toggleTask = (idx, value) => {
    setTasks(idx, "done", value);
  };

  return (
    <div>
      <Title>Tasks </Title>
      <h3>Simple Todos Example</h3>
      <form onSubmit={addTask}>
        <div>
          <label htmlFor="textInput">text</label>
          <input
            placeholder="enter todo and click +"
            required
            value={newText()}
            onInput={e => setText(e.currentTarget.value)}
            id="textInput"
          />
        </div>
        <div>
          <label htmlFor="durationInput">duration</label>
          <input
            type="number"
            id="durationInput"
            value={newDuration()}
            onInput={e => {
              console.log(typeof +e.currentTarget.value);

              setDuration(+e.currentTarget.value);
            }}
          />
        </div>

        <div>
          <label htmlFor="repeatCheckbox">repeat</label>
          <input
            value={newRepeat()}
            onChange={e => setRepeat(e.currentTarget.checked)}
            id="repeatCheckbox"
            type="checkbox"
          />
        </div>
        <button>+</button>
      </form>
      <For each={tasks}>
        {(task, i) => (
          <div>
            <input
              type="checkbox"
              checked={task.done}
              onChange={e => toggleTask(i(), e.currentTarget.checked)}
              name="taskdone"
            />
            <span>{task.text}</span>

            <button onClick={() => setTasks(t => removeItem(t, i()))}>x</button>
          </div>
        )}
      </For>
    </div>
  );
}
