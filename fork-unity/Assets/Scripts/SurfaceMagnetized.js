#pragma strict

public var polarity : MagPolarity = MagPolarity.None;
public var polarityIndicator : GameObject;
public var colorMaterial : boolean = true;
public var colorLight : boolean = true;
public var surfaceLayer: LayerMask;
// I think all these publics will go away once we tune the hover/float
public var balance : float = 98;
public var hoverHeight : float = .01;
public var sensitivity : float = .1;
public var stability : float = 1.0;
public var speed : float = 2.0;

private var rbody : Rigidbody;
private var ind_mat_instance : Material;  // do not change the original material -- for some reason that changes the material permanently
private var was_kinematic : boolean;
private var target_height : float;

function Start () {
  rbody = GetComponent.<Rigidbody>();
  target_height = GetComponent.<Renderer>().bounds.extents.y + hoverHeight;
  was_kinematic = GetComponent.<Rigidbody>().isKinematic;

  if (colorMaterial && polarityIndicator) {  // cache a copy of a duplicate material assigned to the indicator object
    var ind_renderer = polarityIndicator.GetComponent.<Renderer>();
    if (ind_renderer) {
      ind_mat_instance = Instantiate(ind_renderer.material);
      ind_renderer.material = ind_mat_instance;
    }
  }
}

function Update () {
}

function set_polarity (new_polarity) {
  //Debug.Log("Setting polarity: " + new_polarity);
  polarity = new_polarity;

  if (polarity == MagPolarity.Positive) {
    GetComponent.<Rigidbody>().isKinematic = true;  // remove from physics world so it will not move -- redundant now that FixedUpdate does this
  } else if (polarity == MagPolarity.Negative) {
    GetComponent.<Rigidbody>().isKinematic = false;  // replace it in the physics world
  } else {
    GetComponent.<Rigidbody>().isKinematic = was_kinematic;
  }

   // color the indicator material and light as needed
  if (polarityIndicator) {
    var ind_color = new Color(0.5,0.5,0.5);
    if (polarity == MagPolarity.Positive) {
      ind_color = new Color(.7,0,0);
    } else if (polarity == MagPolarity.Negative) {
      ind_color = new Color(0,0,.7);
    }
    if (colorMaterial && ind_mat_instance) {
      ind_mat_instance.color = ind_color;
    }
    var light = polarityIndicator.GetComponent.<Light>();
    if (colorLight && light) {
      light.color = ind_color;
    }
  }
}

function FixedUpdate() {
  var parent = transform.parent;
  var carried = (parent != null && parent.gameObject.tag == "Player");
  if (polarity && !carried) {
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
        GetComponent.<Rigidbody>().isKinematic = true;
      }
    }
  }
}
