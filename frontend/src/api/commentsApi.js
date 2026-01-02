import httpClient from "./httpClient";

export const fetchComments = async (ticketId) => {
  const res = await httpClient.get(`/tickets/${ticketId}/comments/`);
  return res.data;
};

export const createComment = async (ticketId, payload) => {
  const res = await httpClient.post(`/tickets/${ticketId}/comments/`, payload);
  return res.data;
};

export const deleteComment = async (commentId) => {
  await httpClient.delete(`/comments/${commentId}/`);
};
