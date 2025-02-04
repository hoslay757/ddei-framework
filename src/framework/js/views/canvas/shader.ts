const vertexShaderSrc = `#version 300 es
in vec2 a_position;        //当前点
uniform vec2 u_resolution; //当前屏幕可视区域大小
uniform vec2 u_ruleweight; //标尺的坐标
in vec4 a_color;    //颜色
in vec3 a_texCoord;

uniform float f_ratio;
uniform vec2 u_worldSpace;

out vec3 v_texCoord; 

out vec2 v_position;

out vec4 v_color;

void main() {

   //将中心点坐标变为左上角坐标
   vec2 halfWinSize = u_resolution * 0.5;
   vec2 newPos = a_position - halfWinSize;
   //减去标尺坐标
   vec2 newPos1 = newPos - u_ruleweight;
   vec2 zeroToOne = newPos1 / u_resolution;
   //缩放比例
   vec2 zeroToTwo = zeroToOne * f_ratio;
   //窗口剪切区
   vec2 clipSpace = zeroToTwo + u_worldSpace;
   

   gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
   v_texCoord = a_texCoord;
   v_position = a_position;
   v_color = a_color;
}`;


const fragmentShaderSrc = `#version 300 es
precision mediump float;
precision mediump sampler2DArray;

// our texture
uniform sampler2DArray u_image;

uniform int gridDisplay; //纸张开始点坐标X

uniform float paperStartX; //纸张开始点坐标X

uniform float paperStartY; //纸张开始点坐标Y

uniform float paperRectX; //纸张区域X

uniform float paperRectY; //纸张区域Y

uniform float paperRectX1; //纸张区域X1

uniform float paperRectY1; //纸张区域Y1

uniform vec3 paperSize; //单个纸张大小

uniform float gridWeight; //网格宽度

uniform float paperWeight; //纸张分界线宽度

uniform float gridSplitedWeight; //网格分割大小

uniform vec4 gridColor; //网格颜色



// the texCoords passed in from the vertex shader.
in vec3 v_texCoord;

in vec2 v_position;

in vec4 v_color;

// we need to declare an output for the fragment shader
out vec4 outColor;

void main() {
    if(v_position.x >= paperRectX && v_position.x <= paperRectX1
        && v_position.y >= paperRectY && v_position.y <= paperRectY1){
      if(paperSize.z == 1.0){
        //最外围边线
        if(abs(v_position.x - paperRectX) <= paperWeight || abs(v_position.x - paperRectX1) <= paperWeight || abs(v_position.y - paperRectY) <= paperWeight || abs(v_position.y - paperRectY1) <= paperWeight){
          outColor = vec4(0.5,0.5,0.5,1.0);
          return;
        }
        //竖线  
        else if(abs(mod(v_position.x - paperStartX,paperSize.x)) <= paperWeight && floor(mod((v_position.y-paperStartY)/10.0,2.0)) == 0.0 ){
          outColor = vec4(0.5,0.5,0.5,1.0);
          return;
        }
        //横线  
        else if(abs(mod(v_position.y - paperStartY,paperSize.y)) <= paperWeight && floor(mod((v_position.x-paperStartX)/10.0,2.0)) == 0.0){
          outColor = vec4(0.5,0.5,0.5,1.0);
          return;
        }
      }
      if(gridDisplay == 1){
        if(abs(mod(v_position.x - paperStartX,gridSplitedWeight)) <= gridWeight || abs(mod(v_position.y - paperStartY,gridSplitedWeight)) <= gridWeight){
          outColor = gridColor;
          return;
        }
      }else if(gridDisplay == 2){
        if(abs(mod(v_position.x - paperStartX,gridSplitedWeight)) <= gridWeight && abs(mod(v_position.y - paperStartY,gridSplitedWeight)) <= gridWeight){
          outColor = gridColor;
          return;
        }
      }
    }
    outColor = v_color;
}`;

export { vertexShaderSrc, fragmentShaderSrc }