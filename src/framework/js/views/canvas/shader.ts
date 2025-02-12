const vertexShaderSrc = `#version 300 es
in vec2 a_position;        //当前点
uniform vec2 u_windowsize; //当前屏幕可视区域大小
uniform vec2 u_ruleweight; //标尺的坐标
in vec4 a_color;    //颜色
in vec2 a_texCoord; //纹理

uniform float f_ratio;
uniform float f_rat1;
uniform vec2 u_wpv;

out vec2 v_texCoord;

out vec2 v_position;

out vec4 v_color;

void main() {
   vec2 halfWindowSize = u_windowsize * 0.5;
   
   vec2 clipedPoint = a_position + u_wpv - u_ruleweight;// 经过剪切区域处理后的点

   vec2 zeroToOne =(clipedPoint - halfWindowSize) / u_windowsize;
    //缩放比例
   vec2 zeroToTwo = zeroToOne * f_ratio;

   gl_Position = vec4(zeroToTwo * vec2(1, -1), 0, 1);

   v_texCoord = a_texCoord;
   
   v_position = a_position;
   v_color = a_color;
}`;


const fragmentShaderSrc = `#version 300 es
precision mediump float;

// our texture
uniform sampler2D u_texture;

uniform sampler2D bg_texture;

uniform sampler2D temp_texture;

// the texCoords passed in from the vertex shader.
in vec2 v_texCoord;

in vec2 v_position;

in vec4 v_color;

// we need to declare an output for the fragment shader
out vec4 outColor;

void main() {
    vec4 textureColor;
    vec4 bgTextureColor;
    if(v_texCoord.x != 0.0){//读取图形纹理
      textureColor = texture(u_texture, v_texCoord);
    }
    if(v_color.x == -1.0){//读取背景纹理
      bgTextureColor = texture(bg_texture, v_texCoord);
    }
    
    if(textureColor.a != 0.0 && bgTextureColor.a != 0.0){
      outColor = textureColor * bgTextureColor;
    }else if(textureColor.a != 0.0){
      outColor = textureColor;
    }else if(bgTextureColor.a != 0.0){
      outColor = bgTextureColor;
    }else{
      outColor = v_color;
    }
  
}`;

export { vertexShaderSrc, fragmentShaderSrc }