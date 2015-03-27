#pragma strict

var hoverHeight : float = 1.6;
var power : float = 1;
var balance : float = 98;
var spin : boolean = false;
var spinPower : float = 1;
//var dampen : float = 1;

private var rbody : Rigidbody;

function Start () {
  rbody = GetComponent.<Rigidbody>();
}

function Update () {
}

function FixedUpdate() {
  var throttle = (hoverHeight - transform.position.y) / hoverHeight;  // calculated throttle value
  var thrust = balance * (throttle * power + 1);

  rbody.AddForce(Vector3.up * thrust);
  //Debug.Log("Thrust: " + thrust);

  if (spin) {
    //spin_vector += (Vector3.right * spinPower);
    //var world_position = transform.TransformPoint(Vector3.right);
    rbody.AddForceAtPosition((Vector3.forward + Vector3.up) * spinPower / 100, Vector3.right);
  }
}
