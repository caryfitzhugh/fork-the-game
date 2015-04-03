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
        held_object = hit_info.collider.gameObject;
        held_object.transform.position.y = held_object.transform.position.y + 0.5;

        // When moving / pickup a crate, sometimes we don't want to flip the orientation.
        if (alignObject == true) {
          held_object.transform.LookAt(new Vector3(transform.position.x, hold_height, transform.position.z));
        }

        // Add the joint
        lift_joint = gameObject.AddComponent(FixedJoint);
        lift_joint.connectedBody = held_object.GetComponent.<Rigidbody>();
      }
    }
  }
}
