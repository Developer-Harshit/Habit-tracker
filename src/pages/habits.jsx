import { Title } from "@solidjs/meta";
import { A } from "@solidjs/router";
import { For, Show, batch, createSignal, onMount } from "solid-js";
import { createStore } from "solid-js/store";
import Loading from "~/components/Loading";
import { removeItem } from "~/lib/utils";
import formCss from "~/css/form.module.css";
import { ColorInput, TextInput } from "~/components/Form";
export default function HabitsPage() {
  const [habits, setHabits] = createStore([]);
  const [state, setState] = createSignal("loading");
  const [showAdd, setShowAdd] = createSignal(false);
  const storeName = "habit-list-system-store";
  let worker;
  const initWorker = () => {
    worker = new Worker(new URL("../lib/worker.js", import.meta.url), { type: "module" });
    worker.onmessage = recieveWork;
  };

  const pushWork = (type, payload = null) => {
    if (!worker) return;
    worker.postMessage({ type, payload, storeName });
  };
  const recieveWork = function (e) {
    const { result, type } = e.data;

    if (type == "fetchData") {
      setHabits(result);
      console.log("my habits", result);

      setState("ready");
    }
  };

  onMount(() => {
    initWorker();
    pushWork("fetchData");
  });
  const addHabit = e => {
    e.preventDefault();
    batch(() => {
      const newHabit = {
        color: newColor(),
        name: newText(),
        completed: 0
      };
      setHabits(habits.length, newHabit);
      pushWork("add", newHabit);
      setText("");
      setColor("#ffffff");
    });
  };

  const deleteTask = idx => {
    const id = habits[idx].name;
    setHabits(t => removeItem(t, idx));
    pushWork("del", id);
  };
  const [newText, setText] = createSignal("");
  const [newColor, setColor] = createSignal("#ffffff");

  return (
    <Show when={state() == "ready"} fallback={<Loading></Loading>}>
      <Title>Habits</Title>
      <main>
        <Title>My Habits</Title>
        <h2>My Habits</h2>
        <section>
          <Show
            fallback={
              <button
                class="btn1"
                onClick={() => {
                  setShowAdd(true);
                }}
              >
                Add Habits
              </button>
            }
            when={showAdd()}
          >
            <form onSubmit={addHabit} class={formCss.form}>
              <ul>
                <TextInput
                  required={true}
                  name="Habit name"
                  value={newText}
                  setValue={setText}
                ></TextInput>
                <ColorInput
                  required={true}
                  name="Label color"
                  value={newColor}
                  setValue={setColor}
                ></ColorInput>
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

        <For each={habits}>
          {(habit, i) => (
            <div>
              <p>
                <A href={"/habits/" + habit.name}>{habit.name}</A>
              </p>
              <p>{habit.color}</p>
              <button
                onClick={() => {
                  deleteTask(i());
                }}
              >
                Delete
              </button>
            </div>
          )}
        </For>
      </main>
    </Show>
  );
}
