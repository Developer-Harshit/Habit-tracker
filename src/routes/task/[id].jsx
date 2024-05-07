import { Title } from "@solidjs/meta";
import { Navigate, redirect, useNavigate, useParams } from "@solidjs/router";

import NotFound from "~/components/NotFound";
import { createSignal, batch, For, onMount, Switch, Match, Show } from "solid-js";

import { createStore } from "solid-js/store";

function removeItem(array, index) {
  return [...array.slice(0, index), ...array.slice(index + 1)];
}

export default function Task() {
  const params = useParams();
  const storeName = params.id;

  const [state, setState] = createSignal("loading");
  const [newText, setText] = createSignal("");
  const [newRepeat, setRepeat] = createSignal(false);
  const [newDuration, setDuration] = createSignal(1);
  const [tasks, setTasks] = createStore([]);

  let worker;

  const pushWork = (type, payload = null) => {
    if (!worker) return;
    worker.postMessage({ type, payload, storeName });
  };
  const recieveWork = function (e) {
    console.log("msg recieved:", e.data);
    const { result, type } = e.data;
    console.log("work done | type->", type);
    if (type == "fetchData") {
      setTasks(result);
      setState("ready");
    } else if (type == "verify") {
      if (result) pushWork("fetchData");
      else setState("404");
    }
  };
  const initWorker = () => {
    worker = new Worker(new URL("../../lib/worker.js", import.meta.url), {
      type: "module"
    });
    worker.onmessage = recieveWork;
    pushWork("verify");
  };

  onMount(() => {
    initWorker();
  });

  const addTask = e => {
    e.preventDefault();
    batch(() => {
      const date = new Date();
      date.setHours(0, 0, 0, 0);
      const newTask = {
        text: newText(),
        done: false,

        id: Math.floor(Math.random() * Number.MAX_SAFE_INTEGER),
        start: date[Symbol.toPrimitive]("number"),
        duration: 86400000 * newDuration(),
        repeat: newRepeat()
      };
      setTasks(tasks.length, newTask);
      pushWork("add", newTask);
      setText("");
      setDuration(1);
      setRepeat(false);
    });
  };
  const toggleTask = (idx, value) => {
    console.log("toggling");
    setTasks(idx, "done", value);
    JSON.parse(JSON.stringify(tasks[idx]));
    const { text, done, id, start, duration, repeat } = tasks[idx];
    pushWork("up", { text, done, id, start, duration, repeat });
  };
  const deleteTask = idx => {
    console.log("deleting");
    const id = tasks[idx].id;
    setTasks(t => removeItem(t, idx));
    pushWork("del", id);
  };

  return (
    <Switch fallback={<div>Loading..........</div>}>
      <Match when={state() == "ready"}>
        <div>
          <Title>Tasks </Title>
          <h2>ID : {params.id}</h2>
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

                <button onClick={() => deleteTask(i())}>x</button>
              </div>
            )}
          </For>
        </div>
      </Match>
      <Match when={state() == "404"}>
        <NotFound></NotFound>
      </Match>
    </Switch>
  );
}
