// import { Enrollment } from 'types';

// import { api } from './api';

// export const Graduations = {
//   list: () => api.get('/graduation', { params: { limit: 100 } }),
//   get: (id: string) => api.get<Enrollment>('/graduation/' + id),
// };

import { Enrollment } from 'types';

import { api } from './api';

export const Graduations = {
  getCourses: () => api.get('/graduation', { params: { limit: 100 } }),
  get: (id: string) => api.get<Enrollment>('/graduation/' + id),
  list: () =>
    api.get('/subjectGraduations', {
      params: {
        populate: 'subject',
        limit: 100,
        graduation: '5f246e7e55e97a731eed450e'
      }
    })
};

export type CurrentCourseInformation = {
  _id: string;
  curso: string;
  grade: string;
  ra: number;
  __v: number;
  coefficients: CoefficientsByYear;
  createdAt: string;
  disciplinas: Disciplina[];
  graduation: string;
  updatedAt: string;
  id: string;
};