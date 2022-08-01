# How to instrument three.js code and get results

To instrument Three.js code:

```sh
rm -rf node_modules/three
npm install
node instrument-three.mjs
```

To get the result, run the app:

```sh
npm start
```

In Chrome console, run

```js
JSON.stringify(window.executionResult, null, 2)
```

This outputs a JSON array of strings representing all the functions, and some
blocks within those functions, that were called during execution.

I have saved the desktop and android execution results in `result-desktop.json`
and `result-android.json`, respectively.

The desktop app executes 7 more locations than the mobile app does, as you can
see by diffing `result-desktop.json` with `result-android.json`.

# Current diff

The following is the current diff between outputs. It was generated with `diff -u result-desktop.json result-android.json`. I'll keep this updated as I improve
the instrumentation.

```patch
--- result-desktop.json 2022-07-31 18:08:35.931448506 -0700
+++ result-android.json 2022-07-31 18:12:17.015507233 -0700
@@ -3173,7 +3173,6 @@
        "class method:Vector4#floor() {",
        "class method:Object#function viewport(viewport) {",
        "class method:Vector4#equals(v) {",
-       "class method:Vector4#copy(v) {",
        "class method:WebGLRenderer#function (scene, camera) {",
        "block inside class method:Scene#updateMatrixWorld(force) {",
        "class method:Scene#updateMatrix() {",
@@ -3846,11 +3845,6 @@
        "class method:SingleUniform#constructor(id, activeInfo, addr) {",
        "class method:Window#function getSingularSetter(type) {",
        "block inside class method:Window#function addUniform(container, uniformObject) {",
-       "block inside class method:Window#function parseUniform(activeInfo, addr, container) {",
-       "block inside class method:Window#while (true) {",
-       "class method:SingleUniform#constructor(id, activeInfo, addr) {",
-       "class method:Window#function getSingularSetter(type) {",
-       "block inside class method:Window#function addUniform(container, uniformObject) {",
        "class method:WebGLProgram#function () {",
        "class method:Object#function useProgram(program) {",
        "class method:WebGLUniforms#setValue(gl, name, value, textures) {",
@@ -3862,7 +3856,6 @@
        "block inside class method:Object#function refreshMaterialUniforms(uniforms, material, pixelRatio, height, transmissionRenderTarget) {",
        "block inside class method:Window#function refreshUniformsCommon(uniforms, material) {",
        "class method:Object#function get(object) {",
-       "class method:SingleUniform#function setValueV1f(gl, v) {",
        "class method:WebGLUniforms#setValue(gl, name, value, textures) {",
        "class method:SingleUniform#function setValueM4(gl, v) {",
        "class method:Window#function arraysEqual(a, b) {",
```

# Further improvement

We can further improve this by using an AST instead of naive regexes. Ideally we
would detect _all_ code branch differences. We would also want to detect
differences in GLSL strings.
