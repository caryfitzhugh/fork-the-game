#pragma strict
import System.Collections.Generic;

// Lift Tube
//
// Currently only works in horizontal orientation
// tube object must have a collider attached that defines the area below the mouth

var liftLayer: LayerMask;
var horizPower : float = 3;
var vertVelocity : float = 2;

private var level_settings : LevelGlobals = null;
private var tracking = new List.<GameObject>();
private var effect_radius : float = 1;

function Awake() {
  level_settings = FindObjectOfType(LevelGlobals);
  if (!level_settings) {
    Debug.Log("No LevelGlobal found!");
  }
}

function Start() {
  effect_radius = GetComponent.<Collider>().bounds.extents.x + .5;
}

function OnTriggerEnter(object : Collider) {
  var go = object.gameObject;
  if(!tracking.Contains(go)){
      tracking.Add(go);
      //Debug.Log("Adding: " + tracking.Count);
  }
}

function OnTriggerExit(object : Collider) {
  tracking.Remove(object.gameObject);
  //Debug.Log("Removing: " + tracking.Count);
}

function FixedUpdate() {
  var object_rbody : Rigidbody;
  var balance : float;
  var mouth_vector : Vector3;   // vector toward mouth of tube
  var center_vector : Vector3;

  // this is the effect that carries the object inwards and up toward the mouth of the tube
  for (var object : GameObject in tracking) {
    // var parent = transform.parent;
    // var carried = (parent != null && parent.gameObject.tag == "Player");
    object_rbody = object.GetComponent.<Rigidbody>();
    if (object_rbody) {
      balance = -1.0 * Physics.gravity.y * object_rbody.mass;
      mouth_vector = transform.position - object.transform.position;   // vector toward mouth of tube
      center_vector = Vector3(mouth_vector.x, 0, mouth_vector.z);
      //Debug.Log("Ctr vector: " + center_vector);
      var centering_force = 1 - Mathf.Clamp(center_vector.magnitude / effect_radius, 0, 1);
      //Debug.Log("Ctr force: " + centering_force);
      object_rbody.AddForce(center_vector * centering_force * horizPower * object_rbody.mass);

      var target_height = .6 + (1.12 * centering_force); // size cube / distance from cube on floor to cube top at mouth
      var error = target_height - object.transform.position.y;
      //Debug.Log("error: " + error);
      if (error > 0) {
        var throttle = Mathf.Min(error / transform.position.y, 1);  // calculated throttle value normalized
        //Debug.Log("throttle: " + throttle);
        var thrust = balance * ((throttle * .3) + 1); // .3 is the sensitivity of the up thrust to the error amount
        //Debug.Log("Up thrust: " + thrust);
        object_rbody.AddForce(Vector3.up * thrust);
      }
    }
  }

  // this is the effect for objects in the tube or very close to it. The ray picks the closest object and 
  // provides additional force to suck it in past others that may be jamming the mouth
  // then it matches the given velocity for travel through the tube
  var hits : RaycastHit[];
  var ray_start = transform.position + (Vector3.up * (level_settings.structure.ceilingHeight + 2));
  var ray_end = transform.position + (Vector3.down * .25);  // ray extend juuust a bit out of the mouth
  var ray_vector = ray_end - ray_start;
  hits = Physics.RaycastAll(ray_start, ray_vector, ray_vector.magnitude, liftLayer);
  //Debug.DrawLine(ray_start, ray_end, Color.green);
  
  for (var i = 0;i < hits.Length; i++) {
    var hit_info : RaycastHit = hits[i];
    object_rbody = hit_info.rigidbody;
    var object_transform = hit_info.transform;
    if (object_transform.position.y > (level_settings.structure.ceilingHeight + 1)) {
      Destroy(object_transform.gameObject);   // object is above the ceiling, destroy it
    } else if (object_rbody) {
      balance = -1.0 * Physics.gravity.y * object_rbody.mass;
      mouth_vector = transform.position - object_transform.position;   // vector toward mouth of tube
      center_vector = Vector3(mouth_vector.x, 0, mouth_vector.z); // vector to centerline of tube
      var vert_throttle = (vertVelocity - object_rbody.velocity.y) / vertVelocity; // calculated throttle value normalized
      var vert_thrust = balance * (vert_throttle + 1);
      var vert_vector = Vector3.up * vert_thrust;
      object_rbody.AddForce(vert_vector + (center_vector * horizPower));
      //Debug.Log("Lifting!");

      if (object_transform.position.y > (level_settings.structure.ceilingHeight - 1)) {
        // allow the object to pass through the ceiling
        Physics.IgnoreCollision(hit_info.collider, level_settings.structure.collider);
      }
    }
  }
}
