#pragma strict

public var polarity : MagPolarity = MagPolarity.None;
public var fieldRadius : float = 5.0;
public var strength : float = 1.0;
public var attractionLayer: LayerMask;

private var rbody : Rigidbody;

function Start () {
  rbody = GetComponent.<Rigidbody>();
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
    var colliders : Collider[];
    colliders = Physics.OverlapSphere (transform.position, fieldRadius, attractionLayer);
    for (var other_magnet in colliders) {
      if (gameObject != other_magnet.gameObject) {
        var other_magnet_reference : Magnetized = other_magnet.GetComponent(Magnetized);
        if (other_magnet_reference && (other_magnet_reference.polarity != MagPolarity.None)) {
          // Calculate the normalized force to apply to ourselves, based on the other magnet
          var force = Mathf.Clamp(1.0 - ((other_magnet.transform.position - transform.position).magnitude / other_magnet_reference.fieldRadius), 0.0, 1.0);
          //Debug.Log("normalized force magnitude: " + force);
          // Determine vector to other magnet
          var direction = other_magnet.transform.position - transform.position;
          // calculate force along vector using strength setting
          var force_vector : Vector3 = direction.normalized * force * force * other_magnet_reference.strength * 10;
          //Debug.Log("force_vector magnitude: " + force_vector.magnitude);
          if (other_magnet_reference.polarity == polarity) {
            // polarity is the same so repel
            rbody.AddForce(-force_vector);
          } else {
            // polarity is the same so attract
            rbody.AddForce(force_vector);
          }
        }
      }
    }
  }
}
