#pragma strict

// float creates a hover at very small distances above the ground. For some reason, the small force adjustments needed
//    induce angular momentum in the object. Who knows why? Anyway, vector math is fun.
//  Thinking now that stabilize should probably be its own script, handy as it is.

var balance : float = 98;
var hoverHeight : float = .01;
var throttleMod : float = .1;
var stability : float = 1.0;
var speed : float = 2.0;

private var rbody : Rigidbody;

function Start () {
  rbody = GetComponent.<Rigidbody>();
}

function Update () {
}

function FixedUpdate() {
  var bounds = GetComponent.<Renderer>().bounds;  // find the bottom of the object
  var throttle = (hoverHeight - bounds.min.y) / hoverHeight;  // calculated throttle value
  var thrust = (throttle * (throttleMod * balance)) + balance;

  rbody.AddForce(Vector3.up * thrust);
  //Debug.Log("Target hgt: " + (hoverHeight - bounds.min.y) + " Throttle: " + throttle + " Thrust: " + thrust);

  // this produces a quaternion representing the predicted angular change of the object, based on current angular velocity
  var predicted_rotation = Quaternion.AngleAxis(rbody.angularVelocity.magnitude * Mathf.Rad2Deg * stability / speed, rbody.angularVelocity);
  // using this rotation, we predict the rotation of the up vector. We do not want this.
  var predicted_up = predicted_rotation * transform.up;
  // so we apply torque along an axis perpendicular to the plane containing the desired and predicted up vectors
  var torque_vector = Vector3.Cross(predicted_up, Vector3.up);
  rbody.AddTorque(torque_vector * speed * speed);
}
