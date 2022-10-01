import axios, {AxiosInstance} from "axios";

const instance: AxiosInstance = axios.create({
    baseURL: `${process.env.HOST}/api`
});

export default instance;
