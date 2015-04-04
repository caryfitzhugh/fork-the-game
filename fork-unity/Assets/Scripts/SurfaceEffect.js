#pragma strict
import System.Collections.Generic;

public var force : float = 5.0;

private var balance : float = 98;
private var sensitivity : float = .1;
private var target_height : float = 2;
private var tracking = new List.<GameObject>();

function Start () {
}

function Update () {
}

function OnTriggerEnter(object : Collider) {
  var go = object.gameObject;
  if(!tracking.Contains(go)){
      tracking.Add(go);
      Debug.Log("Adding: " + tracking.Count);
  }
}

function OnTriggerExit(object : Collider) {
  tracking.Remove(object.gameObject);
}

function FixedUpdate() {
  for (var object : GameObject in tracking) {
    // var parent = transform.parent;
    // var carried = (parent != null && parent.gameObject.tag == "Player");
    var object_rbody = object.GetComponent.<Rigidbody>();
    if (object_rbody) {
      var object_transform = object.gameObject.transform;
      var throttle = Mathf.Clamp((target_height - object_transform.position.y) / target_height, 0, 1);  // calculated throttle value normalized
      Debug.Log(throttle);
      var thrust = (throttle * (sensitivity * balance)) + balance;

      object_rbody.AddForce(Vector3.up * thrust);
      //Debug.Log("centering");
    }
  }
}
