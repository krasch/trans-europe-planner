import "vitest";

interface CustomMatchers<R = unknown> {
  toMatchDOMObject: (actual, expected) => R;
  toMatchDOMObjectList: (actual, expected) => R;
}

declare module "vitest" {
  interface Matchers<T = any> extends CustomMatchers<T> {}
}
