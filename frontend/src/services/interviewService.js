import { api } from './api';

export async function createInterview(payload) {
  const { data } = await api.post('/interviews', payload);
  return data;
}

export async function getInterviews() {
  const { data } = await api.get('/interviews');
  return data;
}

export async function getInterview(id) {
  const { data } = await api.get(`/interviews/${id}`);
  return data;
}

export async function getNextQuestion(interviewId) {
  const response = await api.get(`/interviews/${interviewId}/next-question`, {
    validateStatus: (status) => status === 200 || status === 204,
  });
  return response.status === 204 ? null : response.data;
}

export async function submitAnswer(interviewId, { questionId, answer }) {
  const { data } = await api.post(`/interviews/${interviewId}/answers`, { questionId, answer });
  return data;
}

export async function completeInterview(interviewId) {
  const { data } = await api.post(`/interviews/${interviewId}/complete`);
  return data;
}

export async function getInterviewResults(interviewId) {
  const { data } = await api.get(`/interviews/${interviewId}/results`);
  return data;
}

export async function getAnalytics() {
  const { data } = await api.get('/analytics');
  return data;
}
