import { add, del, get, getAll, verifyStore, put } from "./db";

onmessage = function (e) {
  // add data
  //   test();
  const { type, payload, storeName } = e.data;
  console.log("mystorename->", storeName);

  new Promise((resolve, reject) => {
    const onerror = function (e) {
      console.log("IDBErrorFound");
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
        put(payload, storeName, onsucess, onerror);
        break;
      case "get":
        get(payload, storeName, onsucess, onerror);
      case "verify":
        verifyStore(storeName, resolve, onerror);
        break;
      case "fetchData":
        console.log("calling getAll");
        getAll(storeName, resolve, onerror);
        break;
    }
  })

    .then(value => {
      postMessage({ type, result: value });
    })
    .catch(err => {
      postMessage(err);
    });
};
