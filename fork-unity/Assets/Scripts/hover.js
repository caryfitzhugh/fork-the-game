#pragma strict

// hover will float an object at either large or very small distances above the ground
// For some reason, the small force adjustments may require the stabilization script at very small hover distances.

var balance : float = 98;
var hoverHeight : float = .1;  // with no spin, this designates the bottom of the object -- with spin, the center
var sensitivity : float = .1;   // this can be larger for higher hover distances
var spin : boolean = false;
var spinPower : float = .2;

private var rbody : Rigidbody;
private var target_height : float;

function Start () {
  rbody = GetComponent.<Rigidbody>();
  target_height = GetComponent.<Renderer>().bounds.extents.y + hoverHeight;
}

function Update () {
}

function FixedUpdate() {
  var error = target_height - transform.position.y;
  if (error > 0) {
    var throttle = Mathf.Clamp(error / target_height, 0, 1);  // calculated throttle value normalized
    var thrust = (throttle * (sensitivity * balance)) + balance;

    rbody.AddForce(Vector3.up * thrust);
    //Debug.Log("Target hgt: " + (target_height - transform.position.y) + " Throttle: " + throttle + " Thrust: " + thrust);
  }

  if (spin) {
    //spin_vector += (Vector3.right * spinPower);
    //var world_position = transform.TransformPoint(Vector3.right);
    rbody.AddForceAtPosition((Vector3.forward + Vector3.up) * spinPower / 100, Vector3.right);
  }
}
