#pragma strict

// Lift Tube

var liftLayer: LayerMask;
var horizPower : float = 1;
var vertVelocity : float = 1;
var vertPower : float = 1;
var balance : float = 98;

function OnTriggerStay (object : Collider) {
  // var parent = transform.parent;
  // var carried = (parent != null && parent.gameObject.tag == "Player");
  var object_rbody = object.attachedRigidbody;
  if (object_rbody) {
    var vector = (transform.position - object.transform.position);
    var horiz_vector = Vector3(vector.x, 0, vector.z);
    var horiz_thrust = horiz_vector * horizPower;
    object_rbody.AddForce(horiz_thrust);
    //Debug.Log("centering");
  }
}

function FixedUpdate() {
  var hits : RaycastHit[];
  hits = Physics.RaycastAll(transform.position + (Vector3.up * 7), Vector3.down, 8, liftLayer);

  for (var i = 0;i < hits.Length; i++) {
    var hit_info : RaycastHit = hits[i];
    var object_rbody = hit_info.rigidbody;
    if (object_rbody) {
      var vert_throttle = (vertVelocity - object_rbody.velocity.y) / vertVelocity; // calculated throttle value normalized
      var vert_thrust = ((vert_throttle * balance) + balance);
      var vert_vector = Vector3.up * vert_thrust * vertPower;
      object_rbody.AddForce(vert_vector);
      //Debug.Log("lifting");
    }
  }
}
