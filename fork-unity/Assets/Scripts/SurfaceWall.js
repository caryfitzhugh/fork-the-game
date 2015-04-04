#pragma strict

public var force : float = 5.0;
public var fieldRadius : float = 5.0;
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
    var surfaces : Collider[];
    surfaces = Physics.OverlapSphere (transform.position, fieldRadius, surfaceLayer);
    for (var surface in surfaces) {
      var surface_normal = surface.transform.up;
      var surface_plane = Plane(surface_normal, surface.transform.position);
      var local_dir_position = surface.transform.InverseTransformDirection(transform.position);
      var local_position = surface.transform.InverseTransformPoint(transform.position);
      Debug.Log("Dir: " + local_dir_position);
      Debug.Log("Std: " + local_position);
    }
  }
}
