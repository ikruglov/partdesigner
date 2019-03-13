class ContourPostEffect implements Renderer {

	shader: Shader;
    positions: WebGLBuffer;    
    
    constructor() {
        this.shader = new Shader(gl, COUNTOUR_VERTEX, CONTOUR_FRAGMENT);

		this.shader.setAttribute(gl, "vertexPosition");
		
		this.positions = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.positions);
		var positions: number[] = [-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1];
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
    }

    public render(camera: Camera) {
        gl.bindBuffer(gl.ARRAY_BUFFER, this.positions);
        gl.vertexAttribPointer(this.shader.attributes["vertexPosition"], 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(this.shader.attributes["vertexPosition"]);
      
        gl.useProgram(this.shader.program);
		
		gl.depthFunc(gl.ALWAYS);
		gl.depthMask(false);
		
        gl.drawArrays(gl.TRIANGLES, 0, 6);
		gl.depthFunc(gl.LEQUAL);
		gl.depthMask(true);
    }
}