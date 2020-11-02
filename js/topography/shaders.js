// Each time a vertex shader is executed
// the next value from each specified buffer
// is pulled out and assigned to an attribute.
const vertexShaderSource = `
    precision mediump float;

    attribute vec3 vertPosition; // inputs that come from buffer
    attribute vec3 vertColor; // inputs that come from buffer
    varying vec3 fragColor; // value that can be accessed by the frag shader (interpolated while executing)
    uniform mat4 mView; // where the camera is sitting at (global variable)
    uniform mat4 mProj; // (global variable)

    void main() {
      fragColor = vertColor;
      gl_Position = mProj * mView  * vec4(vertPosition, 1.0);
    }
  `;

const fragmentShaderSource = `
    precision mediump float;
    varying vec3 fragColor;

    void main() {
      gl_FragColor = vec4(fragColor, 1.0); // rgba format
    }
  `;
