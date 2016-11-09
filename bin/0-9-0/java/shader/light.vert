#version 330

uniform highp mat4 u_matModelView;
uniform highp mat3 u_matNormal;
uniform highp mat4 u_matProjection;
uniform highp vec4 u_dirLights[16];
uniform lowp  int  u_dirLightCount;

in highp   vec3 in_position;
in mediump vec3 in_normal;
in mediump vec2 in_texCoord;

out highp   vec3 var_pos;
out lowp    vec3 var_color;
out mediump vec3 var_normal;
out mediump vec2 var_texCoord;

void main(void) {
	
	lowp    int  i;
	mediump vec4 l1;
	lowp    vec4 l2;
	highp   vec4 eyePos = u_matModelView * vec4(in_position, 1);
	
	float factor = 0.5;
	float offset = 0.5;
	
	var_normal   = normalize(u_matNormal * in_normal);
	var_color    = vec3(0, 0, 0);
	var_pos      = eyePos.xyz;
	var_texCoord = in_texCoord;
	
	for(i = 0; i < u_dirLightCount; i++) {
		
		l1 = u_dirLights[2 * i];
		l2 = u_dirLights[2 * i + 1];
		
		var_color += l2.rgb * max(dot(var_normal, l1.xyz) * l1.w + l2.w, 0);
	}
	
	gl_Position  = u_matProjection * eyePos;
}