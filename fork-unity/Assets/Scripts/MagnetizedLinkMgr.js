#pragma strict
import System.Collections.Generic;

// Magnetized Link Manager
// This script manages the connections between magnetized objects.
// it maintains the link graph and aligns the connected objects to each other

private var fixed_time : float = 0;
private var links = new Dictionary.<GameObject,GameObject>();
private var previous_links = new Dictionary.<GameObject,GameObject>();

function Start() {
}

function Update() {
}

function connect(object1 : GameObject, object2 : GameObject) {
  if (Time.fixedTime != fixed_time) {
    fixed_time = Time.fixedTime;
    previous_links = links;
    links = new Dictionary.<GameObject,GameObject>();
  }

  if (!already_linked(links, object1, object2)) {
    if (!(object1 in links)) {  // set up each object as a self-referenced node
      links[object1] = object1;
    }
    if (!(object2 in links)) {  // if it does not exist already
      links[object2] = object2;
    }
    link_objects(object1, object2);
  }
}

// connect two link graphs together into a single graph
function link_objects(object1 : GameObject, object2 : GameObject) {
  var swap : GameObject = links[object1];
  links[object1] = links[object2];  // link the two graphs together
  links[object2] = swap;
  if (!already_linked(previous_links, object1, object2)) {
    Debug.Log("Made a new connection! #" + connection_count(object1));
  }
}

// check a link graph for the existence of a connection between two objects
function already_linked(link_list : Dictionary.<GameObject,GameObject>, object1 : GameObject, object2 : GameObject) {
  var linked = false;
  if (object1 in link_list) {
    var current_node = link_list[object1];
    while ((current_node != object1) && !linked) {  // traverse the chain looking for the target object
      if (current_node == object2) {
        linked = true;
      } else {
        current_node = link_list[current_node];
      }
    }
  }
  return linked;
}

// this function actually returns the chain count of the LAST frame, so we have a real answer
function connection_count(object1 : GameObject) {
  var count = 1;
  if (object1 in links) {
    var current_node = links[object1];
    while (current_node != object1) {  // traverse the chain looking for the target object
      count++;
      current_node = links[current_node];
    }
  }
  return count;
}

/*

connect a, b

if hash[a].node

if a and b are already in the same chain
  do othing
otherwise if one (a) in in a chain and the other (b) isnt
   a shpould point to b and b to what a was pointing to
otherwise if both are in a chain a-b-c and d-e-f, connect a,d
  a points to what d was pointing to
  d points to what a was pointing to
  



*/