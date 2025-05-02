import { Message, ChatResponse, ApiError, Source } from "./types";

const API_KEY = "sec_PHB2i4qGwZADHAvOfQUZUNcOOHRT7mFh";
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

// Approximate token count calculation
// This is a simple approximation - 1 token is roughly 4 characters in English
const countTokens = (text: string): number => {
  return Math.ceil(text.length / 4);
};

// Limit messages to stay within token limits
export const limitMessages = (messages: Message[], maxTokens: number = 2500): Message[] => {
  // If we have 6 or fewer messages, ChatPDF API limit is fine, just check token count
  if (messages.length <= 6) {
    // Calculate total tokens in all messages
    let totalTokens = 0;
    for (const msg of messages) {
      totalTokens += countTokens(msg.content);
    }
    
    if (totalTokens <= maxTokens) {
      return messages; // We're within limits
    }
  }
  
  // We need to trim messages to meet both constraints (max 6 messages, max 2500 tokens)
  // Always keep the latest message (usually the user's query)
  const latestMessage = messages[messages.length - 1];
  
  // Start with only the latest message
  let trimmedMessages: Message[] = [latestMessage];
  let totalTokens = countTokens(latestMessage.content);
  
  // Try to add previous messages, going from newest to oldest (excluding the latest)
  for (let i = messages.length - 2; i >= 0; i--) {
    const msg = messages[i];
    const msgTokens = countTokens(msg.content);
    
    // Check if adding this message would exceed our limits
    if (trimmedMessages.length < 5 && totalTokens + msgTokens <= maxTokens) {
      // We can add this message
      trimmedMessages.unshift(msg);
      totalTokens += msgTokens;
    } else {
      break; // We've hit our limit
    }
  }
  
  return trimmedMessages;
};

export const chatWithPdf = async (
  sourceId: string,
  messages: Message[],
  includeReferences: boolean = true
): Promise<ChatResponse> => {
  try {
    // Limit messages to meet API constraints
    const limitedMessages = limitMessages(messages);
    
    console.log(`Sending ${limitedMessages.length} messages out of ${messages.length} original messages`);
    
    const response = await fetch(`${API_URL}/chats/message`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        sourceId,
        messages: limitedMessages,
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