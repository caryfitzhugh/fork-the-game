#pragma strict

public var force_multiplier : float = 10;
private var my_polarity : HasPolarity = null;


function Awake () {
  my_polarity = GetComponent(HasPolarity);
  if (my_polarity == null) Debug.Log("Error! -- Object has no polarity!");
}

function Start () {
}

function Update () {
}

function process_nearby_objects (nearby_objects : Hashtable) {
  if (my_polarity.polarity != MagPolarity.None) {


   // Apparently you are not a nearby object! :)
//Debug.Log("Collect " + nearby_objects.Count + " into groups: " + collect_into_groups(nearby_objects).Count);

 //   for (var group in collect_into_groups(nearby_objects)) {
      // For each group
//    }

    for (var target : GameObject in nearby_objects.Values) {
      // If the object has a polarity
      var tpi = target.GetComponent.<HasPolarity>();
      var target_polarity = tpi.polarity;
      // This is our magnitude
      var magnitude = force_multiplier * nearby_objects.Count * nearby_objects.Count;

      var desired_position : Vector3 = get_desired_position(gameObject, target);
      var desired_rotation : Quaternion = get_desired_rotation(gameObject, target);

      var move_vector : Vector3 = desired_position - transform.position;
      var distance = move_vector.sqrMagnitude;

      if (target_polarity == MagPolarity.None) {
        // Do nothing -- the other guy is non-polarized
      } else if (target_polarity != my_polarity.polarity) {
        // You just push it away (opposite of the bottom equation)
        GetComponent.<Rigidbody>().AddForce(-1.0 * move_vector * magnitude, ForceMode.Force);


      } else {
        if (distance < 0.0001) {
          if (!connected_by_joint(gameObject, target)) {
            Debug.Log("not in joints");
            GetComponent.<Rigidbody>().velocity = new Vector3(0,0,0);
            GetComponent.<Rigidbody>().rotation = desired_rotation;

            var mag_joint = gameObject.AddComponent(FixedJoint);
            mag_joint.connectedBody = target.GetComponent.<Rigidbody>();

            if (!connected_by_joint(gameObject, target)) {
              Debug.Log("FAILED!");
            }
          }
        } else if (distance < 3) {
            // Find out our desired position
            Debug.DrawLine(desired_position, transform.position, Color.red);

            // The step size is equal to speed times frame time.
	          var step = 180 * Time.deltaTime;

	          // Rotate our transform a step closer to the target's.
	          transform.rotation = Quaternion.RotateTowards(transform.rotation, desired_rotation, step);

            // Move towards it at about 1/2 speed.
            transform.position = transform.position + move_vector * 0.1;

         } else {
          // Draw them closer together
          GetComponent.<Rigidbody>().AddForce(move_vector * magnitude, ForceMode.Force);
        }
      }
    }
  }
}

function get_desired_position (me : GameObject, target : GameObject) : Vector3 {
  // We look at the target, and get it's "face vector"
  var dest_local = target.transform.InverseTransformPoint(transform.position);  // vector to target in local coordinates

  // Which face is closest to matching the desired direction?
  var dest_local_face_vector = face_vector(dest_local);
  var dest_world_face_vector = target.transform.TransformVector(dest_local_face_vector).normalized;
  return target.transform.position + dest_world_face_vector * 1 /* The size of a cube */;
}

function get_desired_rotation (me : GameObject, target : GameObject) : Quaternion {
  // vector to target in local coordinates
  // The target rotation:
  var target_rotation = target.transform.rotation;

  return target_rotation;
}

function connected_by_joint (me : GameObject, target : GameObject) : boolean {
  var joints = me.GetComponents(FixedJoint);
  var in_joints = false;

  for (var joint in joints) {
    var fixed_joint : FixedJoint = joint as FixedJoint;
    if (fixed_joint.connectedBody.GetInstanceID() == target.GetComponent.<Rigidbody>().GetInstanceID()) {
      in_joints = true;
    }
  }
  return in_joints;
}

function face_vector ( target_local : Vector3) : Vector3 {
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
};

function closest_object_from_group (you : GameObject, group_contents : Hashtable) : GameObject {
  var closest : GameObject = null;
  var closest_dist = 99999;

  for (var obj in group_contents.Values) {
    var other : GameObject = obj as GameObject;
    var mag = (other.transform.position - you.transform.position).sqrMagnitude;
    if (mag < closest_dist) {
      closest = other;
    }
  }
  return closest;
}

function recur_collect_groups (game_object : GameObject, current_group_contents : Hashtable) : Hashtable {
  // Collects
  // TO create groups, we look at the FixedJoints (which are connected to other CF_MagnetizedCrates
  // and add those gameobjects.
  //  current_group_contents.game_object
  if (!current_group_contents.ContainsKey(game_object.GetInstanceID())) {
    current_group_contents.Add(game_object.GetInstanceID(), game_object);
  }

  var joints = game_object.GetComponents(FixedJoint);
  Debug.Log("Found " + joints.length + " joints");
  for (var joint in joints) {
    var fixed_joint : FixedJoint = joint as FixedJoint;
    // Get the game object
    var body = fixed_joint.connectedBody;
    if (body && body.GetComponent.<CF_MagnetizedCrates>()) {
      current_group_contents = recur_collect_groups(body.gameObject, current_group_contents);
    }
  }

  return current_group_contents;
};

function collect_into_groups (objects : Hashtable) : Array {
  var values = objects.Values;
  var seen = {};

  // Array of Hashtables!
  var groups = new Array();

  for (var obj in objects.Values) {
    var object : GameObject = obj as GameObject;
    // You want to see if we've seen it before. If so, skip
    if (!seen[object.GetInstanceID()]) {
      // Go find all the objects in this group!
      var group = recur_collect_groups(object, {});

      Debug.Log("Collected group: " + group.Count);
/*
      // Make sure we mark this as "found"
      for (var go in group.Values) {
        var group_obj : GameObject = go as GameObject;
        if (!seen[group_obj.GetInstanceID()]) {
          seen.Add(group_obj.GetInstanceID(), true);
        } else {
          Debug.Log("What? it's this?");
        }
      }

      // Add to the groups
      groups.Push(group);
      */
    } else {
      // It's already in a group. so skip
    }
  }

  return groups;
}

/*
        // This is an expensive calculation. You may want to just use the distance between the object centers.
        var closestSurfacePoint1: Vector3  = GetComponent.<Collider>().ClosestPointOnBounds(target.transform.position);
        var closestSurfacePoint2 : Vector3 = target.GetComponent.<Collider>().ClosestPointOnBounds(transform.position);
        var surface_distance = Vector3.Distance(closestSurfacePoint1, closestSurfacePoint2);

*/
