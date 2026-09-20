import api from './axios';

export async function sendChatMessage({
  documentId,
  question,
  conversationId = null,
}) {
  const response = await api.post('/api/chat', {
    documentId,
    question,
    conversationId,
  });

  return response.data;
}

export async function getConversation(conversationId) {
  const response = await api.get(
    `/api/conversations/${conversationId}`
  );

  return response.data;
}