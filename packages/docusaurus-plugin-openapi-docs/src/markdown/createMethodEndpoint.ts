import { create } from "./utils";

export function createMethodEndpoint(method: String, path: String) {
  return create("MethodEndpoint", { method: method, path: path });
}
