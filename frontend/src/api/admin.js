import client from './client';

export async function getDashboard() {
  const { data } = await client.get('/admin/dashboard');
  return data.data;
}

export async function listFields() {
  const { data } = await client.get('/admin/fields');
  return data.data.fields;
}

export async function getField(id) {
  const { data } = await client.get(`/admin/fields/${id}`);
  return data.data.field;
}

export async function createField(payload) {
  const { data } = await client.post('/admin/fields', payload);
  return data.data.field;
}

export async function updateField(id, payload) {
  const { data } = await client.put(`/admin/fields/${id}`, payload);
  return data.data.field;
}

export async function deleteField(id) {
  await client.delete(`/admin/fields/${id}`);
}

export async function assignField(id, agentId) {
  const { data } = await client.post(`/admin/fields/${id}/assign`, { agent_id: agentId });
  return data.data.field;
}

export async function listAgents() {
  const { data } = await client.get('/admin/agents');
  return data.data.agents;
}
