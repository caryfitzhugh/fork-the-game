#pragma strict

// Surface Effect Manager
// Surface effect manager mitigates the combination of forces created when an object
// intersects more than one surface effect collider

// for now, a type that moves and a type that stops
enum SurfaceType{Convey, Catch};

private var fixed_time : float = 0;
private var forces = new Dictionary.<Rigidbody,Vector3>();

function Start() {
}

function Update() {
}

function apply_force(force : Vector3, rbody : Rigidbody, type : SurfaceType) {
  var resulting_force : Vector3;
  if (Time.fixedTime != fixed_time) {
    fixed_time = Time.fixedTime;
    forces = new Dictionary.<Rigidbody,Vector3>();
  }
  if (rbody in forces) {
    var current_force : Vector3 = forces[rbody];
    resulting_force = force;
    //Debug.Log(fixed_time + ": There was a collision...");
    if (force.y > current_force.y) {  // for now, we are only concerned with the Y axis
      resulting_force.y = force.y - current_force.y;  // only apply the difference
      current_force.y = force.y;
      forces[rbody] = current_force;  // store the new force
      //Debug.Log(fixed_time + ": Force unchanged");
    } else {
      resulting_force.y = 0;
      //Debug.Log(fixed_time + ": Removing force!");
    }
  } else {
    forces[rbody] = force;
    resulting_force = force;
    //Debug.Log(fixed_time + ": First force added");
  }
  rbody.AddForce(resulting_force);
}
