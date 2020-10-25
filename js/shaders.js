const vertexShaderText = [
  "precision mediump float;",
  "",
  "attribute vec3 vertPosition;",
  "attribute vec3 vertColor;",
  "varying vec3 fragColor;",
  "uniform mat4 mWorld;", // rotating the piramid in 3D space
  "uniform mat4 mView;", // where the camera is sitting at
  "uniform mat4 mProj;",
  "",
  "void main() {",
  "  fragColor = vertColor;",
  "  gl_Position = mProj * mView * mWorld * vec4(vertPosition, 1.0);",
  "}",
].join("\n");

const fragmentShaderText = [
  "precision mediump float;",
  "varying vec3 fragColor;",
  "",
  "void main() {",
  "  gl_FragColor = vec4(fragColor, 1.0);", // rgba format
  "}",
].join("\n");
