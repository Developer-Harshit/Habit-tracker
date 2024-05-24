const indexedDB =
  self.indexedDB ||
  self.mozIndexedDB ||
  self.webkitIndexedDB ||
  self.msIndexedDB ||
  self.shimIndexedDB;

const dbName = "habit-tracker-system-db";
const habitsList = "habit-list-system-store";

function upgradeDB() {
  let db = this.result; //let Db = e.target.result;

  if (!db.objectStoreNames.contains(habitsList))
    db.createObjectStore(habitsList, { keyPath: "id" });

  if (!db.objectStoreNames.contains(this.storeName))
    db.createObjectStore(this.storeName, { keyPath: "id" });
}

function verifyStore(storeName, resolve, onerror) {
  _connectDB(
    habitsList,
    function (store) {
      let rows = [];
      if (store.getAll) {
        let req = store.getAll();
        req.onerror = onerror;
        req.onsuccess = function () {
          const myStore = this.result.find(obj => obj.id == storeName);
          console.log(this.result);
          resolve(myStore);
        };
      } else {
        let req = store.openCursor();
        req.onerror = onerror;
        req.onsuccess = function (e) {
          let cursor = e.target.result;
          if (cursor) {
            rows.push(cursor.value);
            cursor.continue();
          } else {
            const myStore = rows.find(obj => obj.id == storeName);
            resolve(myStore);
          }
        };
      }
    },
    onerror
  );
}

function _connectDB(storeName, callback, onerror, txMode = "readwrite", shouldDelete = false) {
  let request = indexedDB.open(dbName);
  request.storeName = storeName;
  request.onerror = onerror;
  request.onupgradeneeded = upgradeDB;
  if (shouldDelete) {
    request.onsuccess = function (e) {
      console.log("shoudldDEL", shouldDelete);
      let db = this.result;
      const newVersion = db.version + 1;
      if (!db.objectStoreNames.contains(storeName)) {
        console.log("does nor contain");
        db.close();
        return;
      }
      db.close();

      let newReq = indexedDB.open(dbName, newVersion);
      newReq.storeName = storeName;
      newReq.onerror = onerror;

      console.log("deleting obs", storeName, db.objectStoreNames);
      newReq.onupgradeneeded = function () {
        let newDB = this.result;
        newDB.deleteObjectStore(storeName);

        callback(true);
      };
      newReq.onsuccess = function () {
        let newDB = this.result;
        newDB.close();
      };
    };
    return;
  }
  request.onsuccess = function (e) {
    let db = this.result;
    if (!db.objectStoreNames.contains(storeName)) {
      const newVersion = db.version + 1;
      db.close();

      let newReq = indexedDB.open(dbName, newVersion);

      newReq.storeName = storeName;
      newReq.onerror = onerror;
      newReq.onupgradeneeded = upgradeDB;

      newReq.onsuccess = function () {
        let newDB = newReq.result;
        let tx = newDB.transaction(storeName, txMode);
        let store = tx.objectStore(storeName);
        callback(store);
        tx.oncomplete = function () {
          newDB.close();
        };
      };
      return;
    }

    let tx = db.transaction(storeName, txMode);
    let store = tx.objectStore(storeName);
    callback(store);
    tx.oncomplete = function () {
      db.close();
    };
  };
}

function put(obj, storeName, onsucess, onerror) {
  _connectDB(
    storeName,
    function (store) {
      let request = store.put(obj);
      request.onerror = onerror;
      request.onsuccess = onsucess;
    },
    onerror
  );
}

function add(obj, storeName, onsucess, onerror) {
  _connectDB(
    storeName,
    function (store) {
      let request = store.add(obj);
      request.onerror = onerror;
      request.onsuccess = onsucess;
    },
    onerror
  );
}

function del(id, storeName, onsucess, onerror) {
  _connectDB(
    storeName,
    function (store) {
      let request = store.delete(id);
      request.onerror = onerror;
      request.onsuccess = onsucess;
    },
    onerror
  );
}

function get(id, storeName, onsuccess, onerror) {
  _connectDB(
    storeName,
    function (store) {
      let request = store.get(id);
      request.onerror = onerror;
      request.onsuccess = onsuccess;
    },
    onerror
  );
}

function getAll(storeName, resolve, onerror) {
  _connectDB(
    storeName,
    function (store) {
      let rows = [];
      if (store.getAll) {
        let req = store.getAll();
        req.onerror = onerror;
        req.onsuccess = function () {
          resolve(this.result);
        };
      } else {
        let req = store.openCursor();
        req.onerror = onerror;
        req.onsuccess = function (e) {
          let cursor = e.target.result;
          if (cursor) {
            rows.push(cursor.value);
            cursor.continue();
          } else resolve(rows);
        };
      }
    },
    onerror
  );
}

function delStore(storeName, resolve, onerror) {
  _connectDB(storeName, resolve, onerror, "readwrite", true);
}

export { add, del, put, get, getAll, verifyStore, delStore };
