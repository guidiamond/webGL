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
  gl.enable(gl.DEPTH_TEST);
  gl.enable(gl.CULL_FACE);
  gl.frontFace(gl.CCW);
  gl.cullFace(gl.BACK);

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
    0.0, //  x
    0.5, //  y
    0.0, //  z
    1.0, // R
    1.0, // G
    0.0, // B
    -0.5, // x
    -0.5, // y
    0.0, //  z
    0.7, // R
    0.0, // G
    1.0, // B
    0.5, //  x
    -0.5, // y
    0.0, //  z
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
    6 * Float32Array.BYTES_PER_ELEMENT, // Size of an individual vertex
    0 // Offset from the beginning of a single vertex to this attribute
  );
  gl.vertexAttribPointer(
    colorAttribLocation, // attribute location
    3, // number of elements per attribute
    gl.FLOAT, // Type of elements
    gl.FALSE, // is normalized
    6 * Float32Array.BYTES_PER_ELEMENT, // Size of an individual vertex
    3 * Float32Array.BYTES_PER_ELEMENT // Offset from the beginning of a single vertex to this attribute
  );
  gl.enableVertexAttribArray(positionAttribLocation);
  gl.enableVertexAttribArray(colorAttribLocation);

  gl.useProgram(program);
  let matWorldUniformLocation = gl.getUniformLocation(program, "mWorld");
  let matViewUniformLocation = gl.getUniformLocation(program, "mView");
  let matProjUniformLocation = gl.getUniformLocation(program, "mProj");

  let worldMatrix = new Float32Array(16);
  let viewMatrix = new Float32Array(16);
  let projMatrix = new Float32Array(16);
  mat4.identity(worldMatrix);
  mat4.lookAt(viewMatrix, [0, 0, -2], [0, 0, 0], [0, 1, 0]);
  mat4.perspective(
    projMatrix,
    glMatrix.toRadian(45),
    canvas.width / canvas.height,
    0.1,
    1000.0
  );
  gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);
  gl.uniformMatrix4fv(matViewUniformLocation, gl.FALSE, viewMatrix);
  gl.uniformMatrix4fv(matProjUniformLocation, gl.FALSE, projMatrix);

  let xRotationMatrix = new Float32Array(16);
  let yRotationMatrix = new Float32Array(16);

  //
  // Main render loop
  //
  let angle = 0;
  let identityMatrix = new Float32Array(16);
  mat4.identity(identityMatrix);
  let loop = function () {
    angle = (performance.now() / 1000 / 6) * 2 * Math.PI; // one rotation every 6secs
    mat4.rotate(yRotationMatrix, identityMatrix, angle, [0, 1, 0]);
    mat4.rotate(xRotationMatrix, identityMatrix, angle / 4, [1, 0, 0]);
    mat4.mul(worldMatrix, xRotationMatrix, yRotationMatrix); // rotate in multiple axis
    gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);

    gl.clearColor(0.75, 0.85, 0.8, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    // params (gl.RenderFormat, how many vertices to skip, how many points are being drawed)
    gl.drawArrays(gl.TRIANGLES, 0, 3); // uses currently bound buffer

    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
}

