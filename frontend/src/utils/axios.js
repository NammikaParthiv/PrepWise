import axios from "axios";

const instance = axios.create({
    //baseURL: 'http://localhost:2222',
    baseURL: import.meta.env.VITE_BACKEND_URL,
    timeout: 300000,
    headers: {'Content-Type':'application/json'}
});

instance.interceptors.request.use(
    (config)=>{
        const token = localStorage.getItem("token");
        if(token){
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error)=>{
        return Promise.reject(error);
    }
)

instance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            if (!["/login", "/register", "/"].includes(window.location.pathname)) {
                window.location.replace("/login");
            }
        }
        return Promise.reject(error);
    }
)
export default instance;
