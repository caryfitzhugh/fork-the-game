#pragma strict
public var magnetize_mask: LayerMask;
private var level_settings : LevelGlobals = null;

function Awake() {
  level_settings = FindObjectOfType(LevelGlobals);
  if (!level_settings) {
    Debug.Log("No LevelGlobal found!");
  }
}

function Start () {

}
function OnGUI(){
  GUI.Label(Rect(0,0,Screen.width,Screen.height),"  p or esc ) Removes Polarity\n  [ or q ) Add BLUE\n  ] or e ) Add RED");
}
function Update () {
  var hit_info : UnityEngine.RaycastHit;

  if (Input.GetKey(KeyCode.LeftBracket) || Input.GetKey(KeyCode.RightBracket) || Input.GetKey(KeyCode.P)
      || Input.GetKey(KeyCode.Q) || Input.GetKey(KeyCode.E) || Input.GetKey(KeyCode.Escape)) {

    if (Physics.Raycast(transform.position, transform.forward, hit_info, level_settings.interactionDistance, magnetize_mask)) {
      //Debug.Log(hit_info.collider);
      if (Input.GetKey(KeyCode.LeftBracket) || Input.GetKey(KeyCode.Q)) {
        hit_info.collider.gameObject.SendMessage("set_polarity", MagPolarity.Positive);
      } else if (Input.GetKey(KeyCode.RightBracket) || Input.GetKey(KeyCode.E)) {
        hit_info.collider.gameObject.SendMessage("set_polarity", MagPolarity.Negative);
      } else if (Input.GetKey(KeyCode.P) || Input.GetKey(KeyCode.Escape) ) {
        hit_info.collider.gameObject.SendMessage("set_polarity", MagPolarity.None);
      }
    }
  }
}
