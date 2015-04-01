#pragma strict

public var force_multiplier : float = 500;
private var my_polarity : HasPolarity = null;


function Awake () {
  my_polarity = GetComponent(HasPolarity);
  if (my_polarity == null) Debug.Log("Error! -- Object has no polarity!");
}

function Start () {

}

function Update () {
  // Want to draw a line from each face - straight outward
  // For debugging

  // Debug.DrawRay(transform.position, transform.TransformVector(Vector3.right), Color.blue);
  // Debug.DrawRay(transform.position, transform.TransformVector(Vector3.up), Color.yellow);
  Debug.DrawRay(transform.position, transform.TransformVector(Vector3.forward), Color.white);
  // Debug.DrawRay(transform.position, transform.TransformVector(Vector3.down), Color.red);
  // Debug.DrawRay(transform.position, transform.TransformVector(Vector3.back), Color.green);
  // Debug.DrawRay(transform.position, transform.TransformVector(Vector3.left), Color.magenta);
}

function process_nearby_objects (nearby_objects : Hashtable) {
  if (my_polarity.polarity != MagPolarity.None) {

    for (var target : GameObject in nearby_objects.Values) {
      // If the object has a polarity
      var tpi = target.GetComponent.<HasPolarity>();
      var target_polarity = tpi.polarity;
      var vector = (target.transform.position - transform.position);
      // This is our magnitude
      var magnitude = force_multiplier * nearby_objects.Count;

      // This is an expensive calculation. You may want to just use the distance between the object centers.
      var closestSurfacePoint1: Vector3  = GetComponent.<Collider>().ClosestPointOnBounds(target.transform.position);
      var closestSurfacePoint2 : Vector3 = target.GetComponent.<Collider>().ClosestPointOnBounds(transform.position);
      var surface_distance = Vector3.Distance(closestSurfacePoint1, closestSurfacePoint2);


      if (surface_distance < 4) {

        Debug.DrawLine(transform.position, target.transform.position, Color.green);
        // this is the target line we want to match

        var target_local = transform.InverseTransformPoint(target.transform.position);  // vector to target in local coordinates
        //Debug.Log("my_loc_world: " + transform.position);
        //Debug.Log("tgt_loc_world: " + target.transform.position);
        //Debug.Log("tgt_local: " + target_local);

        // Which face is closest to matching the desired direction?
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
        //Debug.Log("lfv: " + local_face_vector);
        var world_face_vector = transform.TransformVector(local_face_vector).normalized;
        //Debug.Log("wfv (red): " + world_face_vector);
        Debug.DrawLine(transform.position, transform.position + (3 * world_face_vector), Color.red);
        // This is the face-normal that is closest to the target line, so we need to move this line to the green line
        
        var world_target_vector = (target.transform.position - transform.position).normalized;
        //Debug.Log("wtv: " + world_target_vector);

        var normal_axis = Vector3.Cross(world_target_vector, world_face_vector);
        //Debug.Log("rotation axis (red): " + normal_axis);
        Debug.DrawLine(transform.position, transform.position + (3 * normal_axis), Color.blue);
        // This is the axis of rotation around which we must be rotated to match the desired orientation

        // I refuse to believe that my vector is inverted so I invert it for AddTorque who is, of course, wrong. :)
        var speed = -5; // it it hard to overcome static friction, but this torque works fine with a hover attached (though we'd have to dampen the torque, you'll see why)
        //GetComponent.<Rigidbody>().AddTorque(normal_axis * speed);  // it also works on the floor at large values

        // Make sure we can move it.
        // http://docs.unity3d.com/ScriptReference/Rigidbody.SweepTest.html

        // STEP 1) Adjust the rotation to match
        // STEP 2) Move closer until the extents / bounds are within 0.1 (or something tiny).
        // STEP 3) Attach a fixedJoint btwn you and the target
      } else {

        if (target_polarity == MagPolarity.None) {
          // Do nothing -- the other guy is non-polarized
        } else if (target_polarity != my_polarity.polarity) {
          // You just push it away (opposite of the bottom equation)
          GetComponent.<Rigidbody>().AddForce(-1.0 * vector * magnitude, ForceMode.Acceleration);
        } else {
          //target.transform.LookAt(transform.position);
          GetComponent.<Rigidbody>().AddForce(vector * magnitude, ForceMode.Acceleration);
        }

      }
    }
  }
}

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
    } else {
      // It's already in a group. so skip
    }
  }

  return groups;
}
