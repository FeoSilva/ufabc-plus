import { Concept } from './concepts';

export type Comment = {
  _id: string;
  comment: string;
  createdAt: string;
  enrollment: {
    _id: string;
    conceito: Concept;
    creditos: number;
    quad: number;
    year: number;
    season?: string;
  };
  myReactions: {
    like: boolean;
    recommendation: boolean;
    star: boolean;
  };
  subject: {
    __v: number;
    _id: string;
    createdAt: string;
    creditos: number;
    name: string;
    search: string;
    updatedAt: string;
  };
  reactionsCount?: { like: number; recommendation: number };
  teacher: string;
  updatedAt: string;
};