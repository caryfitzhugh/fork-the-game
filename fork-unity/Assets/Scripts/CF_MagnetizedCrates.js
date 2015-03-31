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

}

function calculate_magnetic_force (nearby_objects : Hashtable) {

  if (my_polarity.polarity != MagPolarity.None) {

  //Debug.Log("calc mag force.  " + nearby_objects.Count);

    // You want to compare yourself against all the other objects
    // collect them into groups
    var groups = collect_into_groups(nearby_objects);
  Debug.Log("found groups:" + groups.Count);

    // For each of the other game objects.
    for (var group : Hashtable in groups) {

      if (group.ContainsKey(gameObject.GetInstanceID())) {
        //Debug.Log("it's my group!");
        // Only look at objects connected by your fixed joints.
        // If they are attracting. Do nothing.
        // If they are repelling.  Destroy the links and do a repulsion force == to the size of the group ^ 2
      } else {
        var target = closest_object_from_group (gameObject, group);
        var tpi = target.GetComponent.<PolarityIndicator>();
        var target_polarity = tpi.polarity;
        var vector = (target.transform.position - transform.position);

        // If you are next to me. You are 1.
        // If you are the max away - you are probably like 25 (5**2)
        //
        var magnitude = force_multiplier * group.Count * 1 / vector.sqrMagnitude;

        if (target_polarity == MagPolarity.None) {
          //Debug.Log("do nothing");
          // Do nothing -- the other guy is non-polarized
        } else if (target_polarity != my_polarity.polarity) {
          //Debug.Log("does not match my polarity");
          // You just push it away (opposite of the bottom equation)
          GetComponent.<Rigidbody>().AddForce(-1.0 * vector * magnitude, ForceMode.Acceleration);
        } else {
          // if it's closer than the threshold
          if (vector.sqrMagnitude <= 1.5 ) {
            // add a fixed joint to it!  -- make it part of you.
            //Debug.Log("adding rigid fixed joint");
            var new_joint : FixedJoint = gameObject.AddComponent.<FixedJoint>();
            new_joint.connectedBody = target.GetComponent.<Rigidbody>();
          } else {
            // if it's farther than that, then use size of my group ^ 2 / the distance ^ 2 * force.. to push it towards *you*
            GetComponent.<Rigidbody>().AddForce(vector * magnitude, ForceMode.Acceleration);
          }
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
