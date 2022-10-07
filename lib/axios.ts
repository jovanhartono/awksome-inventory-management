import axios, {AxiosInstance} from "axios";

const instance: AxiosInstance = axios.create({
    baseURL: `/api`
});

export default instance;
