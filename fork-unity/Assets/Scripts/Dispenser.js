#pragma strict
public var dispense : GameObject;
public var ejectForce : float = .25;

class ObstructionCheck {
  public var blocked : boolean = false;
  public var obstruction : Rigidbody;
  public var distance : float;
}

function Start () {

}

function activate(activation) {
  var hopper : ObstructionCheck = hopper_blocked();
  //Debug.Log("activated!");
  if (!hopper.blocked) {
    Instantiate(dispense, transform.position + (transform.up * 1.78), Quaternion.identity);
  }
}

function Update () {
  var hopper : ObstructionCheck = hopper_blocked();
  if (hopper.blocked) {
    if (hopper.obstruction && (hopper.distance < .1)) {
      hopper.obstruction.AddForce(transform.forward * ejectForce, ForceMode.VelocityChange);
    }
  }
}

function hopper_blocked() {
  var hopper : ObstructionCheck = new ObstructionCheck();
  var hit_info : RaycastHit;
  var hopper_bottom = transform.position + (transform.up * .5) + (transform.forward * -.6);
  Debug.DrawLine(transform.position, transform.position + (transform.up * 2), Color.green);
  if (Physics.Raycast(transform.position, transform.up, hit_info, 2)) {
    //Debug.Log("Hopper full!");
    hopper.blocked = true;
    hopper.obstruction = hit_info.rigidbody;
    hopper.distance = hit_info.distance;
  } else {
    hopper.blocked = false;
  }
  return hopper;
}
