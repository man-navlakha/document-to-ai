
export interface Message {
  role: "user" | "assistant";
  content: string;
}

export interface ChatResponse {
  content: string;
  references?: { pageNumber: number }[];
}

export interface Source {
  id: string;
  name: string;
  dateAdded: string;
}

export interface ApiError {
  message: string;
  status?: number;
}
