#pragma strict

var targetObject : GameObject;

// calls targetObject object_activate(boolean) when the player enters/exits the object
// simple, I assume the player will never have more entries than exits
function OnTriggerEnter(object : Collider) {

  if (object.CompareTag ("Player")) {
    targetObject.SendMessage("object_activate", true);
  }

}

function OnTriggerExit(object : Collider) {

  if (object.CompareTag ("Player")) {
    targetObject.SendMessage("object_activate", false);
  }

}
