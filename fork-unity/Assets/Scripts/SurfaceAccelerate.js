#pragma strict

public var force : float = 5.0;
public var surfaceLayer: LayerMask;


private var rbody : Rigidbody;

function Start () {
  rbody = GetComponent.<Rigidbody>();
}

function Update () {
}

function FixedUpdate() {
  var parent = transform.parent;
  var carried = (parent != null && parent.gameObject.tag == "Player");

  if (!carried) {
    var hit_info : RaycastHit;

    if(Physics.Raycast(transform.position, Vector3.down, hit_info, 1, surfaceLayer)) {
      var current_velocity = Vector3.ProjectOnPlane(rbody.velocity, Vector3.up);  // current x-z velocity
      var current_direction = current_velocity.normalized;    // not normalizing will accelerate fast bodies faster
      rbody.AddForce(current_direction * force * 10);
    }
  }
}
