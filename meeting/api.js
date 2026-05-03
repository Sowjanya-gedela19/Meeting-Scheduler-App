import axios from "axios";

console.log("API BASE URL:", "http://localhost:5000/api");

export const api = axios.create({
    baseURL: "http://localhost:5000/api",
});