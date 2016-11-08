#version 330

uniform highp vec4      u_pointLights[16];
uniform lowp  int       u_pointLightCount;
uniform lowp  vec4      u_color;
uniform lowp  sampler2D u_texture;

in highp   vec3 var_pos;
in lowp    vec3 var_color;
in mediump vec3 var_normal;
in mediump vec2 var_texCoord;

out lowp vec4 out_color;

void main(void) {
	
	lowp    int   i;
	highp   vec4  l1;
	lowp    vec4  l2;
	mediump float dist;
	lowp    vec3  lightColor = vec3(0, 0, 0);
	mediump vec3  normal     = normalize(var_normal);
	mediump vec3  lightVec;
	
	for(i = 0; i < u_pointLightCount; i++) {
		
		l1 = u_pointLights[2 * i];
		l2 = u_pointLights[2 * i + 1];
		
		lightVec = l1.xyz - var_pos;
		
		lightColor +=
			l2.rgb *                                           // Basic color
			pow(max(1.0 - length(lightVec) / l1.w, 0), l2.a) * // Attenuation
			max(dot(normalize(lightVec), normal), 0.0);        // Intensity
	}
	
	//out_color = vec4(var_color, 1) * u_color * texture(u_texture, var_texCoord);
	//out_color = vec4(lightColor + var_color, 1) * texture(u_texture, var_texCoord);
	//out_color = vec4(0, dist / 4, 0, 1);
	out_color = vec4(var_color + lightColor, 1) * u_color * texture(u_texture, var_texCoord);
	//out_color = vec4(var_color, 1);
	//out_color = u_color * texture(u_texture, var_texCoord);
}