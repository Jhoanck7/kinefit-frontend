import { AxiosInstance } from "axios";

import { axiosInstance } from "@/providers";

/** Clase base para los servicios que consumen la API, con su cliente HTTP y URL base */
export abstract class BaseApiService {
  protected readonly baseURL: string;
  protected readonly httpClient: AxiosInstance;

  constructor(baseURL: string, httpClient: AxiosInstance = axiosInstance) {
    this.baseURL = baseURL;
    this.httpClient = httpClient;
  }
}
