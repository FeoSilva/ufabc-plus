import type { Enrollment } from '@next/types';

import { api } from './api';

export const Enrollments = {
  list: () => api.get<Enrollment[]>('/enrollments'),
  get: (id: string) => api.get<Enrollment>(`/enrollments/${id}`),
};
