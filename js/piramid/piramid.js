function startGL() {
  let canvas = document.getElementById("opengl-surface"); // get canvas id from html template
  let gl = canvas.getContext("webgl");
  if (!gl) {
    console.log("Your browser doesn't support WEBGL!");
    return;
  }
  gl.enable(gl.DEPTH_TEST);
  gl.frontFace(gl.CCW);
  return [gl, canvas];
}

function createShader(gl, type, source) {
  let shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  let success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  if (success) {
    return shader;
  }
  console.log(
    `ERROR compiling ${type} shader!`,
    gl.getShaderInfoLog(fragmentShader)
  );
  gl.deleteShader(shader);
}

function createProgram(gl, vertexShader, fragmentShader) {
  // webgl entire program
  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  // link program and check for errors
  gl.linkProgram(program);
  let success = gl.getProgramParameter(program, gl.LINK_STATUS);
  if (!success) {
    console.log("Error linking program!", gl.getProgramInfoLog(program));
    return;
  }
  gl.validateProgram(program);
  success = gl.getProgramParameter(program, gl.VALIDATE_STATUS);
  if (!success) {
    console.log("Error validating program!", gl.getProgramInfoLog(program));
    return;
  }
  return program;
}

function init() {
  [gl, canvas] = startGL();

  // create GLSL shaders, upload the GLSL source, compile the shaders
  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
  const fragmentShader = createShader(
    gl,
    gl.FRAGMENT_SHADER,
    fragmentShaderSource
  );

  const program = createProgram(gl, vertexShader, fragmentShader);

  const triangleVertexBufferObject = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexBufferObject); // bind the created array buffer to the newly created buffer
  gl.bufferData(
    gl.ARRAY_BUFFER, // data type
    new Float32Array(triangleVertices), // javascript uses 64bit numbers but openGL 32bit
    gl.STATIC_DRAW // sending data from cpu memory to gpu memory (static means it's not going 2 be changed overtime)
  ); // uses the currently active buffer (latest bound)

  const piramidIndexBufferObject = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, piramidIndexBufferObject);
  gl.bufferData(
    gl.ELEMENT_ARRAY_BUFFER,
    new Uint16Array(piramidIndices),
    gl.STATIC_DRAW
  );

  let positionAttribLocation = gl.getAttribLocation(program, "vertPosition"); // (which program u're using, name of the used attribute)
  let colorAttribLocation = gl.getAttribLocation(program, "vertColor");
  // atribute layout
  gl.vertexAttribPointer(
    positionAttribLocation, // attribute location
    3, // number of elements per attribute
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
  mat4.lookAt(viewMatrix, [0, 0, -8], [0, 0, 0], [0, 1, 0]);

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

  const xRotationMatrix = new Float32Array(16);
  const yRotationMatrix = new Float32Array(16);

  //
  // Render loop
  //
  let angle = 0; // defined outsite out loop for performance reasons
  let identityMatrix = new Float32Array(16);
  mat4.identity(identityMatrix);
  let loop = function () {
    rotationTime = 3;
    angle = (performance.now() / 1000 / rotationTime) * 2 * Math.PI; // one rotation every rotationTime secs
    // Rotation
    mat4.rotate(yRotationMatrix, identityMatrix, angle, [0, 1, 0]);
    mat4.rotate(xRotationMatrix, identityMatrix, angle / 4, [1, 0, 0]);
    mat4.mul(worldMatrix, xRotationMatrix, yRotationMatrix); // rotate in multiple axis
    gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);

    gl.clearColor(0.75, 0.85, 0.8, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    // params (gl.RenderFormat, how many vertices to skip, how many points are being drawed)
    gl.drawElements(gl.TRIANGLES, piramidIndices.length, gl.UNSIGNED_SHORT, 0); // uses currently bound buffer

    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
}
