#pragma strict

private var overhead_light : Light = null;
private var idle_display : Transform = null;

function Start () {
  overhead_light = gameObject.GetComponentInChildren(Light);
  idle_display = transform.Find("Display"); // an item that is shown prior to triggering
}

function Update () {

}

function receptacle_status(new_state : ReceptacleState) {
  if (new_state == ReceptacleState.Capture) {  // once something is captured, turn off the display
    if (idle_display != null) {
      idle_display.GetComponent.<Renderer>().enabled = false;
    }
  } else if (new_state == ReceptacleState.Complete) { // once a crate is fully captured, color the light
    if (overhead_light != null) {
      overhead_light.color = Color.green;
    }
  }
}