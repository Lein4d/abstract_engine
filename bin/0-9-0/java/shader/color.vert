#version 330

uniform highp mat4 u_matModelView;
uniform highp mat4 u_matProjection;

in highp   vec3 in_position;
in mediump vec2 in_texCoord;

out mediump vec2 var_texCoord;

void main(void) {
	
	var_texCoord = in_texCoord;
	gl_Position  = u_matProjection * (u_matModelView * vec4(in_position, 1));
}