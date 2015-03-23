#pragma strict

var triggerObject : GameObject;
var playerTriggers : boolean;
var targetObject : GameObject;

var object_present : boolean = false;
var player_present : boolean = false;

// calls targetObject object_activate(boolean) when the triggerObject or player enters/exits the object
// maintains state such that only valid entries/exits trigger the action
function OnTriggerEnter(object : Collider) {
  var is_object = object.gameObject == triggerObject;
  var is_player = object.CompareTag("Player");

  var object_triggered = is_object && !object_present && (!playerTriggers || !player_present);
  var player_triggered = playerTriggers && is_player && !player_present && !object_present;

  if (is_player) player_present = true;
  if (is_object) object_present = true;
  
  if (object_triggered || player_triggered) {
    targetObject.SendMessage("object_activate", true);
  }

}

function OnTriggerExit(object : Collider) {
  var is_object = object.gameObject == triggerObject;
  var is_player = object.CompareTag("Player");

  var object_triggered = is_object && object_present && (!playerTriggers || !player_present);
  var player_triggered = playerTriggers && is_player && player_present && !object_present;

  if (is_player) player_present = false;
  if (is_object) object_present = false;

  if (object_triggered || player_triggered) {
    targetObject.SendMessage("object_activate", false);
  }

}
