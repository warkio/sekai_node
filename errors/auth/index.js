class AuthError extends Error {
    constructor(message) {
      super(message);
     // Ensure the name of this error is the same as the class name
      this.name = this.constructor.name;
     // This clips the constructor invocation from the stack trace.
     // It's not absolutely essential, but it does make the stack trace a little nicer.
      Error.captureStackTrace(this, this.constructor);
    }
}

class UsernameAlreadyExists extends AuthError {
    constructor(message) {
        super(message);
    }
}

class EmailAlreadyExists extends AuthError {
    constructor(message) {
        super(message);
    }
}

class InvalidCredentials extends AuthError {
    constructor(message) {
        super(message);
    }
}

module.exports = {
    UsernameAlreadyExists,
    EmailAlreadyExists,
    InvalidCredentials
};
