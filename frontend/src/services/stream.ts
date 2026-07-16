export async function streamChat(
  message: string,
  threadId: string,
  clerkUserId: string,
  clerkUserName: string,
  onToken: (token: string) => void,
  onDone: (fullReply: string) => void,
  onError: (error: string) => void
) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const response = await fetch(`${apiUrl}/api/chat/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        thread_id: threadId,
        clerk_user_id: clerkUserId,
        clerk_user_name: clerkUserName,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    if (!response.body) {
      throw new Error("No response body");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let done = false;
    let buffer = '';

    while (!done) {
      const { value, done: readerDone } = await reader.read();
      done = readerDone;
      if (value) {
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.substring(6).trim();
            if (!dataStr) continue;
            try {
              const data = JSON.parse(dataStr);
              if (data.token) {
                onToken(data.token);
              }
              if (data.done) {
                onDone(data.full_reply);
              }
              if (data.error) {
                onError(data.error);
              }
            } catch (e) {
              console.error("SSE Error:", e, "Data string:", dataStr);
            }
          }
        }
      }
    }
  } catch (error: any) {
    onError(error.message || 'Streaming failed');
  }
}
