/**
 * An 18-byte cryptographically random value which is used to uniquely identify
 * a session.  This should not be included in prompts as it is used for
 * authentication.
 */
export default interface ISessionId extends Buffer { }
