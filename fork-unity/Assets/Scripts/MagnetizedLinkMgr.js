#pragma strict
import System.Collections.Generic;

// Magnetized Link Manager
// This script manages the connections between magnetized objects.
// it maintains the link graph, aligns the connected objects to each other
// and creates/removes fixedjoints as needed

private var fixed_time : float = 0;
private var links = new Dictionary.<GameObject,GameObject>();
private var previous_links = new Dictionary.<GameObject,GameObject>();

function Start() {
}

function Update() {
}

function FixedUpdate() {
  if (Time.fixedTime > fixed_time + 1) {  // reset the links at least every second
    reset_frame();
  }
}

// Public functions

// attempt to connect two objects logically in a graph and physically via fixedjoints
function connect(object1 : GameObject, object2 : GameObject) {
  if (Time.fixedTime != fixed_time) {
    reset_frame();
  }

  if (!already_linked(links, object1, object2)) {
    if (!(object1 in links)) {  // set up each object as a self-referenced node
      links[object1] = object1;
    }
    if (!(object2 in links)) {  // if it does not exist already
      links[object2] = object2;
    }
    link_objects(object1, object2);
  }
}

// disconnect the fixedjoints connected to an object from its magnetically-connected group
// don't worry about the logical connection, the next physics frame will fix it
function disconnect(remove_object : GameObject) {
  if (remove_object in links) {
    var current_node = links[remove_object];
    while (current_node != remove_object) {  // traverse the chain looking for the target object
      // remove any joint from remove_object to current_node, and vice versa
      remove_joint(remove_object, current_node);
      remove_joint(current_node, remove_object);
      current_node = links[current_node];
    }
  }
}

// ask an object how many are in its group (minimum of 1)
// this function actually returns the chain count of the LAST frame, so we have a complete answer
function connection_count(object1 : GameObject) {
  var count = 1;
  if (object1 in links) {
    var current_node = links[object1];
    while (current_node != object1) {  // traverse the chain looking for the target object
      count++;
      current_node = links[current_node];
    }
  }
  return count;
}

// public version to check a link graph for the existence of a connection between two objects (uses last frame)
function is_already_linked(object1 : GameObject, object2 : GameObject) {
  return already_linked(previous_links, object1, object2);
}

// display the current links for debugging
function debug_display_connections() {
  for(var object in links.Keys) {
    Debug.Log(object.name + " connects to " + links[object].name);
  }
}

// Private functions -- external scripts should not call these

// force the links to be refreshed. Should be done every physics frame, or at last every second
function reset_frame() {
  fixed_time = Time.fixedTime;
  previous_links = links;
  links = new Dictionary.<GameObject,GameObject>();
}

// connect two link graphs together into a single graph
function link_objects(object1 : GameObject, object2 : GameObject) {
  var swap : GameObject = links[object1];
  links[object1] = links[object2];  // link the two graphs together
  links[object2] = swap;
  if (!already_linked(previous_links, object1, object2)) {
    align_objects(object1, object2);
    bond_objects(object1, object2);
    //Debug.Log("Made a new connection! #" + connection_count(object1));
  }
}

// bond two objects together with a fixed joint
// direction does not seem to matter...
function bond_objects(object1 : GameObject, object2 : GameObject) {
  var fixed_joint = object1.AddComponent(FixedJoint);
  fixed_joint.connectedBody = object2.GetComponent.<Rigidbody>();
  //Debug.Log("Made a FixedJoint from " + object1.name + " to " + object2.name);
}

// remove any joints that exist between two objects
function remove_joint(from_object : GameObject, to_object : GameObject){
  for (var joint in from_object.GetComponents(FixedJoint)) {
    var fixed_joint : FixedJoint = joint as FixedJoint;
    if (fixed_joint.connectedBody.GetInstanceID() == to_object.GetComponent.<Rigidbody>().GetInstanceID()) {
      Destroy(fixed_joint);
      Debug.Log("Removed joint from " + from_object.name + " to " + to_object.name);
    }
  }
}

// immediately align the two closest faces together in a plane.
// This uses a direct transform so objects should be VERY close together to avoid Einstein violation
function align_objects(object1 : GameObject, object2 : GameObject) {
  // We look at the target, and get it's "face vector"
  var dest_local = object2.transform.InverseTransformPoint(object1.transform.position);  // vector to us in target in local coordinates

  // Which face is closest to matching the desired direction?
  var dest_local_face_vector = face_vector(dest_local); // the target's local face vector towards us
  var dest_world_face_vector = object2.transform.TransformVector(dest_local_face_vector).normalized; // the target's global face vector towards us
  object1.transform.position = object2.transform.position + dest_world_face_vector * 1; // size of a cube
}

function face_vector( target_local : Vector3) : Vector3 {
  var local_face_vector : Vector3;

  if (Mathf.Abs(target_local.x) > Mathf.Abs(target_local.y) &&
      Mathf.Abs(target_local.x) > Mathf.Abs(target_local.z)) {

    if (target_local.x > 0) { local_face_vector = Vector3.right; }
    else { local_face_vector = Vector3.left; }

  } else if (Mathf.Abs(target_local.y) > Mathf.Abs(target_local.x) &&
      Mathf.Abs(target_local.y) > Mathf.Abs(target_local.z)) {
    if (target_local.y > 0) { local_face_vector = Vector3.up; }
    else { local_face_vector = Vector3.down; }

  } else {
    if (target_local.z > 0) { local_face_vector = Vector3.forward; }
    else { local_face_vector = Vector3.back;}
  }

  return local_face_vector;
}

// check a link graph for the existence of a connection between two objects
function already_linked(link_list : Dictionary.<GameObject,GameObject>, object1 : GameObject, object2 : GameObject) {
  var linked = false;
  if (object1 in link_list) {
    var current_node = link_list[object1];
    while ((current_node != object1) && !linked) {  // traverse the chain looking for the target object
      if (current_node == object2) {
        linked = true;
      } else {
        current_node = link_list[current_node];
      }
    }
  }
  return linked;
}

