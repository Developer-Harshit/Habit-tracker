import { Title } from "@solidjs/meta";
import { A, useHref, useParams } from "@solidjs/router";
import NotFound from "~/components/NotFound";
import { createSignal, batch, For, onMount, Switch, Match, createEffect, Show } from "solid-js";
import { createStore } from "solid-js/store";
import formCss from "~/css/form.module.css";
import taskCss from "~/css/task.module.css";

import Loading from "~/components/Loading";
import { day_in_ms, generateID, parseMS, removeItem } from "~/lib/utils";
import ProgressBar from "~/components/ProgressBar";
import { TextInput, NumberInput, ColorInput, Checkbox, SwitchInput } from "~/components/Form";

export default function Todo() {
  const params = useParams();
  const [ID, setID] = createSignal(params.id);
  const [storeData, setStoreData] = createSignal({});

  const [state, setState] = createSignal("loading");
  const [newText, setText] = createSignal("");
  const [newRepeat, setRepeat] = createSignal(false);
  const [newDuration, setDuration] = createSignal(1);
  const [tasks, setTasks] = createStore([]);
  const [showAdd, setShowAdd] = createSignal(false);

  createEffect(() => {
    console.log("ID CHANGED ->", params.id);
    setID(params.id);
    pushWork(ID(), "verify");
    setState("loading");
  });

  let worker;

  const pushWork = (storeName, type, payload = null) => {
    if (!worker) return;
    worker.postMessage({ type, payload, storeName });
  };
  const recieveWork = function (e) {
    // console.log("msg recieved:", e.data);
    const { result, type } = e.data;
    // console.log("work done | type->", type);
    if (type == "modifyTask") {
      setTasks(result);

      setState("ready");
    } else if (type == "verify") {
      console.log("verify,res", result);
      // do this to avoid creating non existing stores
      if (result) {
        pushWork(ID(), "modifyTask", result);
        setStoreData(result);
      } else setState("404");

      /////////////////////
    }
  };
  const initWorker = () => {
    worker = new Worker(new URL("../lib/worker.js", import.meta.url), {
      type: "module"
    });
    worker.onmessage = recieveWork;
    console.log(params.id);
    pushWork(ID(), "verify");
  };

  const addTask = e => {
    e.preventDefault();
    batch(() => {
      const date = Date.now();

      const newTask = {
        duration: newDuration() * day_in_ms,
        id: generateID("task"),
        repeat: newRepeat(),
        text: newText(),
        start: date,
        done: false
      };
      setTasks(tasks.length, newTask);
      pushWork(ID(), "add", newTask);
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
    pushWork(ID(), "up", { text, done, id, start, duration, repeat });
  };

  const deleteTask = idx => {
    const id = tasks[idx].id;
    setTasks(t => removeItem(t, idx));
    pushWork(ID(), "del", id);
  };
  onMount(() => {
    initWorker();
  });

  return (
    <Switch fallback={<Loading />}>
      <Match when={state() == "ready"}>
        <Title>Tasks</Title>
        <main id="task-app">
          <h1>{storeData().name}</h1>

          <section class="shadow">
            <div class={formCss.popup}>
              <p class="text3">Tasks done : {storeData().completed} </p>
              <button
                onClick={() => {
                  setShowAdd(!showAdd());
                }}
                class="material-symbols-outlined icon"
              >
                add
              </button>
              <p class="text3">Tasks failed : {storeData().failed} </p>
            </div>
            <Show when={showAdd()}>
              <form onSubmit={addTask} class={formCss.form} id="myform">
                <ul>
                  <TextInput
                    required={true}
                    max={50}
                    id="textinput"
                    name="Text"
                    value={newText}
                    setValue={setText}
                  />
                  <NumberInput
                    name="Duration"
                    id="timeinput"
                    value={newDuration}
                    setValue={setDuration}
                  />
                  <li>
                    <Checkbox
                      name="Repeat"
                      id="repeatinput"
                      value={newRepeat}
                      setValue={setRepeat}
                    />
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

          <section style={tasks.length == 0 ? "display:none" : "display:block"}>
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
                          id={"done" + task.id}
                          name={`${task.text}`}
                          value={taskDone}
                          setValue={setTaskDone}
                        />

                        <button class="btn1" onClick={() => deleteTask(i())}>
                          <span class="material-symbols-outlined icon"> delete </span>
                        </button>
                      </div>
                      <div class={taskCss.info}>
                        <ProgressBar bSize={barPercent} />

                        <SwitchInput
                          id={"repeat" + task.id}
                          name="Repeat"
                          value={taskRepeat}
                          setValue={setTaskRepeat}
                        />

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
        <NotFound />
      </Match>
    </Switch>
  );
}
