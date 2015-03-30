#pragma strict

public var polarity : MagPolarity = MagPolarity.None;
public var surfaceLayer: LayerMask;
// I think all these publics will go away once we tune the hover/float
public var balance : float = 98;
public var hoverHeight : float = .01;
public var sensitivity : float = .1;
public var stability : float = 1.0;
public var speed : float = 2.0;

private var rbody : Rigidbody;
private var target_height : float;

function Start () {
  rbody = GetComponent.<Rigidbody>();
  target_height = GetComponent.<Renderer>().bounds.extents.y + hoverHeight;
}

function Update () {
}

function set_polarity (new_polarity : MagPolarity) {
  //Debug.Log("Setting polarity: " + new_polarity);
  polarity = new_polarity;
}

function FixedUpdate() {
  var parent = transform.parent;
  var carried = (parent != null && parent.gameObject.tag == "Player");
  if (polarity != MagPolarity.None && !carried) {
    var hit_info : RaycastHit;

    if(Physics.Raycast(transform.position, Vector3.down, hit_info, 1, surfaceLayer)) {
      if (polarity == MagPolarity.Negative) {

        // this is the upward force that lifts the body
        var bounds = GetComponent.<Renderer>().bounds;  // find the bottom of the object
        var throttle = (target_height - transform.position.y) / target_height;  // calculated throttle value normalized
        var thrust = (throttle * (sensitivity * balance)) + balance;  // attenuated thrust to adjust body as needed
        rbody.AddForce(Vector3.up * thrust);
        //Debug.Log("Target hgt delta: " + (hoverHeight - bounds.min.y) + " Throttle: " + throttle + " Thrust: " + thrust);

        // this produces a quaternion representing the predicted angular change of the object, based on current angular velocity
        var predicted_rotation = Quaternion.AngleAxis(rbody.angularVelocity.magnitude * Mathf.Rad2Deg * stability / speed, rbody.angularVelocity);
        // using this rotation, we predict the rotation of the up vector. We do not want this rotation.
        var predicted_up = predicted_rotation * transform.up;
        // so we apply torque along an axis perpendicular to the plane containing the desired and predicted up vectors
        var torque_vector = Vector3.Cross(predicted_up, Vector3.up);
        rbody.AddTorque(torque_vector * speed * speed);
      } else if (polarity == MagPolarity.Positive) {
        rbody.AddForce(Vector3.down * balance);
      }
    }
  }
}
