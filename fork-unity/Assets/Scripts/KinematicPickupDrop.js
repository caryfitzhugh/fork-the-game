#pragma strict

var hold_distance : float = 1.5;
var alignObject : boolean = false;
var pickup_mask : LayerMask;

private var held_object : GameObject;
private var hold_height : float = 0;
private var level_settings : LevelGlobals = null;
private var lift_joint : FixedJoint = null;

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

  if (Input.GetMouseButtonDown(0) || Input.GetKey(KeyCode.Space))
  {
    if (lift_joint)
    {
      Destroy(lift_joint);
      lift_joint = null;
    }
    else
    {
      if(Physics.Raycast(transform.position, transform.forward, hit_info, level_settings.interactionDistance, pickup_mask))
      {
        if (hit_info.collider.gameObject.layer == 8) { // this is the pickup layer -- why oh why is it referenced by index?
          held_object = hit_info.collider.gameObject;
          held_object.transform.position.y = held_object.transform.position.y + 0.5;
          hold_height = held_object.transform.position.y;

          // When moving / pickup a crate, sometimes we don't want to flip the orientation.
          if (alignObject == true) {
            held_object.transform.LookAt(new Vector3(transform.position.x, hold_height, transform.position.z));
          }

          // Add the joint
          lift_joint = held_object.AddComponent(FixedJoint);
          lift_joint.connectedBody = gameObject.transform.parent.gameObject.GetComponent.<Rigidbody>(); // we are just the camera, our parent is the one with the rigidbody
        } else {  // else it is 11, the interaction layer :-P
          hit_info.collider.gameObject.SendMessage("activate", true);
        }
      }
    }
  }
}
