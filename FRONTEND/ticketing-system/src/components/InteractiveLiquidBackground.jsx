import React, { useEffect, useRef } from 'react';

const InteractiveLiquidBackground = () => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const gl = canvas.getContext('webgl');

        if (!gl) {
            console.error('WebGL not supported');
            return;
        }

        // Vertex Shader: Simple quad covering the screen
        const vertexShaderSource = `
      attribute vec2 position;
      void main() {
        gl_Position = vec4(position, 0.0, 1.0);
      }
    `;

        // Fragment Shader: Liquid effect
        const fragmentShaderSource = `
      precision mediump float;
      
      uniform vec2 u_resolution;
      uniform float u_time;
      uniform vec2 u_mouse;
      
      const int AMOUNT = 10;
      
      void main() {
        vec2 coord = (gl_FragCoord.xy - u_resolution * 0.5) / min(u_resolution.y, u_resolution.x);
        float len;
        
        for (int i = 0; i < AMOUNT; i++){
          float strength = 1.0; 
          // Move center based on time and mouse
          // Adding mouse influence
          float mx = u_mouse.x / u_resolution.x;
          float my = (u_resolution.y - u_mouse.y) / u_resolution.y; // Flip Y for shader coords
          
          float t = u_time * (1.0 - (3.5 / float(i+1)));
          
          // Influence blobs with mouse
          float x = cos(t + coord.y * float(AMOUNT) + cos(t + mx * 5.0)) * 0.5;
          float y = sin(t + coord.x * float(AMOUNT) + sin(t + my * 5.0)) * 0.5;
          
          // Distort coords
          len = length(vec2(coord.x + x, coord.y + y));
          
          coord.x += cos(coord.y + sin(len)) + cos(t) / 10.0;
          coord.y += sin(coord.x + cos(len)) + sin(t) / 10.0;
        }
        
        // Color mapping
        
        float r = cos(len * 2.0 + 3.14/1.5); // Variation
        float g = cos(len * 2.0 + 3.14/2.5);
        float b = cos(len * 2.0);
        
        // Mix with a base deep color to prevent it being too chaotic
        vec3 col = vec3(r, g, b);
        
        // Shift towards purple/blue
        col = 0.5 + 0.5 * col;
        col = mix(col, vec3(0.4, 0.2, 0.9), 0.3);
        
        gl_FragColor = vec4(col, 1.0);
      }
    `;

        // Compile Shader Function
        const compileShader = (source, type) => {
            const shader = gl.createShader(type);
            gl.shaderSource(shader, source);
            gl.compileShader(shader);
            if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
                console.error('Shader compile error:', gl.getShaderInfoLog(shader));
                gl.deleteShader(shader);
                return null;
            }
            return shader;
        };

        const vertexShader = compileShader(vertexShaderSource, gl.VERTEX_SHADER);
        const fragmentShader = compileShader(fragmentShaderSource, gl.FRAGMENT_SHADER);

        if (!vertexShader || !fragmentShader) return;

        const program = gl.createProgram();
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);

        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            console.error('Program link error:', gl.getProgramInfoLog(program));
            return;
        }

        gl.useProgram(program);

        // Buffer setup
        const positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
            -1.0, -1.0,
            1.0, -1.0,
            -1.0, 1.0,
            -1.0, 1.0,
            1.0, -1.0,
            1.0, 1.0,
        ]), gl.STATIC_DRAW);

        const positionLocation = gl.getAttribLocation(program, 'position');
        gl.enableVertexAttribArray(positionLocation);
        gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

        const uResolution = gl.getUniformLocation(program, 'u_resolution');
        const uTime = gl.getUniformLocation(program, 'u_time');
        const uMouse = gl.getUniformLocation(program, 'u_mouse');

        // Use ResizeObserver to handle container resizing
        const resizeObserver = new ResizeObserver((entries) => {
            for (const entry of entries) {
                if (entry.target === canvas.parentElement) {
                    const width = entry.contentRect.width;
                    const height = entry.contentRect.height;

                    canvas.width = width * window.devicePixelRatio;
                    canvas.height = height * window.devicePixelRatio;

                    gl.viewport(0, 0, canvas.width, canvas.height);
                    gl.uniform2f(uResolution, canvas.width, canvas.height);
                }
            }
        });

        if (canvas.parentElement) {
            resizeObserver.observe(canvas.parentElement);
        }

        // Mouse handler - relative to canvas
        let mouse = { x: 0, y: 0 };
        const handleMouseMove = (e) => {
            const rect = canvas.getBoundingClientRect();
            mouse.x = (e.clientX - rect.left) * window.devicePixelRatio;
            mouse.y = (e.clientY - rect.top) * window.devicePixelRatio;
        };
        window.addEventListener('mousemove', handleMouseMove);

        // Animation Loop
        let startTime = Date.now();
        let animationFrameId;

        const render = () => {
            // Reduced speed to 0.0001 (was 0.0005)
            const time = (Date.now() - startTime) * 0.0001;
            gl.uniform1f(uTime, time);
            gl.uniform2f(uMouse, mouse.x, mouse.y);

            gl.drawArrays(gl.TRIANGLES, 0, 6);
            animationFrameId = requestAnimationFrame(render);
        };

        render();

        return () => {
            resizeObserver.disconnect();
            window.removeEventListener('mousemove', handleMouseMove);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 z-0 w-full h-full"
            style={{ width: '100%', height: '100%' }}
        />
    );
};

export default InteractiveLiquidBackground;
