uniform float time;
uniform float progress;
uniform sampler2D uTexture;
uniform sampler2D uTexture2;
uniform vec4 resolution;
uniform float uCurrent;
varying vec2 vUv;
varying vec3 vPosition;
float PI = 3.141592653589793238;
void main()	

{
	// vec2 newUV = (vUv - vec2(0.5))*resolution.zw + vec2(0.5);

	vec4 image = texture2D( uTexture, vUv );
	vec4 image1 = texture2D( uTexture2, vUv );

	vec4 finalImage = image1;

	if( uCurrent == 1. )
	{
		vec4 finalImage = mix( image, image1, progress);
	}
	else if( uCurrent == 0. )
	{
		vec4 finalImage = mix( image1, image, progress);
	}

	//vec4 finalImage = mix( image, image1, progress);

	
	//gl_FragColor = vec4( vUv, 1., 1.);
	gl_FragColor = finalImage;
	if( gl_FragColor.r < 0.1 && gl_FragColor.g < 0.1 && gl_FragColor.b < 0.1 ) 
	{
		discard;
	}

}