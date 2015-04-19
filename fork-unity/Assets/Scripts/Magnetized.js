#pragma strict

public var fieldRadius : float = 5.0;
public var strength : float = 1.0;
public var attractionLayer: LayerMask;

private var my_polarity : HasPolarity = null;
private var link_manager : MagnetizedLinkMgr = null;
private var rbody : Rigidbody;
private var cached_polarity : MagPolarity = MagPolarity.None;

function Awake () {
  my_polarity = GetComponent(HasPolarity);
  if (my_polarity == null) { Debug.Log("Error! -- Object has no polarity!"); }

  link_manager = FindObjectOfType(MagnetizedLinkMgr);
  if (link_manager == null) { Debug.Log("Error! -- No link manager found!"); }
}

function Start () {
  rbody = GetComponent.<Rigidbody>();
}

function Update () {
}

function OnJointBreak(breakForce : float) {
  Debug.Log("A joint has just been broken!");
}

function set_polarity (new_polarity : MagPolarity) {
  // we need to respond to polarity changes in order to break our fixedjoints
  if (new_polarity != cached_polarity) {
    link_manager.disconnect(gameObject);
    cached_polarity = new_polarity;
  }
}

function FixedUpdate() {
  var parent = transform.parent;
  var carried = (parent != null && parent.gameObject.tag == "Player");
  if (my_polarity.polarity != MagPolarity.None && !carried) {
    var colliders : Collider[];
    colliders = Physics.OverlapSphere (transform.position, fieldRadius, attractionLayer);
    for (var other_magnet in colliders) {
      if (gameObject != other_magnet.gameObject) {
        var other_magnet_polarity : HasPolarity = other_magnet.GetComponent(HasPolarity);
        var other_magnet_magnetized : Magnetized = other_magnet.GetComponent(Magnetized);
        if (other_magnet_polarity && other_magnet_magnetized && (other_magnet_polarity.polarity != MagPolarity.None)) {
          var separation = other_magnet.transform.position - transform.position;
          //Debug.Log("separation: " + separation.magnitude);
          // Calculate the normalized force to apply to ourselves, based on the other magnet
          var force = Mathf.Clamp(1.0 - ((other_magnet.transform.position - transform.position).magnitude / other_magnet_magnetized.fieldRadius), 0.0, 1.0);
          //Debug.Log("normalized force magnitude: " + force);
          // Determine vector to other magnet
          var direction = other_magnet.transform.position - transform.position;
          // calculate force along vector using strength setting
          var force_vector : Vector3 = direction.normalized * force * force * other_magnet_magnetized.strength * 10;
          //Debug.Log("force_vector magnitude: " + force_vector.magnitude);
          if (other_magnet_polarity.polarity != my_polarity.polarity) {
            // polarity is different so repel
            rbody.AddForce(-force_vector);
          } else {
            // polarity is the same so attract
            // but first, remind the manager that we should be connected
            if (Mathf.Abs(separation.magnitude) < 1.01) { // FIXME should check object bounds
              link_manager.connect(gameObject, other_magnet.gameObject);
            } else if (!link_manager.is_already_linked(gameObject, other_magnet.gameObject)) { 
              // if we're not close and not already connected, use force to move together
              rbody.AddForce(force_vector);
              //Debug.Log("Adding force: " + force_vector.magnitude);
            }
          }
        }
      }
    }
  }
}
