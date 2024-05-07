const indexedDB =
  self.indexedDB ||
  self.mozIndexedDB ||
  self.webkitIndexedDB ||
  self.msIndexedDB ||
  self.shimIndexedDB;

const dbName = "habit-tracker";
const habitsList = "HabitsList";

function upgradeDB() {
  let db = this.result; //let Db = e.target.result;

  if (!db.objectStoreNames.contains(habitsList)) {
    db.createObjectStore(habitsList, { keyPath: "name" });
  }
  if (!db.objectStoreNames.contains(this.storeName)) {
    console.log("calling upgrade");
    db.createObjectStore(this.storeName, { keyPath: "id" });
  }
}

function verifyStore(storeName, resolve, onerror) {
  let request = indexedDB.open(dbName);
  request.storeName = habitsList;
  request.onerror = onerror;
  /////////////////////////////////////////
  request.onsuccess = function (e) {
    let db = this.result;
    const doesStoreExit = storeName === habitsList || !db.objectStoreNames.contains(storeName);
    if (doesStoreExit) resolve(false);
    else resolve(true);
    db.close();
  };
  /////////////////////////////////////////
}
function _connectDB(storeName, callback, onerror, txMode = "readwrite") {
  /////////////////////////////////////////
  let request = indexedDB.open(dbName);
  request.storeName = storeName;
  request.onerror = onerror;
  request.onupgradeneeded = upgradeDB;
  /////////////////////////////////////////

  /////////////////////////////////////////
  request.onsuccess = function (e) {
    let db = this.result;
    if (!db.objectStoreNames.contains(storeName)) {
      const newVersion = db.version + 1;
      db.close();

      let newReq = indexedDB.open(dbName, newVersion);
      newReq.storeName = storeName;
      newReq.onerror = onerror;
      newReq.onupgradeneeded = upgradeDB;

      /////////////////////////////////////////
      newReq.onsuccess = function () {
        let db = newReq.result;
        let tx = db.transaction(storeName, txMode);
        let store = tx.objectStore(storeName);
        callback(store);
        tx.oncomplete = function () {
          db.close();
        };
      };
      /////////////////////////////////////////

      return;
    }
    /////////////////////////////////////////
    let tx = db.transaction(storeName, txMode);
    let store = tx.objectStore(storeName);
    callback(store);
    tx.oncomplete = function () {
      db.close();
    };
    /////////////////////////////////////////
  };
  /////////////////////////////////////////
}

function put(obj, storeName, onsucess, onerror) {
  _connectDB(
    storeName,
    function (store) {
      /////////////////////////////////////////
      let request = store.put(obj);
      request.onerror = onerror;
      request.onsuccess = onsucess;
      /////////////////////////////////////////
    },
    onerror
  );
}

function add(obj, storeName, onsucess, onerror) {
  _connectDB(
    storeName,
    function (store) {
      /////////////////////////////////////////
      let request = store.add(obj);
      request.onerror = onerror;
      request.onsuccess = onsucess;
      /////////////////////////////////////////
    },
    onerror
  );
}

function del(id, storeName, onsucess, onerror) {
  _connectDB(
    storeName,
    function (store) {
      /////////////////////////////////////////
      let request = store.delete(id);
      request.onerror = onerror;
      request.onsuccess = onsucess;
      /////////////////////////////////////////
    },
    onerror
  );
}

function get(id, storeName, onsuccess, onerror) {
  _connectDB(
    storeName,
    function (store) {
      /////////////////////////////////////////
      let request = store.get(id);
      request.onerror = onerror;
      request.onsuccess = onsuccess;
      /////////////////////////////////////////
    },
    onerror
  );
}

function getAll(storeName, resolve, onerror) {
  _connectDB(
    storeName,
    function (store) {
      /////////////////////////////////////////
      let rows = [];
      if (store.getAll) {
        /////////////////////////////////////////
        let req = store.getAll();
        req.onerror = onerror;
        req.onsuccess = function () {
          resolve(this.result);
        };
        /////////////////////////////////////////
      } else {
        /////////////////////////////////////////
        let req = store.openCursor();
        req.onerror = onerror;
        req.onsuccess = function (e) {
          let cursor = e.target.result;
          if (cursor) {
            rows.push(cursor.value);
            cursor.continue();
          } else resolve(rows);
        };
        /////////////////////////////////////////
      }
      /////////////////////////////////////////
    },
    onerror
  );
}

export { add, del, put, get, getAll, verifyStore };
