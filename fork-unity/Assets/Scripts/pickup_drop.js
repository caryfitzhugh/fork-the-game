#pragma strict

var pickup_distance : float = 2.0;
var hold_distance : float = 2.0;
var pickup_mask : LayerMask;

private var is_holding : boolean = false;
private var held_object : GameObject;

// init
function Start () {
}

// called every frame
function Update ()
{
  var hit_info : RaycastHit;

  if (is_holding == true)
  {
    held_object.transform.position = transform.position + transform.forward * hold_distance;  // continue to align the held object with the camera
  }

  if (Input.GetMouseButtonDown(0))
  {
    if (is_holding == true)
    {
      held_object.GetComponent.<Rigidbody>().isKinematic = false;
      held_object.transform.parent = null;
      held_object = null;
      is_holding = false;
    }
    else
    {
      if(Physics.Raycast(transform.position, transform.forward, hit_info, pickup_distance, pickup_mask))
      {
        hit_info.collider.GetComponent.<Rigidbody>().isKinematic = true;  // remove from physics world, we will move it ourselves

        hit_info.collider.transform.parent = transform.parent;  // set object to be a child of the player (carrying it)
        hit_info.collider.transform.position = transform.position;  // set object location to camera location
        hit_info.collider.transform.position += transform.forward * hold_distance; // vector math gives us a point in front of the camera
        
        
        held_object = hit_info.collider.gameObject;
        is_holding = true;
      }
    }
  }
}
