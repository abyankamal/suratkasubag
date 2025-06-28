// User related types
export interface UserType {
  id: number;
  name: string;
  username: string;
  email: string;
  role: 'admin' | 'user';
  avatar: string | null;
  departement_id?: number | null;
  position_id?: number | null;
  department?: { id: number; name: string };
  position?: { id: number; name: string };
  created_at: string;
  updated_at: string;
  [key: string]: any; // For dynamic properties
}

// Type guard to check if an object is a UserType
export function isUserType(obj: any): obj is UserType {
  return (
    obj &&
    typeof obj === 'object' &&
    'id' in obj &&
    'name' in obj &&
    'username' in obj &&
    'role' in obj
  );
}

export interface DepartmentType {
  id: number;
  name: string;
}

export interface PositionType {
  id: number;
  name: string;
}

// Form data type with all fields as optional for partial updates
export interface UserFormData {
  id?: string | number;
  name?: string;
  username?: string;
  role?: 'admin' | 'user';
  password?: string;
  password_confirmation?: string;
  avatar?: string | File | null;
  departement_id?: string | number;
  position_id?: string | number;
  [key: string]: any; // For dynamic access
}

// Type guard to check if an object is a UserFormData
export function isUserFormData(obj: any): obj is UserFormData {
  return (
    obj &&
    typeof obj === 'object' &&
    'name' in obj &&
    'username' in obj &&
    'role' in obj
  );
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
  from: number;
  to: number;
  links: Array<{ url: string | null; label: string; active: boolean }>;
}

export interface UsersPageProps {
  auth: any;
  users: PaginatedResponse<UserType>;
  departments: DepartmentType[];
  positions: PositionType[];
  errors?: Record<string, string>;
}
