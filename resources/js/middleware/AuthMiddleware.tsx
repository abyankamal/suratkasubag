import { router } from '@inertiajs/react';

interface Props {
  auth: {
    user: any | null;
  };
}

export function redirectIfUnauthenticated({ auth }: Props) {
  if (!auth.user) {
    router.visit('/login');
    return false;
  }
  
  return true;
}

export function redirectIfAuthenticated({ auth }: Props) {
  if (auth.user) {
    router.visit('/dashboard');
    return false;
  }
  
  return true;
}
