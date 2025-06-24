let request; //: IDBOpenDBRequest;
let db; //: IDBDatabase;
let version = 1.1;
const DBName = "jagruti";

// export interface patient {
//   _id: string;
//   id: { prefix: string; value: number };
//   name: string;
//   gender: string;
//   center: any;
// }

// export enum Stores {
//   Patients = "patients",
// }
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
      const db = request.result;

      resolve(true); // Resolve with true on success
    };

    request.onerror = () => {
      console.error("Failed to open IndexedDB");
      reject(false); // Reject with false on error
    };
  });
};

export const addData = async (storeName, data) => {
  return new Promise((resolve) => {
    request = indexedDB.open(DBName, version);

    request.onsuccess = () => {
      console.log("request.onsuccess - addData", data);
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
      console.log("request.onsuccess - getAllData");
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
