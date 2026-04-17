import axios, { type AxiosInstance } from 'axios';
import type { EnseignantRoleLabel } from '../types';

const baseURL = '/api';

export const publicClient = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
});

/** En-tête attendu par la gateway / microservices pour les appels « enseignant ». */
export function roleHeaderForApi(role: EnseignantRoleLabel): string {
  return role;
}

export function createAuthClient(role: EnseignantRoleLabel): AxiosInstance {
  return axios.create({
    baseURL,
    headers: {
      'Content-Type': 'application/json',
      'X-Enseignant-Role': roleHeaderForApi(role),
    },
  });
}
