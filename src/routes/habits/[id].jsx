import { Title } from "@solidjs/meta";
import { useParams } from "@solidjs/router";
import NotFound from "~/components/NotFound";
import { createSignal, batch, For, onMount, Switch, Match, createEffect } from "solid-js";
import { createStore } from "solid-js/store";
import formCss from "../../css/form.module.css";
import taskCss from "../../css/task.module.css";
import Loading from "~/components/Loading";

function removeItem(array, index) {
  return [...array.slice(0, index), ...array.slice(index + 1)];
}

export default function Habit() {
  const params = useParams();

  const [storeName, setStoreName] = createSignal(params.id);

  const [state, setState] = createSignal("loading");
  const [newText, setText] = createSignal("");
  const [newRepeat, setRepeat] = createSignal(false);
  const [newDuration, setDuration] = createSignal(1);
  const [tasks, setTasks] = createStore([]);

  createEffect(() => {
    console.log("ID CHANGED ->", params.id);
    setStoreName(params.id);
    pushWork("verify");
    setState("loading");
  });

  let worker;

  const pushWork = (type, payload = null) => {
    if (!worker) return;
    worker.postMessage({ type, payload, storeName: storeName() });
  };
  const recieveWork = function (e) {
    // console.log("msg recieved:", e.data);
    const { result, type } = e.data;
    // console.log("work done | type->", type);
    if (type == "fetchData") {
      setTasks(result);
      setState("ready");
    } else if (type == "verify") {
      pushWork("fetchData");
      ////////////////////
      /**
       // do this to avoid creating non existing stores
      if (result) pushWork("fetchData");
      else setState("404");
      */
      /////////////////////
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
    setTimeout(() => {}, 1000);
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
    setTasks(idx, "done", value);
    JSON.parse(JSON.stringify(tasks[idx]));
    const { text, done, id, start, duration, repeat } = tasks[idx];
    pushWork("up", { text, done, id, start, duration, repeat });
  };
  const deleteTask = idx => {
    const id = tasks[idx].id;
    setTasks(t => removeItem(t, idx));
    pushWork("del", id);
  };

  return (
    <Switch fallback={<Loading></Loading>}>
      <Match when={state() == "ready"}>
        <Title>Tasks</Title>
        <main id="task-app">
          <section>
            <div id="heading">
              <h1>{params.id}</h1>
              <div class="progress">
                <div>{params.id}</div>
              </div>
            </div>
          </section>

          <section class={formCss.formSecr}>
            <button>
              <span class="material-symbols-outlined icon"> add </span>
              Add Tasks
            </button>

            <aside>
              <form onSubmit={addTask} class={formCss.form}>
                <div class={formCss.formWrapper}>
                  <ul>
                    <li>
                      <label htmlFor="textInput">text</label>
                      <input
                        placeholder="enter todo and click +"
                        required
                        value={newText()}
                        onInput={e => setText(e.currentTarget.value)}
                        id="textInput"
                      />
                    </li>
                    <li>
                      <label htmlFor="durationInput">duration</label>
                      <input
                        type="number"
                        id="durationInput"
                        value={newDuration()}
                        onInput={e => {
                          setDuration(+e.currentTarget.value);
                        }}
                      />
                    </li>
                    <li>
                      <label htmlFor="repeatCheckbox">repeat</label>
                      <input
                        value={newRepeat()}
                        onChange={e => setRepeat(e.currentTarget.checked)}
                        id="repeatCheckbox"
                        type="checkbox"
                      />
                    </li>
                  </ul>
                  <div class={formCss.btnDiv}>
                    <button>
                      <span class="material-symbols-outlined icon"> check </span>
                    </button>
                    <button type="reset">
                      <span class="material-symbols-outlined icon"> close </span>
                    </button>
                  </div>
                </div>
              </form>
            </aside>
          </section>

          <section>
            <ul class={taskCss.tasks}>
              <For each={tasks}>
                {(task, i) => (
                  <li>
                    <div class={taskCss.item}>
                      <input
                        type="checkbox"
                        checked={task.done}
                        onChange={e => toggleTask(i(), e.currentTarget.checked)}
                        name={`${task.text}taskdone`}
                      />

                      <span>{task.text}</span>
                      <button onClick={() => deleteTask(i())}>
                        <span class="material-symbols-outlined icon"> delete </span>
                      </button>
                    </div>
                    <div class={taskCss.info}>
                      <div></div>
                      <span>
                        Repeat <button>on</button>
                      </span>
                      <span>2min left</span>
                    </div>
                  </li>
                )}
              </For>
            </ul>
          </section>
        </main>
      </Match>
      <Match when={state() == "404"}>
        <NotFound></NotFound>
      </Match>
    </Switch>
  );
}
