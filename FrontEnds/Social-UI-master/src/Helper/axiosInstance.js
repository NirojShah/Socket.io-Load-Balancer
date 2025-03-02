import axios from "axios"

const axiosInstance = axios.create({
    baseURL: "http://localhost/app/v1"
})

export default axiosInstance