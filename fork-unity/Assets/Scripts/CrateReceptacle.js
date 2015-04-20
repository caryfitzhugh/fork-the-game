#pragma strict
import System.Collections.Generic;

// Lift Tube
//
// Creates a "hole" where a crate can lock into
// object must have a collider that defines the effect area

// extensions
// 1-way (bridge) catcher vs 2-way (single) catcher

var receiveLayer: LayerMask;
var catchForce : float = 3;
var vertVelocity : float = 2;
public var selfIndicator : boolean = true;
var triggerIndicator : GameObject;
public var colorMaterial : boolean = true;
public var colorLight : boolean = true;

private var is_triggered : boolean = false;
private var tracking = new List.<GameObject>();
private var effect_radius : float;
private var center_floor : Vector3;
private var level_settings : LevelGlobals = null;
private var link_manager : MagnetizedLinkMgr = null;
private var force_manager : SurfaceEffectManager = null;
private var mat_instance : Material;  // do not change the original material

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

  if (selfIndicator) triggerIndicator = gameObject;
  if (colorMaterial && triggerIndicator) {  // cache a copy of a duplicate material assigned to the indicator object
    var ind_renderer = GetComponent.<Renderer>();
    if (ind_renderer) {
      mat_instance = Instantiate(ind_renderer.material);
      ind_renderer.material = mat_instance;
    }
  }
  set_indicator(Color(.25, .69, 1)); // lt blue
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

  // this is the effect that pulls the object toward the center of the receptacle
  for (var object : GameObject in tracking) {
    var parent = transform.parent;
    var carried = (parent != null && parent.gameObject.tag == "Player");
    var is_player = (object.tag == "Player");
    object_rbody = object.GetComponent.<Rigidbody>();
    if (object_rbody && !carried && !is_player) {
      center_vector.x = transform.position.x - object.transform.position.x;
      center_vector.z = transform.position.z - object.transform.position.z;
      //Debug.Log("Ctr vector: " + center_vector);
      var centering_force = 1 - Mathf.Clamp(center_vector.magnitude / effect_radius, 0, 1);
      //Debug.Log("Ctr force: " + centering_force);
      force_manager.apply_force(center_vector * centering_force * catchForce * object_rbody.mass, object_rbody, SurfaceType.Catch);
    }
  }

  if (!is_triggered) {
    // here we check for a crate that has hit the center of the receptacle
    var hit_info : RaycastHit;
    var ray_start = center_floor;
    ray_start.y = ray_start.y -.01; // start juuust below the floor
    var ray_end = center_floor + (Vector3.up * .5);  // successful entry will intersect this ray
    Debug.DrawLine(ray_start, ray_end, Color.green);

    if (Physics.Raycast(ray_start, Vector3.up, hit_info, .5, receiveLayer)) {
      Debug.Log("Caught ya!");
      triggered(hit_info.transform.gameObject);
  /*     object_rbody = hit_info.rigidbody;
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
        object_rbody.AddForce(vert_vector + (center_vector * catchForce));
        //Debug.Log("Lifting!");

        if (object_transform.position.y > (level_settings.structure.ceilingHeight - 1)) {
          // allow the object to pass through the ceiling
          Physics.IgnoreCollision(hit_info.collider, level_settings.structure.collider);
        }
      } */
    }
  }
}

function triggered(object : GameObject) {
  is_triggered = true;
  set_indicator(Color.green);
  var child = transform.Find("Cube"); // all this is temporary
  if (child != null) {
    child.GetComponent.<Renderer>().enabled = false;
  }

  // for now, just snap the crate into position
  var orient = object.transform.eulerAngles;
  orient.y = Mathf.Round(orient.y / 90) * 90;
  object.transform.eulerAngles = orient;

  var location = center_floor;
  var height = object.GetComponent.<Collider>().bounds.extents.y;
  location.y = location.y + height;
  object.transform.position = location;
  //Debug.Log(location);
}

function set_indicator(color : Color) {
    if (colorMaterial && mat_instance) {
      mat_instance.color = color;
    }
    var light = triggerIndicator.GetComponent.<Light>();
    if (colorLight && light) {
      light.color = color;
    }
}