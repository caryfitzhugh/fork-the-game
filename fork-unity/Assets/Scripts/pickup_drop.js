#pragma strict

var pickup_distance : float = 2.0;
var hold_distance : float = 0.0;
var pickup_mask : LayerMask;

var speed : float = 10.0;
var threshold : float = 0.5;

private var is_holding : boolean = false;
private var held_object : GameObject;

// init
function Start () {
}

// called every frame
function Update ()
{
  var hit_info : RaycastHit;

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

        held_object = hit_info.collider.gameObject;

        is_holding = true;
      }
    }
  }

  if (is_holding == true)
  {
    Debug.Log("tween this would be nice..");
    held_object.transform.localPosition = new Vector3(0,0,1.5);
    held_object.transform.position.y = held_object.GetComponent.<Renderer>().bounds.size.y / 2;
		held_object.transform.LookAt(new Vector3(transform.position.x, 0.5, transform.position.z));
  }

}
