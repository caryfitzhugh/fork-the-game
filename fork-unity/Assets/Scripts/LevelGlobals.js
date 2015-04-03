#pragma strict

// LevelGlobals
// The idea here is to store various level settings so that those settings can be
// accessed by the scripts that need them.

public var interactionDistance : float = 2.5;

class structure_opts {
  var ceilingHeight : float = 5.0;
  var gameObject : GameObject;
  var collider : Collider;
}
public var structure : structure_opts;

// I have to have everything ready for the scripts at their Start() so I will set them in Awake
function Awake () {
  structure.gameObject = gameObject;
  structure.collider = GetComponent.<Collider>();
}

function Start () {

}

function Update () {

}