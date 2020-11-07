// Vertex shader
const vertexShaderSource = `
            attribute vec4 vertPosition;
            attribute vec4 vertColor;

            uniform mat4 mView;
            uniform mat4 mProj;

            varying lowp vec4 vColor;

            void main() {
                gl_Position = mProj * mView * vertPosition;
                vColor = vertColor;
            }
        `;

const fragmentShaderSource = `
            varying lowp vec4 vColor;
            
            void main() {
                gl_FragColor = vColor;
            }
        `;
