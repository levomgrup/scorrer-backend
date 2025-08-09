export class FetchError extends Error {
  constructor(message: string, public readonly cause?: unknown) {
    super(message);
    this.name = 'FetchError';
  }
}

export class ParseError extends Error {
  constructor(message: string, public readonly cause?: unknown) {
    super(message);
    this.name = 'ParseError';
  }
}

export class ValidationError extends Error {
  constructor(message: string, public readonly cause?: unknown) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class UpsertError extends Error {
  constructor(message: string, public readonly cause?: unknown) {
    super(message);
    this.name = 'UpsertError';
  }
}


