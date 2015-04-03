#pragma strict

// Lift Tube

var liftLayer: LayerMask;
var horizPower : float = 1;
var vertVelocity : float = 1;
var vertPower : float = 1;
var balance : float = 98;

private var level_settings : LevelGlobals = null;

function Awake() {
  level_settings = FindObjectOfType(LevelGlobals);
  if (!level_settings) {
    Debug.Log("No LevelGlobal found!");
  }
}

function OnTriggerStay (object : Collider) {
  // var parent = transform.parent;
  // var carried = (parent != null && parent.gameObject.tag == "Player");
  var object_rbody = object.attachedRigidbody;
  if (object_rbody) {
    var vector = (transform.position - object.transform.position);
    var horiz_vector = Vector3(vector.x, 0, vector.z);
    var horiz_thrust = horiz_vector * horizPower;
    object_rbody.AddForce(horiz_thrust);
    //Debug.Log("centering");
  }
}

function FixedUpdate() {
  var hits : RaycastHit[];
  hits = Physics.RaycastAll(transform.position + (Vector3.up * 7), Vector3.down, 8, liftLayer);
  Debug.DrawLine(transform.position + (Vector3.up * 7), transform.position + (Vector3.down * 8), Color.green);
  
  for (var i = 0;i < hits.Length; i++) {
    var hit_info : RaycastHit = hits[i];
    var object_rbody = hit_info.rigidbody;
    if (hit_info.transform.position.y > (level_settings.structure.ceilingHeight + 1)) {
      Destroy(hit_info.transform.gameObject);   // object is above the ceiling, dstroy iy
    } else if (object_rbody) {
      var center_vector = (transform.position - hit_info.transform.position);   // "error" vector of object centering
      var horiz_throttle = 1.0 - Vector3(center_vector.x, 0, center_vector.z).magnitude;  // normalized center offset amount
      var vert_velocity_target = vertVelocity * horiz_throttle * horiz_throttle;  // velocity should falloff with distance^2
      var vert_throttle = (vert_velocity_target - object_rbody.velocity.y) / vert_velocity_target; // calculated throttle value normalized
      var vert_thrust = ((vert_throttle * balance) + balance);
      var vert_vector = Vector3.up * vert_thrust * vertPower;
      object_rbody.AddForce(vert_vector);
      //Debug.Log("lifting");
      if (hit_info.transform.position.y > (level_settings.structure.ceilingHeight - 1)) {
        // allow the object to pass through the ceiling
        Physics.IgnoreCollision(hit_info.collider, level_settings.structure.collider);
      }
    }
  }
}
