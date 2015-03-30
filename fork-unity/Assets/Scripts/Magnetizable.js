#pragma strict
enum MagPolarity{ None, Positive, Negative};
var polarity : MagPolarity = MagPolarity.None;

public var glow : Light;
public var attraction_range : float = 3.0;
public var attraction_mask: LayerMask;

// Attract!
class MagnetismAttractionData extends System.ValueType
{
  var position  : Vector3;
  var polarity  : MagPolarity;
  var multiplier: int;
}

function Start () {
};

function set_polarity (new_polarity : MagPolarity) {
  polarity = new_polarity;
};

function magnetize_update (args : MagnetismAttractionData) {

  if (polarity != MagPolarity.None) {
    var force = (transform.position - args.position);
    var sqrLen = force.sqrMagnitude;
    var impulse = (args.position - transform.position) * args.multiplier * sqrLen;

    if (sqrLen > 0.5) {

      if (args.polarity == polarity) {
        //Debug.Log("attract!");
	transform.LookAt(args.position);

        if (sqrLen < 2) {
        } else {
          impulse = impulse * 5;
        }
	gameObject.GetComponent.<Rigidbody>().AddForce(impulse, ForceMode.Force);
      } else {
        //Debug.Log("repel!");
        if (sqrLen < 2) {
          impulse = impulse * 5;
        }
	transform.LookAt(args.position);
	gameObject.GetComponent.<Rigidbody>().AddForce(impulse * -1, ForceMode.Force);
      }
    }
  }
};

function FixedUpdate() {
  if (polarity && polarity != MagPolarity.None) {
    var hitColliders = Physics.OverlapSphere(transform.position, attraction_range, attraction_mask);

    var attraction_data = new MagnetismAttractionData();
    attraction_data.position = transform.position;
    attraction_data.polarity = polarity;
    attraction_data.multiplier = hitColliders.length;

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
