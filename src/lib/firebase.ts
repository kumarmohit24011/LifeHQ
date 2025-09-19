import { initializeApp } from 'firebase/app';
import { getDatabase } from "firebase/database";
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  "projectId": "studio-123290234-d421b",
  "appId": "1:641136013922:web:5d34f38dd3e1d3aeb3973b",
  "apiKey": "AIzaSyBLQs11IWwXZirLV-eLhGwIIM9wvyvsrnw",
  "authDomain": "studio-123290234-d421b.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "641136013922",
  "databaseURL": "https://studio-123290234-d421b-default-rtdb.firebaseio.com"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
export const auth = getAuth(app);