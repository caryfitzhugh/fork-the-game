#pragma strict

var triggerTag : String;
var playerTriggers : boolean;
var targetObject : GameObject;

private var trigger_count = 0;

// calls targetObject object_activate(boolean) when an object with the triggerTag enters/exits the object
// This DOES NOT properly count the objects because the way pickup works, objects can enter twice
function OnTriggerEnter(object : Collider) {
  if (trigger_count < 0) Debug.Log("Trigger count < 0!");

  var is_object = object.CompareTag(triggerTag);
  var is_player = object.CompareTag("Player");

  if (is_object || (playerTriggers && is_player)) {
    if (trigger_count == 0) {
      targetObject.SendMessage("object_activate", true);
    }
    trigger_count++;
    //Debug.Log("Trigger up! " + trigger_count + "p: " + object.CompareTag ("Player"));
  }

}

function OnTriggerExit(object : Collider) {
  var is_object = object.CompareTag(triggerTag);
  var is_player = object.CompareTag("Player");

  if (is_object || (playerTriggers && is_player)) {
    trigger_count--;
    if (trigger_count == 0) {
      targetObject.SendMessage("object_activate", false);
    }
    //Debug.Log("Trigger down! " + trigger_count + "p: " + object.CompareTag ("Player"));
  }

}
