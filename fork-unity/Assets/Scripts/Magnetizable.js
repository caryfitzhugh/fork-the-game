#pragma strict
enum MagPolarity{ None, Positive, Negative};
var polarity : MagPolarity = MagPolarity.None;
public var glow : Light;
public var attraction_range : float = 3.0;
public var attraction_mask: LayerMask;

// Attract!
class MagnetismAttractionData extends System.ValueType
{
  var position : Vector3;
  var polarity : MagPolarity;
}

function Start () {
};

function set_polarity (new_polarity) {
Debug.Log("Setting polarity");
  polarity = new_polarity; 
};

function magnetize_update (args : MagnetismAttractionData) {

  if (polarity != MagPolarity.None) {
    var force = (transform.position - args.position);
    var sqrLen = force.sqrMagnitude;

    if (sqrLen > 0.5) {

      if (args.polarity == polarity) {
        Debug.Log("attract!");
	transform.LookAt(args.position);
	gameObject.GetComponent.<Rigidbody>().AddForce((args.position - transform.position) * 10 * sqrLen, ForceMode.Acceleration);
      } else {
        Debug.Log("repel!");
	transform.LookAt(args.position);
	gameObject.GetComponent.<Rigidbody>().AddForce((transform.position - args.position) * 10 * sqrLen, ForceMode.Acceleration);
      }
    }
  }
};

function FixedUpdate() {
  if (polarity && polarity != MagPolarity.None) {
    var attraction_data = new MagnetismAttractionData();
    attraction_data.position = transform.position;
    attraction_data.polarity = polarity;

    var hitColliders = Physics.OverlapSphere(transform.position, attraction_range, attraction_mask);
          	
    for (var i = 0; i < hitColliders.Length; i++) {
      hitColliders[i].gameObject.SendMessage('magnetize_update', attraction_data);
    }
  }
};

function Update () {
  var light = GetComponent.<Light>();
  if (!light) {
    gameObject.AddComponent.<Light>();
    light = GetComponent.<Light>();
    Debug.Log("added light");
  }

  if (polarity == MagPolarity.None) {
    light.enabled = false;
  } else if (polarity == MagPolarity.Positive) {
    light.enabled = true;
    light.color = new Color(1,0,0,0.5);
  } else if (polarity == MagPolarity.Negative) {
    light.enabled = true;
    light.color = new Color(0,0,1,0.5);
  }
}
