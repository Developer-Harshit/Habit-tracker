import { Title } from "@solidjs/meta";
import { A, useHref, useParams } from "@solidjs/router";
import NotFound from "~/components/NotFound";
import { createSignal, batch, For, onMount, Switch, Match, createEffect, Show } from "solid-js";
import { createStore } from "solid-js/store";
import formCss from "~/css/form.module.css";
import taskCss from "~/css/task.module.css";

import Loading from "~/components/Loading";
import { generateID, parseMS, removeItem } from "~/lib/utils";
import ProgressBar from "~/components/ProgressBar";
import { TextInput, NumberInput, ColorInput, Checkbox, SwitchInput } from "~/components/Form";

export default function Todo() {
  const params = useParams();
  const [storeName, setStoreName] = createSignal(params.id);
  const [state, setState] = createSignal("loading");
  const [newText, setText] = createSignal("");
  const [newRepeat, setRepeat] = createSignal(false);
  const [newDuration, setDuration] = createSignal(1);
  const [tasks, setTasks] = createStore([]);
  const [bar, setbar] = createSignal(1);
  const [showAdd, setShowAdd] = createSignal(false);

  createEffect(() => {
    console.log("ID CHANGED ->", params.id);
    setStoreName(params.id);
    console.log(params.id);
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
      setTimeout(() => setbar(0.2), 100);
    } else if (type == "verify") {
      //   pushWork("fetchData");
      ////////////////////
      console.log("verify,res", result);
      // do this to avoid creating non existing stores
      if (result) pushWork("fetchData");
      else setState("404");

      /////////////////////
    }
  };
  const initWorker = () => {
    worker = new Worker(new URL("../lib/worker.js", import.meta.url), {
      type: "module"
    });
    worker.onmessage = recieveWork;
    console.log(params.id);
    pushWork("verify");
  };

  const addTask = e => {
    e.preventDefault();
    batch(() => {
      const date = Date.now();

      const newTask = {
        text: newText(),
        done: false,

        id: generateID(),
        start: date,
        duration: 86400000 * newDuration(),
        repeat: newRepeat()
      };
      setTasks(tasks.length, newTask);
      pushWork("add", newTask);
      setText("");
      setDuration(1);
      setRepeat(false);
      setShowAdd(false);
    });
  };
  const updateTask = (idx, prop, value) => {
    setTasks(idx, prop, value);
    JSON.parse(JSON.stringify(tasks[idx]));
    const { text, done, id, start, duration, repeat } = tasks[idx];
    pushWork("up", { text, done, id, start, duration, repeat });
  };

  const deleteTask = idx => {
    const id = tasks[idx].id;
    setTasks(t => removeItem(t, idx));
    pushWork("del", id);
  };
  onMount(() => {
    initWorker();
  });

  return (
    <Switch fallback={<Loading></Loading>}>
      <Match when={state() == "ready"}>
        <Title>Tasks</Title>
        <main id="task-app">
          <section>
            <h1>{params.id}</h1>
          </section>

          <section>
            <div class={formCss.popup}>
              <p>Tasks done : 50 </p>
              <button
                onClick={() => {
                  setShowAdd(!showAdd());
                }}
                class="material-symbols-outlined icon"
              >
                add
              </button>
              <p>Tasks failed : 50 </p>
            </div>
            <Show when={showAdd()}>
              <form onSubmit={addTask} class={formCss.form} id="myform">
                <ul>
                  <TextInput
                    required={true}
                    name="Text"
                    value={newText}
                    setValue={setText}
                  ></TextInput>
                  <NumberInput
                    name="Duration (in days)"
                    value={newDuration}
                    setValue={setDuration}
                  ></NumberInput>
                  <li>
                    <Checkbox name="Repeat" value={newRepeat} setValue={setRepeat}></Checkbox>
                  </li>
                </ul>
                <div class={formCss.btnDiv}>
                  <span>
                    <button class="btn1">Add</button>
                    <button class="btn1" type="reset">
                      Clear
                    </button>
                  </span>
                </div>
              </form>
            </Show>
          </section>

          <section>
            <h2>Todos</h2>
            <ul class={taskCss.tasks}>
              <For each={tasks}>
                {(task, i) => {
                  const taskRepeat = () => task.repeat;
                  const setTaskRepeat = value => {
                    updateTask(i(), "repeat", value);
                  };
                  const taskDone = () => task.done;
                  const setTaskDone = value => {
                    updateTask(i(), "done", value);
                  };
                  const timeLeft = parseMS(task.duration - (Date.now() - task.start));
                  const barPercent = 1 - (Date.now() - task.start) / task.duration;
                  return (
                    <li>
                      <div class={taskCss.item}>
                        <Checkbox
                          name={`${task.text}`}
                          value={taskDone}
                          setValue={setTaskDone}
                        ></Checkbox>

                        <button class="btn1" onClick={() => deleteTask(i())}>
                          <span class="material-symbols-outlined icon"> delete </span>
                        </button>
                      </div>
                      <div class={taskCss.info}>
                        <ProgressBar bSize={barPercent}></ProgressBar>

                        <SwitchInput
                          name="Repeat"
                          value={taskRepeat}
                          setValue={setTaskRepeat}
                        ></SwitchInput>

                        <span>{timeLeft} left</span>
                      </div>
                    </li>
                  );
                }}
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
