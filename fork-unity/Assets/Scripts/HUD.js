#pragma strict

var crosshairColor = Color.white; //The crosshair color
var width : float = 3; //Crosshair width
var height : float = 35; //Crosshair height
var spread : float = 20; // Distance apart
 
private var texture : Texture2D;
private var lineStyle : GUIStyle;

function Start () {
  texture = Texture2D(1,1);   // 1-pixel texture
   
  set_color(texture, crosshairColor);
   
  lineStyle = GUIStyle();
  lineStyle.normal.background = texture;
}

function OnGUI () {
  var centerPoint = Vector2(Screen.width / 2, Screen.height / 2);
  GUI.Box(Rect(centerPoint.x - width / 2, centerPoint.y - (height + spread), width, height), "", lineStyle);
  GUI.Box(Rect(centerPoint.x - width / 2, centerPoint.y + spread, width, height), "", lineStyle);
  GUI.Box(Rect(centerPoint.x + spread, (centerPoint.y - width / 2), height , width), "", lineStyle);
  GUI.Box(Rect(centerPoint.x - (height + spread), (centerPoint.y - width / 2), height , width), "", lineStyle);
}
 
//Applies color to the crosshair
function set_color(texture : Texture2D, color : Color) {
  for (var y : int = 0; y < texture.height; ++y) {
    for (var x : int = 0; x < texture.width; ++x) {
      texture.SetPixel(x, y, color);
    }
  }
  texture.Apply();
}
