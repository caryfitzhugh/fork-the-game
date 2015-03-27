#pragma strict

public var tracking_range : float = 1.0;

// This is the mask we use to determine which objects to track
public var detection_mask: LayerMask;

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
    Debug.Log("What? Error! - Already here");
  } else {
    // Make sure it's part of the Layer we want (or Tagged as we want it to be).
    nearby_objects.Add(other.gameObject.GetInstanceID(), other.gameObject);
  }
};

function OnTriggerStay (other : Collider) {
//  Debug.Log("staying:");
 // Debug.Log(other);
  if (!nearby_objects.Contains(other.gameObject.GetInstanceID())){
    Debug.Log("What? Error! - It's stay - but not here");
  }
};

function OnTriggerExit (other : Collider) {
  if (!nearby_objects.Contains(other.gameObject.GetInstanceID())){
    Debug.Log("What? Error! - Leaving but not here");
  } else {
    nearby_objects.Remove(other.gameObject.GetInstanceID());
  }
};

function FixedUpdate () {
  Debug.Log("There are " + nearby_objects.Count + " nearby!");
};
