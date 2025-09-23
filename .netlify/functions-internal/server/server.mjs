export { default } from "./main.mjs";
export const config = {
  name: "server handler",
  generator: "nuxt@3.19.2",
  path: "/*",
  nodeBundler: "none",
  includedFiles: ["**"],
  excludedPath: ["/.netlify/*","/_nuxt/builds/meta/*","/_nuxt/builds/*","/_nuxt/*"],
  preferStatic: true,
};