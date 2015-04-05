#pragma strict
public var dispense : GameObject;
public var ejectForce : float = .1;
public var vendDelay = 4;
public var autoVend : boolean = false;

class ObstructionCheck {
  public var blocked : boolean = false;
  public var obstruction : Rigidbody;
  public var distance : float;
}

private var last_vend = 0;

function Start () {

}

function activate(activation) {
  var hopper : ObstructionCheck = hopper_blocked();
  //Debug.Log("activated!");
  if (!hopper.blocked) {
    vend();
  }
}

function vend() {
  if (Time.time > (last_vend + vendDelay)) {
    Instantiate(dispense, transform.position + (transform.up * 1.78), Quaternion.identity);
    //Debug.Log("Vend!");
    last_vend = Time.time;
  }
}

function Update () {
  var hopper : ObstructionCheck = hopper_blocked();
  if (hopper.blocked) {
    if (hopper.obstruction && (hopper.distance < 1.2)) {
      hopper.obstruction.AddForce(transform.forward * ejectForce, ForceMode.VelocityChange);
    }
  } else if (autoVend == true) {
    vend();
  }
}

function hopper_blocked() {
  var hopper : ObstructionCheck = new ObstructionCheck();
  var hit_info : RaycastHit;
  var hopper_back = transform.position + (transform.up * .5) + (transform.forward * -.6);
  //Debug.DrawLine(hopper_back, hopper_back + (transform.forward * 2), Color.green);
  if (Physics.Raycast(hopper_back, transform.forward, hit_info, 2)) {
    //Debug.Log("Hopper full!");
    hopper.blocked = true;
    hopper.obstruction = hit_info.rigidbody;
    hopper.distance = hit_info.distance;
  } else {
    hopper.blocked = false;
  }
  return hopper;
}
