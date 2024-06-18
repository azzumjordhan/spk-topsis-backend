export type Employee = {
  id: string;
  name: string;
};

export type Criteria = {
  id: string;
  criteriaName: string;
  weight: number;
};

export type Score = {
  employeeId: string;
  criteriaId: string;
  score: number;
};

export interface DeterminePass {
  employeeId: string;
  employeeName: string;
  isPassing: boolean;
}
