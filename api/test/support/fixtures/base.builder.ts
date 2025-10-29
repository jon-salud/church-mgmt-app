/**
 * Base builder class providing fluent interface for test data creation
 */
export abstract class TestBuilder<T> {
  protected data: Partial<T> = {};

  /**
   * Build the final object with all configured properties
   */
  abstract build(): T;

  /**
   * Create a new builder instance with current data
   */
  abstract clone(): TestBuilder<T>;

  /**
   * Reset builder to initial state
   */
  reset(): this {
    this.data = {};
    return this;
  }

  /**
   * Set multiple properties at once
   */
  withData(data: Partial<T>): this {
    this.data = { ...this.data, ...data };
    return this;
  }

  /**
   * Set a single property
   */
  with<K extends keyof T>(key: K, value: T[K]): this {
    this.data[key] = value;
    return this;
  }
}

/**
 * Builder for creating collections of test objects
 */
export class TestCollectionBuilder<T> {
  private builders: TestBuilder<T>[] = [];

  /**
   * Add a builder to the collection
   */
  add(builder: TestBuilder<T>): this {
    this.builders.push(builder);
    return this;
  }

  /**
   * Create multiple instances using the same base builder
   */
  createMultiple(baseBuilder: TestBuilder<T>, count: number): this {
    for (let i = 0; i < count; i++) {
      this.builders.push(baseBuilder.clone());
    }
    return this;
  }

  /**
   * Build all objects in the collection
   */
  build(): T[] {
    return this.builders.map(builder => builder.build());
  }

  /**
   * Get the number of builders in the collection
   */
  count(): number {
    return this.builders.length;
  }
}
