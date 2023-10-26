import { Concept } from './concepts';

export type ConceptData = {
  conceito: Concept;
  cr_medio: number;
  cr_professor: number;
  count: number;
  amount: number;
  numeric: number;
  numericWeight: number;
};

export type TeacherReviewSubject = {
  _id: {
    _id: string;
    name: string;
    search: string;
    updatedAt: string;
    createdAt: string;
    __v: number;
    creditos: number;
  };
  distribution: ConceptData[];
  numericWeight: number;
  numeric: number;
  amount: number;
  count: number;
  cr_professor: number;
  cr_medio: number;
};

export type TeacherReview = {
  teacher: {
    _id: string;
    name: string;
    updatedAt: string;
    createdAt: string;
    __v: number;
  };
  general: {
    cr_medio: number;
    cr_professor: number;
    count: number;
    amount: number;
    numeric: number;
    numericWeight: number;
    distribution: ConceptData[];
  };
  specific: TeacherReviewSubject[];
};
