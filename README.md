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

# Further improvement

We can further improve this by using an AST instead of naive regexes. Ideally we
would detect _all_ code branch differences. We would also want to detect
differences in GLSL strings.
