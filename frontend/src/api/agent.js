import client from './client';

export async function listMyFields() {
  const { data } = await client.get('/agent/fields');
  return data.data.fields;
}

export async function getMyField(id) {
  const { data } = await client.get(`/agent/fields/${id}`);
  return data.data.field;
}

export async function addFieldUpdate(id, payload) {
  const { data } = await client.post(`/agent/fields/${id}/updates`, payload);
  return data.data;
}
