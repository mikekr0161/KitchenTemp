import { useMutation, useQueryClient } from '@tanstack/react-query';
import { login as loginApi, register as registerApi } from '../api/auth';
import type { LoginCredentials, RegisterData } from '../api/auth';
import { useNavigate } from 'react-router-dom';

export const useAuth = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { mutate: login, isPending: isLoginLoading } = useMutation({
    mutationFn: (credentials: LoginCredentials) => loginApi(credentials),
    onSuccess: (data) => {
      localStorage.setItem('accessToken', data.data.accessToken);
      localStorage.setItem('refreshToken', data.data.refreshToken);
      queryClient.invalidateQueries({ queryKey: ['user'] });
      navigate('/');
    },
  });

  const { mutate: register, isPending: isRegisterLoading } = useMutation({
    mutationFn: (userData: RegisterData) => registerApi(userData),
    onSuccess: () => {
      navigate('/login');
    },
  });

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    queryClient.invalidateQueries({ queryKey: ['user'] });
    navigate('/login');
  };

  return { login, isLoginLoading, register, isRegisterLoading, logout };
};
