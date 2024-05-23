import { Title } from "@solidjs/meta";
import { A } from "@solidjs/router";
import { For, Show, batch, createSignal, onMount } from "solid-js";
import { createStore } from "solid-js/store";
import Loading from "~/components/Loading";
import { generateID, removeItem } from "~/lib/utils";
import formCss from "~/css/form.module.css";
import habitCss from "~/css/habit.module.css";
import { OptionsInput, TextInput } from "~/components/Form";

export default function HabitsPage() {
  const [habits, setHabits] = createStore([]);
  const [state, setState] = createSignal("loading");
  const [showAdd, setShowAdd] = createSignal(false);
  const [newText, setText] = createSignal("");
  const [newColor, setColor] = createSignal({ color: "#ffffff", name: "White" });
  const habitStoreName = "habit-list-system-store";
  let worker;
  const initWorker = () => {
    worker = new Worker(new URL("../lib/worker.js", import.meta.url), { type: "module" });
    worker.onmessage = recieveWork;
  };

  const pushWork = (storeName, type, payload = null) => {
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
    pushWork(habitStoreName, "fetchData");
  });

  const addHabit = e => {
    e.preventDefault();

    batch(() => {
      const newHabit = {
        id: generateID("habit"),
        color: newColor().color,
        name: newText(),
        completed: 0,
        failed: 0
      };
      setHabits(habits.length, newHabit);
      pushWork(habitStoreName, "add", newHabit);

      setColor({ name: "WHITE", color: "#ffffff" });
      setText("");
    });
  };

  const deleteHabit = idx => {
    if (confirm("Are you sure you want to delete this habit")) {
      const id = habits[idx].name;
      setHabits(t => removeItem(t, idx));
      pushWork(habitStoreName, "del", id);
      pushWork();
    }
  };

  return (
    <Show when={state() == "ready"} fallback={<Loading />}>
      <Title>Habits</Title>
      <main>
        <Title>My Habits</Title>

        <section class="shadow">
          <div class={formCss.popup}>
            <p>New Habit</p>
            <button
              onClick={() => {
                setShowAdd(!showAdd());
              }}
              class="material-symbols-outlined icon"
            >
              add
            </button>
            <p>Habit Count : {habits.length}</p>
          </div>
          <Show when={showAdd()}>
            <form onSubmit={addHabit} class={formCss.form}>
              <ul>
                <TextInput
                  required={true}
                  id="textinput"
                  name="Habit name"
                  value={newText}
                  setValue={setText}
                />
                <OptionsInput
                  items={[
                    { color: "#ffffff", name: "White" },
                    { color: "#2ecc71", name: "Green" }
                  ]}
                  value={newColor}
                  setValue={setColor}
                  id="colorinput"
                  name="Label color"
                />
              </ul>

              <button class="btn1">Add</button>
            </form>
          </Show>
        </section>

        <section style={habits.length == 0 ? "display:none" : "display:block"}>
          <h2>My Habits</h2>
          <ul class={habitCss.habit}>
            <For each={habits}>
              {(habit, i) => {
                return (
                  <li class={habitCss.item + " shadow"} style={`border-color:  ${habit.color}5e;`}>
                    <button
                      style={{ "background-color": habit.color }}
                      class={habitCss.ball}
                    ></button>

                    <A class={`btn1 ${habitCss.label}`} href={"/habits/" + habit.id}>
                      {habit.name}
                    </A>

                    <button
                      class={habitCss.deleteBtn + " btn1"}
                      onClick={() => {
                        deleteHabit(i());
                      }}
                    >
                      <span class="material-symbols-outlined icon"> delete </span>
                    </button>
                  </li>
                );
              }}
            </For>
          </ul>
        </section>
      </main>
    </Show>
  );
}
