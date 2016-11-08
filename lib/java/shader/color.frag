#version 330

uniform lowp    vec4      u_color;
uniform mediump sampler2D u_texture;

in mediump vec2 var_texCoord;

out lowp vec4 out_color;

void main(void) {
	
	out_color = u_color * texture(u_texture, var_texCoord);
}