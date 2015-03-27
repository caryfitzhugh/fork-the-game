#pragma strict

var hoverHeight : float = 1.6;
var power : float = 1;
var balance : float = 98;
//var dampen : float = 1;

private var is_hovering : boolean = false;
private var rbody : Rigidbody;

function Start () {
  rbody = GetComponent.<Rigidbody>();
}

function Update () {
}

function object_activate(active : boolean) {
  is_hovering = active;
}

function FixedUpdate() {
  if (is_hovering) {
    var throttle = (hoverHeight - transform.position.y) / hoverHeight;  // calculated throttle value
    var thrust = balance * (throttle * power + 1);
    rbody.AddForce(Vector3.up * thrust);
    //Debug.Log("Thrust: " + thrust);
  }
}
