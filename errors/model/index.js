class ModelError extends Error {
    constructor(message) {
      super(message);
     // Ensure the name of this error is the same as the class name
      this.name = this.constructor.name;
     // This clips the constructor invocation from the stack trace.
     // It's not absolutely essential, but it does make the stack trace a little nicer.
      Error.captureStackTrace(this, this.constructor);
    }
}

class InvalidOperator extends ModelError {
    constructor(message) {
        super(message);
    }
}
class InvalidStructure extends ModelError {
    constructor(message) {
        super(message);
    }
}

class InvalidParams extends ModelError {
    constructor(message) {
        super(message);
    }
}

module.exports = {
    InvalidOperator,
    InvalidStructure,
    InvalidParams
};