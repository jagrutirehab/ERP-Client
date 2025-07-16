let request;
let db;
let version = 1.1;
const DBName = "jagruti";
const Patients = "patients";

export const initDB = async () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DBName);

    request.onupgradeneeded = () => {
      const db = request.result;

      if (!db.objectStoreNames.contains(Patients)) {
        db.createObjectStore(Patients, { keyPath: "id" });
      }
    };

    request.onsuccess = () => {
      resolve(true);
    };

    request.onerror = () => {
      console.error("Failed to open IndexedDB");
      reject(false);
    };
  });
};

export const addData = async (storeName, data) => {
  return new Promise((resolve) => {
    request = indexedDB.open(DBName, version);
    request.onsuccess = () => {
      db = request.result;
      const tx = db.transaction(storeName, "readwrite");
      const store = tx.objectStore(storeName);
      data.forEach((d) => {
        store.add(d);
      });
      resolve(data);
    };

    request.onerror = () => {
      const error = request.error?.message;
      if (error) {
        resolve(error);
      } else {
        resolve("Unknown error");
      }
    };
  });
};

export const getStoreData = (storeName) => {
  return new Promise((resolve) => {
    request = indexedDB.open(DBName);
    request.onsuccess = () => {
      db = request.result;
      const tx = db.transaction(storeName, "readonly");
      const store = tx.objectStore(storeName);
      const res = store.getAll();
      res.onsuccess = () => {
        resolve(res.result);
      };
    };
  });
};
