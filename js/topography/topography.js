const fieldOfView = degrees_to_radians(45);
const rotationTime = 5;
const zNear = 0.1;
const zFar = 300.0;

function initBuffers(gl, programInfo) {
  // Create Positions buffer bind and set data
  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(pos_array), gl.STATIC_DRAW);
  gl.vertexAttribPointer(
    programInfo.attribLocations.vertexPosition,
    3, // number of elements per attribute
    gl.FLOAT, // Type of elements
    gl.FALSE, // is normalized
    0, // stride
    0 // Offset from the beginning of a single vertex to this attribute
  );
  gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);

  // Create Colors buffer bind and set data
  const colorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(color_array), gl.STATIC_DRAW);
  gl.vertexAttribPointer(
    programInfo.attribLocations.vertexColor,
    4, // number of elements per attribute
    gl.FLOAT, // Type of elements
    gl.FALSE, // is normalized
    0, // stride
    0 // Offset from the beginning of a single vertex to this attribute
  );
  gl.enableVertexAttribArray(programInfo.attribLocations.vertexColor);

  // Create Indexes buffer bind and set data
  const indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(
    gl.ELEMENT_ARRAY_BUFFER,
    new Uint16Array(pto_ind_array),
    gl.STATIC_DRAW
  );

  // Create WEBGL program
  gl.useProgram(programInfo.program);
}

function startGL() {
  let canvas = document.getElementById("opengl-surface"); // get canvas id from html template
  let gl = canvas.getContext("webgl");
  if (!gl) {
    console.log("Your browser doesn't support WEBGL!");
    return;
  }
  gl.enable(gl.DEPTH_TEST); // Z buffer
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

// Início do Sistema WebGL
function main() {
  [gl, canvas] = startGL();
  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
  const fragmentShader = createShader(
    gl,
    gl.FRAGMENT_SHADER,
    fragmentShaderSource
  );
  const program = createProgram(gl, vertexShader, fragmentShader);

  const programInfo = {
    program: program,
    attribLocations: {
      vertexPosition: gl.getAttribLocation(program, "vertPosition"),
      vertexColor: gl.getAttribLocation(program, "vertColor"),
    },
    uniformLocations: {
      projectionMatrix: gl.getUniformLocation(program, "mProj"),
      modelViewMatrix: gl.getUniformLocation(program, "mView"),
    },
  };

  initBuffers(gl, programInfo);

  const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;

  // Perspective (45deg 3:300 visible distance)
  const projectionMatrix = mat4.create();
  mat4.perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar); // as it has a static value it's not defined inside the loop
  gl.uniformMatrix4fv(
    programInfo.uniformLocations.projectionMatrix,
    false,
    projectionMatrix
  );

  //
  // Render loop
  //
  let angle = 0; // defined outsite out loop for performance reasons
  function loop() {
    // Atualiza o valor da rotação
    angle = (performance.now() / 1000 / rotationTime) * 2 * Math.PI; // rotation angle

    const modelViewMatrix = mat4.create(); // defaults to identity matrix

    // Rotation order: translate => rotate(x)  => rotate(z)
    mat4.translate(modelViewMatrix, modelViewMatrix, [0, 0, -100]);
    mat4.rotate(modelViewMatrix, modelViewMatrix, -Math.PI / 3, [1, 0, 0]); // fix ratio
    mat4.rotate(modelViewMatrix, modelViewMatrix, angle, [0, 0, 1]);

    gl.uniformMatrix4fv(
      programInfo.uniformLocations.modelViewMatrix,
      false,
      modelViewMatrix
    );

    gl.clearColor(0.0, 0.0, 0.0, 1.0); // Black background color
    gl.clearDepth(1.0); // Clear depth buffer
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // params (gl.RenderFormat, how many vertices to skip, how many points are being drawed)
    gl.drawElements(gl.TRIANGLES, 6110 * 3, gl.UNSIGNED_SHORT, 0); // uses currently bound buffer
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
}

