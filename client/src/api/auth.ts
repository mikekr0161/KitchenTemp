import api from './index';

export interface LoginCredentials {
  email: string;
  password: string;
}

export const login = async (credentials: LoginCredentials) => {
  const { data } = await api.post('/auth/login', credentials);
  return data;
};

export interface RegisterData {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    organisationName: string;
}

export const register = async (userData: RegisterData) => {
  const { data } = await api.post('/auth/register', userData);
  return data;
};
