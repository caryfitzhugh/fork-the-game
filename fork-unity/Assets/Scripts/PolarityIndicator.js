#pragma strict

public var polarity : MagPolarity = MagPolarity.None;
public var selfIndicator : boolean = true;
public var polarityIndicator : GameObject;
public var colorMaterial : boolean = true;
public var colorLight : boolean = true;

private var ind_mat_instance : Material;  // do not change the original material -- for some reason that changes the material permanently

function Start () {
  if (selfIndicator) polarityIndicator = gameObject;
  if (colorMaterial && polarityIndicator) {  // cache a copy of a duplicate material assigned to the indicator object
    var ind_renderer = polarityIndicator.GetComponent.<Renderer>();
    if (ind_renderer) {
      ind_mat_instance = Instantiate(ind_renderer.material);
      ind_renderer.material = ind_mat_instance;
    }
  }
  set_polarity(polarity);
}

function Update () {
}

function get_polarity () : MagPolarity {
  return polarity;
}

function set_polarity (new_polarity : MagPolarity) {
  //Debug.Log("Setting polarity: " + new_polarity);
  polarity = new_polarity;

   // color the indicator material and light as needed
  if (polarityIndicator) {
    var polarity_color = new Color(0.5,0.5,0.5);
    if (polarity == MagPolarity.Positive) {
      polarity_color = new Color(.7,0,0);
    } else if (polarity == MagPolarity.Negative) {
      polarity_color = new Color(0,0,.7);
    }
    if (colorMaterial && ind_mat_instance) {
      ind_mat_instance.color = polarity_color;
    }
    var light = polarityIndicator.GetComponent.<Light>();
    if (colorLight && light) {
      light.color = polarity_color;
    }
  }
}
