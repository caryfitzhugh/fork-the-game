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

  Debug.DrawRay(transform.position, transform.TransformVector(new Vector3(1,0,0)), Color.blue);
  Debug.DrawRay(transform.position, transform.TransformVector(new Vector3(0,1,0)), Color.yellow);
  Debug.DrawRay(transform.position, transform.TransformVector(new Vector3(0,0,1)), Color.white);
  Debug.DrawRay(transform.position, transform.TransformVector(new Vector3(0,-1,0)), Color.red);
  Debug.DrawRay(transform.position, transform.TransformVector(new Vector3(0,0,-1)), Color.green);
  Debug.DrawRay(transform.position, transform.TransformVector(new Vector3(-1,0,0)), Color.magenta);
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

      var closestSurfacePoint1: Vector3  = GetComponent.<Collider>().ClosestPointOnBounds(target.transform.position);
      var closestSurfacePoint2 : Vector3 = target.GetComponent.<Collider>().ClosestPointOnBounds(transform.position);
      var surface_distance = Vector3.Distance(closestSurfacePoint1, closestSurfacePoint2);


      if (surface_distance < 4) {

        var vec_to_center  = (transform.position - target.transform.position); //(target.transform.position - transform.position
        var face = transform.InverseTransformVector(vec_to_center);
        var color;
        var face_vector ;

        // What face?
        if (Mathf.Abs(face.x) > Mathf.Abs(face.y) &&
            Mathf.Abs(face.x) > Mathf.Abs(face.z)) {

          if (face.x > 0) { face_vector = Vector3.left; }
          else { face_vector = Vector3.right; }

        } else if (Mathf.Abs(face.y) > Mathf.Abs(face.x) &&
                   Mathf.Abs(face.y) > Mathf.Abs(face.z)) {
          if (face.y > 0) { face_vector = Vector3.up; }
          else { face_vector = Vector3.down; }

        } else {
          if (face.z > 0) { face_vector = Vector3.forward; }
          else { face_vector = Vector3.back;}
        }

        var world_face_vector = transform.TransformVector(face_vector).normalized;

        Debug.DrawLine(transform.position, transform.position + (3 * world_face_vector), Color.black);


        // At this point I have my vectors in world_coords.
        // The black line is the face I want to turn towards the target.transform.position


        // ALTERNATIVE #1 - FROM DAVE?
        var normal_axis = Vector3.Cross(vec_to_center, world_face_vector);
/*
        Debug.Log("normal: " + normal_axis);
        var speed = 100;
        GetComponent.<Rigidbody>().AddTorque(normal_axis * speed);
*/

        // Make sure we can move it.
        // http://docs.unity3d.com/ScriptReference/Rigidbody.SweepTest.html

      } else {

        if (target_polarity == MagPolarity.None) {
          // Do nothing -- the other guy is non-polarized
        } else if (target_polarity != my_polarity.polarity) {
          // You just push it away (opposite of the bottom equation)
          GetComponent.<Rigidbody>().AddForce(-1.0 * vector * magnitude, ForceMode.Acceleration);
        } else {
          ///target.transform.LookAt(transform.position);
          GetComponent.<Rigidbody>().AddForce(vector * magnitude, ForceMode.Acceleration);
        }

      }
    }
  }
}

function closest_object_from_group (you : GameObject, group_contents : Hashtable) : GameObject {
  var closest = null;
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
