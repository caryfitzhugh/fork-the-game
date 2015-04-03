#pragma strict

var hold_distance : float = 1.5;
var alignObject : boolean = false;
var pickup_mask : LayerMask;

private var is_holding : boolean = false;
private var held_object : GameObject;
private var hold_height : float = 0;
private var level_settings : LevelGlobals = null;

function Awake() {
  level_settings = FindObjectOfType(LevelGlobals);
  if (!level_settings) {
    Debug.Log("No LevelGlobal found!");
  }
}

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
      if(Physics.Raycast(transform.position, transform.forward, hit_info, level_settings.interactionDistance, pickup_mask))
      {
        hit_info.collider.GetComponent.<Rigidbody>().isKinematic = true;  // remove from physics world, we will move it ourselves

        hit_info.collider.transform.parent = transform.parent;  // set object to be a child of the player (carrying it)

        held_object = hit_info.collider.gameObject;
        hold_height = held_object.transform.position.y;
        //Debug.Log("Hgt: " + hold_height);

        is_holding = true;
      }
    }
  }

  if (is_holding == true)
  {
    var target_position = transform.parent.position + transform.parent.forward * hold_distance;  // continue to align the held object with the camera
    held_object.transform.position.x = target_position.x;
    held_object.transform.position.z = target_position.z; // don't adjust the objects y-position to keep it on the floor
    held_object.transform.position.y = hold_height;
    // When moving / pickup a crate, sometimes we don't want to flip the orientation.
    if (alignObject == true) {
      held_object.transform.LookAt(new Vector3(transform.position.x, hold_height, transform.position.z));
    }
  }

}
