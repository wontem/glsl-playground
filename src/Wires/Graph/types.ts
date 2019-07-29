import { Context } from './Context';

export type ParamData = string | number | boolean | null | object;
export type ParamAddress = [string, string];
export type ParamDataCollection = Record<string, ParamData>;
export type TriggersCollection = Record<string, () => void>;

export type ContextRecord<T extends Record<string, any> = {}> = {
  [P in keyof T]: Context<T[P]>
};
