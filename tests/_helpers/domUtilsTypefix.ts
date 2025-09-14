declare global {
  namespace jest {
    interface Matchers<R> {
      toMatchDOMObject(expected: object): CustomMatcherResult;
    }
  }
}
