import { router } from '@inertiajs/react';

interface Props {
  auth: {
    user: any | null;
  };
}

export function redirectIfUnauthenticated({ auth }: Props) {
  if (!auth.user) {
    router.visit(route('login'));
    return false;
  }

  return true;
}

export function redirectIfAuthenticated({ auth }: Props) {
  if (auth.user) {
    router.visit(route('dashboard'));
    return false;
  }

  return true;
}
