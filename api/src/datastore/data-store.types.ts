import { MockDatabaseService } from '../mock/mock-database.service';

type Asyncify<T> = T extends (...args: infer A) => infer R
  ? (...args: A) => Promise<Awaited<R>>
  : never;

export type DataStore = {
  [K in keyof MockDatabaseService]: Asyncify<MockDatabaseService[K]>;
};

export const DATA_STORE = Symbol('DATA_STORE');
