#pragma strict
enum MagPolarity{ None, Positive, Negative};
var polarity : MagPolarity = MagPolarity.None;
public var glow : Light;

function Start () {
};

function set_polarity (new_polarity) {
Debug.Log("Setting polarity");
  polarity = new_polarity; 
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
