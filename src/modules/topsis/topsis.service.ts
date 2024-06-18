import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import {
  Criteria,
  DeterminePass,
  Employee,
  Score,
} from './response/topsis.interface';
import RepoService from 'src/models/repo.service';

@Injectable()
export class TopsisService {
  constructor(private readonly repoService: RepoService) {}

  async resultEvaluation() {
    const scores: Score[] = await this.repoService.scoreRepo
      .createQueryBuilder('scores')
      .getMany();

    const employeeIds = [];
    scores.map((item) => {
      if (!employeeIds.includes(item.employeeId)) {
        employeeIds.push(item.employeeId);
      }
    });

    const employee: Employee[] = await this.repoService.employeeRepo
      .createQueryBuilder('employee')
      .where('employee.id IN (:...ids)', { ids: employeeIds })
      .getMany();

    const criteria: Criteria[] = await this.repoService.criteriaRepo
      .createQueryBuilder('criteria')
      .getMany();

    this.weightValidation(criteria);

    const result = await this.topsis(employee, criteria, scores);

    const scorePassed: DeterminePass[] = await this.determinePass(
      employee,
      criteria,
      scores,
    );

    const minPrefScore = 1 / employee.length;

    const response = result.map((r) => ({
      employee: employee.find((e) => e.id === r.employeeId),
      isPassedScore:
        scorePassed.find((e) => e.employeeId === r.employeeId).isPassing ===
        true
          ? 'PASSED'
          : 'NOT PASSED',
      status:
        r.score >= minPrefScore &&
        scorePassed.find((e) => e.employeeId === r.employeeId).isPassing ===
          true
          ? 'PASSED'
          : 'NOT PASSED',
      preferenceScore: Number(r.score.toFixed(4)),
    }));

    return response;
  }

  weightValidation(criteria: Criteria[]) {
    const totalWeight = criteria.reduce((sum, crit) => sum + crit.weight, 0);
    if (Math.abs(totalWeight - 1) > 0.00001) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error_code: 'BAD_REQUEST',
          message: 'Total bobot kriteria harus berjumlah 1.',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async determinePass(
    employees: Employee[],
    criteria: Criteria[],
    scores: Score[],
  ): Promise<DeterminePass[]> {
    const scoresByEmployee = this.groupScoresByEmployee(scores);

    const determinePass = employees.map((employee) => {
      let isPassing = true;

      criteria.forEach((crit) => {
        const weight = parseFloat(crit.weight.toString());
        const minScore = 70 * weight;
        const score = scoresByEmployee[employee.id].find(
          (s) => s.criteriaId === crit.id,
        ).score;

        if (score === undefined || score < minScore) {
          isPassing = false;
        }
      });

      return {
        employeeId: employee.id,
        employeeName: employee.name,
        isPassing: isPassing,
      };
    });

    return determinePass;
  }

  groupScoresByEmployee(scores: Score[]): Record<string, Score[]> {
    return scores.reduce((acc, score) => {
      if (!acc[score.employeeId]) {
        acc[score.employeeId] = [];
      }
      acc[score.employeeId].push(score);
      return acc;
    }, {});
  }

  normalizeMatrix(
    employees: Employee[],
    criteria: Criteria[],
    scores: Score[],
  ) {
    const normalizedScores = scores.map((score) => ({ ...score }));
    criteria.forEach((criterion) => {
      const sumOfSquares = Math.sqrt(
        scores
          .filter((s) => s.criteriaId === criterion.id)
          .reduce((sum, score) => sum + Math.pow(score.score, 2), 0),
      );
      normalizedScores.forEach((score) => {
        if (score.criteriaId === criterion.id) {
          score.score /= sumOfSquares;
        }
      });
    });
    return normalizedScores;
  }

  weightedNormalizedMatrix(normalizedScores: Score[], criteria: Criteria[]) {
    return normalizedScores.map((score) => {
      const weight = criteria.find(
        (criterion) => criterion.id === score.criteriaId,
      ).weight;
      return { ...score, score: score.score * weight };
    });
  }

  idealSolutions(weightedScores: Score[], criteria: Criteria[]) {
    const idealPositive = {};
    const idealNegative = {};
    criteria.forEach((criterion) => {
      const scoresByCriteria = weightedScores
        .filter((s) => s.criteriaId === criterion.id)
        .map((s) => s.score);
      idealPositive[criterion.id] = Math.max(...scoresByCriteria);
      idealNegative[criterion.id] = Math.min(...scoresByCriteria);
    });
    return { idealPositive, idealNegative };
  }

  distanceToIdeal(
    weightedScores: Score[],
    idealPositive: any,
    idealNegative: any,
    criteria: Criteria[],
    employees: Employee[],
  ) {
    return employees.map((employee) => {
      const employeeScores = weightedScores.filter(
        (s) => s.employeeId === employee.id,
      );
      const positiveDistance = Math.sqrt(
        criteria.reduce((sum, criterion) => {
          const score = employeeScores.find(
            (s) => s.criteriaId === criterion.id,
          ).score;
          return sum + Math.pow(score - idealPositive[criterion.id], 2);
        }, 0),
      );
      const negativeDistance = Math.sqrt(
        criteria.reduce((sum, criterion) => {
          const score = employeeScores.find(
            (s) => s.criteriaId === criterion.id,
          ).score;
          return sum + Math.pow(score - idealNegative[criterion.id], 2);
        }, 0),
      );
      return {
        employeeId: employee.id,
        employeeName: employee.name,
        positiveDistance,
        negativeDistance,
      };
    });
  }

  preferenceScores(distances: any) {
    return distances
      .map((dist) => {
        return {
          employeeId: dist.employeeId,
          employeeName: dist.employeeName,
          score:
            dist.negativeDistance /
            (dist.positiveDistance + dist.negativeDistance),
        };
      })
      .sort((a, b) => b.score - a.score);
  }

  topsis(employees: Employee[], criteria: Criteria[], scores: Score[]) {
    const normalizedMatrix = this.normalizeMatrix(employees, criteria, scores);

    const weightedMatrix = this.weightedNormalizedMatrix(
      normalizedMatrix,
      criteria,
    );

    const { idealPositive, idealNegative } = this.idealSolutions(
      weightedMatrix,
      criteria,
    );

    const distances = this.distanceToIdeal(
      weightedMatrix,
      idealPositive,
      idealNegative,
      criteria,
      employees,
    );

    return this.preferenceScores(distances);
  }
}
