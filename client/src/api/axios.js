// client/src/api/axios.js
import axios from "axios"

const api = axios.create({
  baseURL: "http://localhost:5000",
  withCredentials: true,    // ← critical for httpOnly cookies to be sent
})

export default api