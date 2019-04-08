export class PrioritizedArray<T, P> {
  private prioritiesMap: Map<P, T[]> = new Map();

  constructor(private sortFunction?: (a: P, b: P) => number) {}

  private getArrayForPriority(priority: P): T[] {
    return this.prioritiesMap.get(priority) || [];
  }

  push(priority: P, ...data: T[]): void {
    const dataArray = this.getArrayForPriority(priority);
    dataArray.push(...data);
    this.prioritiesMap.set(priority, dataArray);
  }

  unshift(priority: P, ...data: T[]): void {
    const dataArray = this.getArrayForPriority(priority);
    dataArray.unshift(...data);
    this.prioritiesMap.set(priority, dataArray);
  }

  toArray(): T[] {
    return [...this.prioritiesMap.keys()].sort(this.sortFunction).flatMap(id => this.prioritiesMap.get(id));
  }
}
