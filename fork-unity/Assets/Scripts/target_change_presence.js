#pragma strict

var toggleRenderer : boolean;
var toggleCollider : boolean;
var toggleRigidbody : boolean;
var activateOnly : boolean;

private var original_renderer_enabled : boolean;
private var original_collider_enabled : boolean;
private var original_rigidbody_kinematic : boolean;


// Only supports a single renderer
// Disable object collider and renderer and set rigidbody.isKinematic to false to initially hide object
function Start () {
  original_renderer_enabled = GetComponent.<Renderer>().enabled;
  original_collider_enabled = GetComponent.<Collider>().enabled;
  var rigidbody = GetComponent.<Rigidbody>();
  if (rigidbody) {
    original_rigidbody_kinematic = rigidbody.isKinematic;
  }
}

function object_activate(active : boolean) {
  if (!active && activateOnly)
    return;

  if (toggleRenderer) {
    GetComponent.<Renderer>().enabled = (active ? !original_renderer_enabled : original_renderer_enabled );
  }

  if (toggleCollider) {
    GetComponent.<Collider>().enabled = (active ? !original_collider_enabled : original_collider_enabled);
  }

  if (toggleRigidbody) {
    GetComponent.<Rigidbody>().isKinematic = (active ? !original_rigidbody_kinematic : original_rigidbody_kinematic);
  }
  // Debug.Log("active is: " + active);
  // Debug.Log("org render: " + original_renderer_enabled + " render: " + (active ? !original_renderer_enabled : original_renderer_enabled ));
  // Debug.Log("org collider: " + original_collider_enabled + " collider: " + (active ? !original_collider_enabled : original_collider_enabled ));
  // Debug.Log("org kinematic: " + original_rigidbody_kinematic + " kinematic: " + (active ? !original_rigidbody_kinematic : original_rigidbody_kinematic ));
}
