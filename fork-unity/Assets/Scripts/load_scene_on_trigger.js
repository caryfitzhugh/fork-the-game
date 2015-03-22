#pragma strict

var level_name : String;

function Start () {

}

function Update () {

}

function OnTriggerEnter(object : Collider) {
  if (object.tag == "Player") {
    Application.LoadLevel(level_name);
  }
}