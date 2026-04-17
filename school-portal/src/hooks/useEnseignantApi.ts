import { useMemo } from 'react';
import { createAuthClient } from '../api/client';
import { useAuth } from '../context/AuthContext';

export function useEnseignantApi() {
  const { enseignant } = useAuth();
  return useMemo(
    () => (enseignant ? createAuthClient(enseignant.role) : null),
    [enseignant],
  );
}
