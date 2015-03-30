#pragma strict

public var tracking_range : float = 5.0;

// This is the mask we use to determine which objects to track
public var trackable_type  = "PolarityIndicator";

private var nearby_objects =  {};
private var nearby_object_tracker : GameObject;
private var nearby_object_collider : SphereCollider;

// You want to create the rigidbody here
// to track when things are nearby (or not)!
function Start () {
   nearby_object_tracker = new GameObject();
   nearby_object_tracker.transform.parent = this.transform;

   nearby_object_collider = nearby_object_tracker.AddComponent.<SphereCollider>();
   nearby_object_collider.isTrigger = true;
   nearby_object_collider.radius = tracking_range;
};

function OnTriggerEnter (other : Collider) {
  if (nearby_objects.Contains(other.gameObject.GetInstanceID())){
    //Debug.Log("What? Error! - Already here");
  } else {
    // Make sure it's part of the Layer we want (or Tagged as we want it to be).
    if (other.gameObject.GetComponent.<PolarityIndicator>()) {
      nearby_objects.Add(other.gameObject.GetInstanceID(), other.gameObject);
    }
  }
};

function OnTriggerStay (other : Collider) {

};

function OnTriggerExit (other : Collider) {
  if (!nearby_objects.Contains(other.gameObject.GetInstanceID())){
    Debug.Log("What? Error! - Leaving but not here");
  } else {
    nearby_objects.Remove(other.gameObject.GetInstanceID());
  }
};

function FixedUpdate () {
  gameObject.SendMessage("calculate_magnetic_force", nearby_objects);
};
