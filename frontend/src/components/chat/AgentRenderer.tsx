// src/components/chat/AgentRenderer.tsx

export const AgentRenderer = ({ response }: { response: any }) => {
  // Check if we got a direct reply from your backend (ChatResponse)
  const message = response.reply || response.message || JSON.stringify(response);

  return (
    <div className="p-4 bg-white border rounded-xl shadow-sm text-gray-700">
      <p>{message}</p>
    </div>
  );
};