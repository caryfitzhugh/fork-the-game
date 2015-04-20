#pragma strict
import System.Collections.Generic;

// Surface Effect
// Surface effect will apply forces to objects that are within the surface collider
// The surface collider should be oriented in the +Z direction and be set to trigger
// Mesh renderer and mesh collider can be disabled

var hoverHeight : float = .5;

var velocity : float = 3;
var acceleration : float = 0;
var centering : float = 1;

private var tracking = new List.<GameObject>();
private var force_manager : SurfaceEffectManager = null;

function Awake() {
  force_manager = FindObjectOfType(SurfaceEffectManager);
  if (!force_manager) {
    Debug.Log("No SurfaceEffectManager found!");
  }
}

function Start () {
}

function Update () {
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
  for (var object : GameObject in tracking) {
    // var parent = transform.parent;
    // var carried = (parent != null && parent.gameObject.tag == "Player");
    var object_rbody = object.GetComponent.<Rigidbody>();
    if (object_rbody) {
      var object_transform = object.gameObject.transform;
      if (hoverHeight > 0) {
        var balance = -1.0 * Physics.gravity.y * object_rbody.mass;
        //var balance = 19.0; // this works a little bit better for player, like his mass is off
        var object_renderer = object.gameObject.GetComponent.<Renderer>();
        var object_height : float;  // this is actually half the height, fyi
        if (object_renderer) { object_height = object_renderer.bounds.extents.y; }
          else if (object.tag == "Player") { object_height = 1; } // could check player collider height
          else object_height = 1;
        var target_height = transform.position.y + object_height + hoverHeight;
        //var throttle : float = Mathf.Clamp((target_height - object_transform.position.y)/10, -.01, .2);  // 20/mass -mass/100, mass/10 but player balance is off, it seems
        var throttle : float = Mathf.Clamp((target_height - object_transform.position.y)/2, -.1, 1);  // calculated throttle value normalized
        var thrust = balance * (throttle + 1);
        // Debug.Log("Target hgt: " + target_height + " Curr hgt: " + object_transform.position.y);
        // Debug.Log("Throttle: " + throttle + " Thrust: " + thrust);
        // Debug.Log("Balance: " + balance + " Delta: " + (thrust - balance));
        force_manager.apply_force(Vector3.up * thrust, object_rbody, SurfaceType.Convey);
      } // end vertical displacement
      var object_velocity = Vector3.ProjectOnPlane(object_rbody.velocity, Vector3.up);  // current x-z velocity
      if (acceleration > 0) {
        if (object_velocity.magnitude > .1) {
          var object_direction = object_velocity.normalized;    // not normalizing will accelerate fast bodies faster
          force_manager.apply_force(object_direction * acceleration * object_rbody.mass, object_rbody, SurfaceType.Convey);
        }
      } // end acceleration increase
      if (velocity > 0) {
        var forward_velocity_vector = Vector3.Project(object_velocity, transform.forward);
        var force = (velocity - forward_velocity_vector.magnitude) * object_rbody.mass;
        force_manager.apply_force(transform.forward * force, object_rbody, SurfaceType.Convey);
      } // end velocity match
      if (centering) {
        var object_position_vector = (transform.position - object.transform.position);
        var offcenter_vector = Vector3.Project(object_position_vector, transform.right);
        var horiz_thrust = offcenter_vector * centering * object_rbody.mass;
        force_manager.apply_force(horiz_thrust, object_rbody, SurfaceType.Convey);
        // Debug.Log("Centering: " + horiz_thrust);
      } // end centering
    }
  }
}

