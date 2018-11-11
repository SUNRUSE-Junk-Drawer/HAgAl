/**
 * Base interface for types which can be explicitly marked as out-of-scope.
 */
export default interface IDisposable {
  /**
   * Explicitly marks this instance as out-of-scope.  It should not be
   * interacted with after calling, even if the returned promise is unresolved.
   */
  dispose(): Promise<void>
}
