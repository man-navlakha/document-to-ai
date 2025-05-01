
import { Message, ChatResponse, ApiError, Source } from "./types";
const hello ="sec_PHB2i4qGwZADHAvOfQUZUNcOOHRT7mFh";
const API_KEY = hello
const API_URL = "https://api.chatpdf.com/v1";

const headers = {
  "x-api-key": API_KEY,
  "Content-Type": "application/json",
};

export const addPdfByUrl = async (url: string): Promise<string> => {
  try {
    const response = await fetch(`${API_URL}/sources/add-url`, {
      method: "POST",
      headers,
      body: JSON.stringify({ url }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to add PDF by URL");
    }

    const data = await response.json();
    return data.sourceId;
  } catch (error) {
    console.error("Error adding PDF by URL:", error);
    throw error;
  }
};

export const addPdfByFile = async (file: File): Promise<string> => {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`${API_URL}/sources/add-file`, {
      method: "POST",
      headers: {
        "x-api-key": API_KEY,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to upload PDF");
    }

    const data = await response.json();
    return data.sourceId;
  } catch (error) {
    console.error("Error uploading PDF:", error);
    throw error;
  }
};

export const chatWithPdf = async (
  sourceId: string,
  messages: Message[],
  includeReferences: boolean = true
): Promise<ChatResponse> => {
  try {
    const response = await fetch(`${API_URL}/chats/message`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        sourceId,
        messages,
        referenceSources: includeReferences,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to chat with PDF");
    }

    return await response.json();
  } catch (error) {
    console.error("Error chatting with PDF:", error);
    throw error;
  }
};

export const deletePdfSource = async (sourceId: string): Promise<void> => {
  try {
    const response = await fetch(`${API_URL}/sources/delete`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        sources: [sourceId],
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to delete PDF");
    }
  } catch (error) {
    console.error("Error deleting PDF:", error);
    throw error;
  }
};
