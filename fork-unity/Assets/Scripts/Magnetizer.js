#pragma strict
public var magnetize_distance = 3.0;
public var magnetize_mask: LayerMask;

function Start () {

}
function OnGUI(){
  GUI.Label(Rect(0,0,Screen.width,Screen.height),"P) Removes Polarity\n[) Add BLUE\n]) Add RED");
}
function Update () {
  var hit_info : UnityEngine.RaycastHit;

  if (Input.GetKey(KeyCode.LeftBracket) || Input.GetKey(KeyCode.RightBracket) || Input.GetKey(KeyCode.P)) {
    if (Physics.Raycast(transform.position, transform.forward, hit_info, magnetize_distance, magnetize_mask)) {
      //Debug.Log(hit_info.collider);

      if (Input.GetKey(KeyCode.LeftBracket) ) {
        hit_info.collider.gameObject.SendMessage("set_polarity", MagPolarity.Positive);
      } else if (Input.GetKey(KeyCode.RightBracket)) {
        hit_info.collider.gameObject.SendMessage("set_polarity", MagPolarity.Negative);
      } else if (Input.GetKey(KeyCode.P) ) {
        hit_info.collider.gameObject.SendMessage("set_polarity", MagPolarity.None);
      }
    }
  }
}
