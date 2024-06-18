export interface Score {
  criteriaId: string;
  criteriaName: string;
  score: number;
}

export interface EmployeeScore {
  employeeId: string;
  employeeName: string;
  scores: Score[];
}
