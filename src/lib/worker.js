import { add, del, get, getAll, verifyStore, put as up, delStore } from "./db";

onmessage = function (e) {
  // add data
  //   test();
  const { type, payload, storeName } = e.data;

  new Promise((resolve, reject) => {
    const onerror = function (e) {
      console.log("IDBErrorFound");
      console.log(e.target);
      reject(e.target.error);
    };
    const onsucess = function () {
      resolve(this.result);
    };
    switch (type) {
      case "add":
        add(payload, storeName, onsucess, onerror);
        break;
      case "del":
        del(payload, storeName, onsucess, onerror);
        break;
      case "up":
        up(payload, storeName, onsucess, onerror);
        break;
      case "get":
        get(payload, storeName, onsucess, onerror);
      case "verify":
        verifyStore(storeName, resolve, onerror);
        break;
      case "fetchData":
        getAll(storeName, resolve, onerror);
        break;
      case "delStore":
        delStore(storeName, resolve, onerror);
        pass;
      case "modifyTask":
        getAll(storeName, resolve, onerror);
        break;
    }
  })

    .then(value => {
      if (type == "modifyTask") {
        console.log(type, "Type");
        const timeNow = Date.now();
        const _func = () => {};
        let isModified = false;

        for (let i = value.length - 1; i > -1; i--) {
          const task = value[i];
          const timeLeft = task.duration - (timeNow - task.start);
          if (timeLeft > 0) continue;
          console.log("Time", timeLeft);

          if (task.done) payload.completed += 1;
          else payload.failed += 1;
          isModified = true;
          if (!task.repeat) {
            value.splice(i, 1);
            del(task.id, storeName, _func, _func);

            continue;
          }
          task.done = false;
          task.start = timeNow;
          up(task, storeName, _func, _func);
        }

        const habitsList = "habit-list-system-store";
        if (isModified) up(payload, habitsList, _func, _func);
      }
      postMessage({ type, result: value, storeName });
    })
    .catch(err => {
      postMessage(err);
    });
};
