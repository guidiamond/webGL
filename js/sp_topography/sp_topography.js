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

  // Lines setup
  const linePositionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, linePositionBuffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array(ctr_ind_array),
    gl.STATIC_DRAW
  );
  gl.vertexAttribPointer(
    programInfo.attribLocations.vertexPosition,
    3, // number of elements per attribute
    gl.FLOAT, // Type of elements
    gl.FALSE, // is normalized
    0, // stride
    0 // Offset from the beginning of a single vertex to this attribute
  );

  const lineColorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, lineColorBuffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([1.0, 1.0, 1.0, 1.0]),
    gl.STATIC_DRAW
  );

  const lineIndexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, lineIndexBuffer);

  const lineIndices = Array.from(Array(79).keys());

  gl.bufferData(
    gl.ELEMENT_ARRAY_BUFFER,
    new Uint16Array(lineIndices),
    gl.STATIC_DRAW
  );
  gl.useProgram(programInfo.program);

  return {
    position: positionBuffer,
    color: colorBuffer,
    indices: indexBuffer,

    linePosition: linePositionBuffer,
    lineColor: lineColorBuffer,
    lineIndices: lineIndexBuffer,
  };
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

// Importando arrays

let squareRotation = 0.0;

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

  // Rotina para contruir todos os buffers
  const buffers = initBuffers(gl, programInfo);
  const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;

  // Perspective (45deg 3:300 visible distance)
  const projectionMatrix = mat4.create();
  mat4.perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar);
  //
  // Render loop
  //
  let angle = 0; // defined outsite out loop for performance reasons
  function loop() {
    angle = (performance.now() / 1000 / rotationTime) * 2 * Math.PI; // rotation angle

    gl.clearColor(0.0, 0.0, 0.0, 1.0); // Black background color
    gl.clearDepth(1.0); // Clear depth buffer
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    const modelViewMatrix = mat4.create();

    // Rotation order: translate => rotate(x)  => rotate(z)
    mat4.translate(modelViewMatrix, modelViewMatrix, [0, 0, -100]);
    mat4.rotate(modelViewMatrix, modelViewMatrix, -Math.PI / 4, [1, 0, 0]); // fix ratio
    mat4.rotate(modelViewMatrix, modelViewMatrix, angle, [0, 0, 1]);

    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
    gl.vertexAttribPointer(
      programInfo.attribLocations.vertexPosition,
      3,
      gl.FLOAT,
      gl.FALSE,
      0,
      0
    );
    gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);

    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.color);
    gl.vertexAttribPointer(
      programInfo.attribLocations.vertexColor,
      4,
      gl.FLOAT,
      gl.FALSE,
      0,
      0
    );
    gl.enableVertexAttribArray(programInfo.attribLocations.vertexColor);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);

    gl.uniformMatrix4fv(
      programInfo.uniformLocations.projectionMatrix,
      false,
      projectionMatrix
    );
    gl.uniformMatrix4fv(
      programInfo.uniformLocations.modelViewMatrix,
      false,
      modelViewMatrix
    );
    gl.drawElements(gl.TRIANGLES, 6110 * 3, gl.UNSIGNED_SHORT, 0);

    /*
     * Lines drawing
     */
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.linePosition);
    gl.vertexAttribPointer(
      programInfo.attribLocations.vertexPosition,
      3,
      gl.FLOAT,
      gl.FALSE,
      0,
      0
    );
    gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);

    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.lineColor);
    gl.vertexAttribPointer(
      programInfo.attribLocations.vertexColor,
      4,
      gl.FLOAT,
      gl.FALSE,
      0,
      0
    );
    gl.enableVertexAttribArray(programInfo.attribLocations.vertexColor);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.lineIndices);

    gl.uniformMatrix4fv(
      programInfo.uniformLocations.projectionMatrix,
      false,
      projectionMatrix
    );
    gl.uniformMatrix4fv(
      programInfo.uniformLocations.modelViewMatrix,
      false,
      modelViewMatrix
    );

    gl.drawElements(gl.LINE_STRIP, 79, gl.UNSIGNED_SHORT, 0);

    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
}

// Initializa os shaders

