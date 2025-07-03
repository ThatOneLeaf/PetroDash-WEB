import api from "./api";

export const fetchUsers = async () => {
  const res = await api.get("/accounts/");
  return res.data;
};

export const activateUser = async (account_id) => {
  const res = await api.patch(`/accounts/${account_id}/activate`);
  return res.data;
};

export const deactivateUser = async (account_id) => {
  const res = await api.patch(`/accounts/${account_id}/deactivate`);
  return res.data;
};
