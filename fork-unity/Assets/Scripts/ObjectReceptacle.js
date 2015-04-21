#pragma strict
import System.Collections.Generic;

// for now, a type that moves and a type that stops
enum ReceptacleState{Idle, Capture, Trigger, Complete};

// Lift Tube
//
// Creates a "hole" where a crate can lock into
// object must have a collider that defines the effect area

// extensions
// 1-way (bridge) catcher vs 2-way (single) catcher

var receiveLayer: LayerMask;
var catchForce : float = 10;

private var current_state : ReceptacleState = ReceptacleState.Idle;
private var tracking = new List.<GameObject>();
private var captured : GameObject = null;
private var capture_time : float = 0;
private var capture_start_y : float;
private var capture_end_y: float;
private var effect_radius : float;
private var center_floor : Vector3;

private var level_settings : LevelGlobals = null;
private var link_manager : MagnetizedLinkMgr = null;
private var force_manager : SurfaceEffectManager = null;

function Awake() {
  level_settings = FindObjectOfType(LevelGlobals);
  if (level_settings == null) {
    Debug.Log("No LevelGlobal found!");
  }

  force_manager = FindObjectOfType(SurfaceEffectManager);
  if (!force_manager) {
    Debug.Log("No SurfaceEffectManager found!");
  }

  link_manager = FindObjectOfType(MagnetizedLinkMgr);
  if (link_manager == null) {
    Debug.Log("Error! -- No link manager found!");
  }
}

function Start() {
  effect_radius = GetComponent.<Collider>().bounds.extents.x;
  center_floor = transform.position;
  center_floor.y = center_floor.y - GetComponent.<Collider>().bounds.extents.y;
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
  var center_vector = new Vector3(0, 0, 0); // vector toward center of receptacle
  var parent : Transform;
  var is_carried : boolean;
  var is_player : boolean;

  if (current_state == ReceptacleState.Idle) {  // nothing has yet been captured

    // pull any nearby object toward the center of the receptacle
    for (var object : GameObject in tracking) {
      parent = object.transform.parent;
      is_carried = (parent != null && parent.gameObject.tag == "Player");
      is_player = (object.tag == "Player");
      if (!is_carried && !is_player) {
        seek_xz_with_force(object, center_floor, catchForce);
      }
    }

    // check for a crate that has hit the center of the receptacle
    var hit_info : RaycastHit;
    var ray_start = center_floor;
    ray_start.y = ray_start.y -.01; // start juuust below the floor
    var ray_end = center_floor + (Vector3.up * .5);  // successful entry will intersect this ray
    //Debug.DrawLine(ray_start, ray_end, Color.green);

    if (Physics.Raycast(ray_start, Vector3.up, hit_info, .5, receiveLayer)) {
      var hit_object = hit_info.transform.gameObject;
      parent = hit_object.transform.parent;
      is_carried = (parent != null && parent.gameObject.tag == "Player");
      is_player = (hit_object.tag == "Player");
      if (!is_carried && !is_player) {
        Debug.Log("Caught ya!");
        captured = hit_object;
        change_state(ReceptacleState.Capture);
      }
    }
  } else if (current_state == ReceptacleState.Capture) {  // we have captured a valid object so try to force it in place
    var err_center = seek_xz_with_force(captured, center_floor, 100);
    var err_rotate = seek_y_rotation_with_force(captured, Mathf.Round(captured.transform.eulerAngles.y / 90) * 90, 100);
    if ((err_center < .05) && (err_rotate < .5)) {  // close enough, we accept the object
      change_state(ReceptacleState.Trigger);
    }
  } else if (current_state == ReceptacleState.Trigger) {  // we have now fully captured an object, so sink it into the floor
    if (Time.time <= capture_time + 1) {
      var y = Mathf.Lerp(capture_start_y, capture_end_y, Time.time - capture_time);
      //Debug.Log("t: " + (Time.time - capture_time) + " yt: " + y);
      captured.transform.position.y = Mathf.Lerp(capture_start_y, capture_end_y, Time.time - capture_time);
    } else {
      change_state(ReceptacleState.Complete);
    }
  } // else we are all done
}

// forces an object toward the xz position of position using the y component as the floor
// returns the value of the distance error (> 0)
function seek_xz_with_force(object : GameObject, xy_position : Vector3, force : float) {
    var object_rbody = object.GetComponent.<Rigidbody>();
    if (object_rbody) {
      var collider = object.GetComponent.<Collider>();
      xy_position.y = xy_position.y + collider.bounds.extents.y;  // set y target correctly from bounds
      var center_vector = xy_position - object.transform.position;
      //Debug.Log("Ctr vector: " + center_vector);
      var centering_force = 1 - Mathf.Clamp(center_vector.magnitude / (effect_radius + collider.bounds.extents.x), 0, 1);
      //Debug.Log("Ctr mag: " + center_vector.magnitude);
      //Debug.Log("Ctr force: " + centering_force);
      force_manager.apply_force(center_vector * centering_force * force * object_rbody.mass, object_rbody, SurfaceType.Catch);
      return center_vector.magnitude;
    }
    return 0; // if we cannot move the object, we are done
}

// forces an object's rotation toward the given y angle using torque
// returns the value of the distance error (> 0)
function seek_y_rotation_with_force(object : GameObject, angle : float, force : float) {
    var parent = object.transform.parent;
    var is_carried = (parent != null && parent.gameObject.tag == "Player");
    var is_player = (object.tag == "Player");
    var object_rbody = object.GetComponent.<Rigidbody>();
    if (object_rbody && !is_carried && !is_player) {
      var error = angle - object.transform.eulerAngles.y;
      //Debug.Log("angle: " + angle + "  curr: " + object.transform.eulerAngles.y);
      var rotation_force = Mathf.Clamp(error / 45, -1, 1);
      //Debug.Log("error: " + error);
      //Debug.Log("Rot force: " + rotation_force);
      object_rbody.AddTorque(Vector3.up * rotation_force * force * object_rbody.mass);
      return Mathf.Abs(error);
    }
    return 0; // if we cannot move the object, we are done
}

function change_state(new_state : ReceptacleState) {
  if (new_state != current_state) {
    if (new_state == ReceptacleState.Capture) {
      // nuttin'
    } else if (new_state == ReceptacleState.Trigger) {
      // set the object to kinematic
      capture_time = Time.time;
      captured.GetComponent.<Rigidbody>().isKinematic = true;  // remove from physics world, we will move it ourselves
      capture_start_y = captured.transform.position.y;
      capture_end_y = center_floor.y - captured.GetComponent.<Collider>().bounds.extents.y + .05;
      Debug.Log("is_triggered - Time: " + capture_time + "  y0: " + capture_start_y + "  y1: " + capture_end_y);
    } else if (new_state == ReceptacleState.Complete) {
      // also nuttin'
    }

    current_state = new_state;
    gameObject.SendMessage("receptacle_status", current_state);
  }
}
