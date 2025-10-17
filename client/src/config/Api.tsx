import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import config from './config';

interface ApiResponse {
  method: "GET" | "POST";
  url: string;
  data?: any;
  header?: "image" | "json";
}

export const Api = async <T = any>({
  method,
  url,
  data = {},
  header = "json"
}: ApiResponse): Promise<AxiosResponse<T>> => {

  const token = localStorage.getItem("token");

  const headers: AxiosRequestConfig["headers"] = {
    "Content-Type": header === "image" ? "multipart/form-data" : "application/json",
    ...(token && { Authorization: `Bearer ${token}` })
  };

  const response = await axios({
    method,
    url: `${config.Backend_Url}/api/user${url}`,
    data,
    headers
  });

  return response;
};
