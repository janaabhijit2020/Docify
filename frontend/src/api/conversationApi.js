import api from './axios';

export async function getConversations() {
  const response = await api.get('/api/conversations');
  return response.data;
}

export async function getConversation(conversationId) {
  const response = await api.get(
    `/api/conversations/${conversationId}`
  );

  return response.data;
}