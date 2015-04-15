#pragma strict

var crosshairColor = Color.white; //The crosshair color
var width : float = 3; //Crosshair width
var height : float = 35; //Crosshair height
var spread : float = 50; // Distance apart

class tracking_opts {
  var trackLayers: LayerMask;
  var minSpread = 15.0;
  var spreadPerSecond = 45.0;
  var decreasePerSecond = 150.0;
}

var tracking : tracking_opts;

private var texture : Texture2D;
private var lineStyle : GUIStyle;
private var maxSpread = 50.0;
private var level_settings : LevelGlobals = null;

function Awake() {
  level_settings = FindObjectOfType(LevelGlobals);
  if (!level_settings) {
    Debug.Log("No LevelGlobal found!");
  }
}

function Start () {
  texture = Texture2D(1,1);   // 1-pixel texture

  set_color(texture, crosshairColor);

  lineStyle = GUIStyle();
  lineStyle.normal.background = texture;
}

function Update () {
  var hit_info : RaycastHit;
  if (Physics.Raycast(transform.position, transform.forward, hit_info, level_settings.interactionDistance, tracking.trackLayers))
  {
    spread -= tracking.decreasePerSecond * Time.deltaTime;
  } else {
    spread += tracking.spreadPerSecond * Time.deltaTime;
  }
  spread = Mathf.Clamp(spread, tracking.minSpread, maxSpread); 
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
