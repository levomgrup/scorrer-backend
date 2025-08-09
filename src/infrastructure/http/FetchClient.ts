export interface FetchResponse {
  url: string;
  statusCode: number;
  body: string;
}

export interface FetchClient {
  get(url: string): Promise<FetchResponse>;
}


