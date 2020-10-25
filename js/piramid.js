const vertexShaderText = [
  "precision mediump float;",
  "",
  "attribute vec2 vertPosition;",
  "attribute vec3 vertColor;",
  "varying vec3 fragColor;",
  "",
  "void main() {",
  "  fragColor = vertColor;",
  "  gl_Position = vec4(vertPosition, 0.0, 1.0);",
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

function init() {
  console.log("this is working");
  let canvas = document.getElementById("opengl-surface");
  let gl = canvas.getContext("webgl");
  //let vertices = new Float32Array(PiramidPositions);
  if (!gl) {
    console.log("Your browser doesn't support WEBGL!");
    return;
  }
  gl.clearColor(0.75, 0.85, 0.8, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  const vertexShader = gl.createShader(gl.VERTEX_SHADER);
  const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);

  gl.shaderSource(vertexShader, vertexShaderText);
  gl.shaderSource(fragmentShader, fragmentShaderText);

  // Compile and check for errors
  gl.compileShader(vertexShader);
  if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
    console.log(
      "ERROR compiling vertex shader!",
      gl.getShaderInfoLog(vertexShader)
    );
    return;
  }
  gl.compileShader(fragmentShader);
  if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
    console.log(
      "ERROR compiling fragment shader!",
      gl.getShaderInfoLog(fragmentShader)
    );
    return;
  }
  // webgl entire program
  let program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  // link program and check for errors
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.log("Error linking program!", gl.getProgramInfoLog(program));
    return;
  }
  gl.validateProgram(program);
  if (!gl.getProgramParameter(program, gl.VALIDATE_STATUS)) {
    console.log("Error validating program!", gl.getProgramInfoLog(program));
    return;
  }
  const triangleVertices = [
    0.0, // x
    0.5, // y
    1.0, // R
    1.0, // G
    0.0, // B
    -0.5, // x
    -0.5, // y
    0.7, // R
    0.0, // G
    1.0, // B
    0.5, // x
    -0.5, // y
    0.1, // R
    1.0, // G
    0.6, // B
  ]; // [x,y, R, G, B] format
  const triangleVertexBufferObject = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexBufferObject); // bind the created array buffer to the newly created buffer
  gl.bufferData(
    gl.ARRAY_BUFFER, // data type
    new Float32Array(triangleVertices), // javascript uses 64bit numbers but openGL 32bit
    gl.STATIC_DRAW // sending data from cpu memory to gpu memory (static means it's not going 2 be changed overtime)
  ); // uses the currently active buffer (latest bound)
  let positionAttribLocation = gl.getAttribLocation(program, "vertPosition"); // (which program u're using, name of the used attribute)
  let colorAttribLocation = gl.getAttribLocation(program, "vertColor");
  // atribute layout
  gl.vertexAttribPointer(
    positionAttribLocation, // attribute location
    2, // number of elements per attribute
    gl.FLOAT, // Type of elements
    gl.FALSE, // is normalized
    5 * Float32Array.BYTES_PER_ELEMENT, // Size of an individual vertex
    0 // Offset from the beginning of a single vertex to this attribute
  );
  gl.vertexAttribPointer(
    colorAttribLocation, // attribute location
    3, // number of elements per attribute
    gl.FLOAT, // Type of elements
    gl.FALSE, // is normalized
    5 * Float32Array.BYTES_PER_ELEMENT, // Size of an individual vertex
    2 * Float32Array.BYTES_PER_ELEMENT // Offset from the beginning of a single vertex to this attribute
  );
  gl.enableVertexAttribArray(positionAttribLocation);
  gl.enableVertexAttribArray(colorAttribLocation);

  //
  // Main render loop
  //
  gl.useProgram(program);
  // params (gl.RenderFormat, how many vertices to skip, how many points are being drawed)
  gl.drawArrays(gl.TRIANGLES, 0, 3); // uses currently bound buffer
}

