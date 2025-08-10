interface MessageResponse {
  success: boolean;
  message: string;
  tokensUsed: number;
  responseTime: number;
  updatedSummary?: string;
  updatedProfile?: any;
  error?: string;
  details?: string;
}

export async function sendWebMessage(userId: string, message: string): Promise<MessageResponse> {
  try {
    const response = await fetch('/.netlify/functions/web_message', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        message,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const data: MessageResponse = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to send message');
    }

    return data;
  } catch (error) {
    console.error('Error sending web message:', error);
    throw error;
  }
}
