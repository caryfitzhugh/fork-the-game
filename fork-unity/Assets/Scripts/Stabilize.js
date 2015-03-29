#pragma strict

// Small forces and large disturbances induce angular momentum in the object.
// This script will stabilize an object so that it remains upright. Plus, vector math is fun.

var stability : float = 1.0;
var speed : float = 2.0;

private var rbody : Rigidbody;

function Start () {
  rbody = GetComponent.<Rigidbody>();
}

function Update () {
}

function FixedUpdate() {
  // this produces a quaternion representing the predicted angular change of the object, based on current angular velocity
  var predicted_rotation = Quaternion.AngleAxis(rbody.angularVelocity.magnitude * Mathf.Rad2Deg * stability / speed, rbody.angularVelocity);
  // using this rotation, we predict the rotation of the up vector. We do not want this rotation.
  var predicted_up = predicted_rotation * transform.up;
  // so we apply torque along an axis perpendicular to the plane containing the desired and predicted up vectors
  var torque_vector = Vector3.Cross(predicted_up, Vector3.up);
  rbody.AddTorque(torque_vector * speed * speed);
}