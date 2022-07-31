/*

"time_epoch"
"time_local"
"hostname"
"path"
"script_name"
"class_name"
"method_name"
"args"
"kwargs"
"exception_type"
"exception_message"
"stacktrace":traceback.format_exception(exc_type, exc_value,exc_traceback)
  Location
  Line
  type 
  deets 

*/


var SVG_NS ="http://www.w3.org/2000/svg";
var canvas = null;
var background_rectangle = null;

var websocket;
var interface = {};
const block_grid_x = [
  0,
  20,
  140,
  250,
  425,
  600,
  775,
  925,
  1050,
  1175  ,
  1300,
  1375,
  1485,
  1600,
  1700,
  2000,
  ];
const block_grid_y = [
  0,
  50,
  100,
  150,
  200,
  250,
  300,
  350,
  400,
  450,
  500,
  550,
  600,
  650];

hosts = {}

// ------------------- utils -------------------

function setAttributes(element, attributes_o){
  for (key in attributes_o) {
    if (attributes_o.hasOwnProperty(key)) {
      element.setAttribute(key,attributes_o[key]);
    }
  }
}

function degrees_to_radians(radians){
  return radians * Math.PI / 180;
}

function format_date(date_string){
  var epoch_ms = Date.parse(date_string);
  var dt = new Date(epoch_ms);
  var year = dt.getFullYear();
  var month = dt.getMonth() + 1;
  var date = dt.getDate() +1;
  var hours = dt.getHours();
  var minutes = dt.getMinutes();
  var seconds = dt.getSeconds();
  return year+":"+month+":"+date+" "+hours+":"+minutes+":"+seconds;
}


function format_df(df_a){
  console.log(df_a)
  df_1 = parseInt(df_a[0]);
  df_2 = parseInt(df_a[1]);
  df_1 = df_1 / 1000000000;
  df_2 = df_2 / 1000000000;
  return df_1.toFixed(2)+"/"+df_2.toFixed(2)+"GB";
}

function makeColor(num, den, error) { // receive numerator, denominator, error of interval
  error = Math.abs(error);
  var hex_a = ["00","11","22","33","44","55","66","77","88","99","aa","bb","cc","dd","ee","ff","ff"];
  var red_str = "00";
  var green_str = hex_a[num];
  var blue_str = hex_a[den];
  var color_str = "#" + red_str + green_str + blue_str;
  return color_str;
}

/* ========== N E T W O R K  ========== */



function websocket_connect() {
    console.log("connecting to wesockets")
    try {
        //console.log("readyState=",websocket.readyState)
        url = "ws://" + location.hostname + ":2181/"
        websocket = new WebSocket(url);
        websocket.onopen = function (evt) { websocket_open(evt) };
        websocket.onclose = function () { websocket_close() };
        websocket.onmessage = function (evt) { websocket_message_handler(evt) };
        websocket.onerror = function (evt) { websocket_error_handler(evt) };
    }
    catch (e) {
        console.log(e)
        console.log("connection failed")
    }
}

function websocket_send(evt) {
    websocket.send("Sample data ")
    console.log(evt)
}
function websocket_open(evt) {
    console.log("send test websocket message")
    try {
        websocket.send("Sending test message from dashboard client")

    } catch (e) {
        console.log(e)
    }

    window.clearInterval(timers.retry_connection)
    timers.retry_connection = false;
    console.log(evt)
}
function websocket_close() {
    if (timers.retry_connection == false) {
        //timers.retry_connection = window.setInterval(try_to_connect, 1000);
    }
    // console.log("closed")
}

function sendTrigger(command) {
    console.log("Sending command ", command)
    websocket.send(command)
}

function websocket_message_handler(evt) {
    console.log(">> data received" + evt.data)
    var topic_data_origin = JSON.parse(evt.data);
    //console.log(topic_data_origin)
    var topic = topic_data_origin[0];
    var message = eval(topic_data_origin[1]);
    var origin = topic_data_origin[2];
    switch (topic) {
      case "deadman":
        break;
      case "response_sdc_start_status":
          console.log(flags_sdc,message["flags_sdc"])
        break;
      case "response_computer_start_status":
        break;


//data received["response_sdc_start_status", {"flags_sdc": [], "flags_motor1": [], "flags_motor2": [], "encoder_ppr_value_motor1": 51, "operating_mode_motor1": 1, "pid_differential_gain_motor1": 1.0, "pid_integral_gain_motor1": 2.0, "pid_proportional_gain_motor1": 1.0, "encoder_ppr_value_motor2": 51, "operating_mode_motor2": 1, "pid_differential_gain_motor2": 1.0, "pid_integral_gain_motor2": 2.0, "pid_proportional_gain_motor2": 1.0, "firmware_version": "Roboteq v1.8d SDC2XXX 1/8/2018"}, "rotors0102"]
//data received["response_computer_start_status", {"hostname": "rotors0102", "local_ip": "192.168.1.9", "online_status": true, "connections": [true, {"controller": true}], "os_version": {"name": "ubuntu", "version": "22.04"}, "tb_git_timestamp": "Sun Jul 31 12:17:32 2022 -0400\n", "tb_scripts_version": 0.0, "app_git_timestamp": "Sun Jul 31 09:22:12 2022 -0400\n", "app_scripts_version": 0.0}, "rotors0102"]



    }
}
function websocket_error_handler(evt) {
    console.log("websocket_error_handler", evt)
    if (timers.retry_connection == false) {
        //timers.retry_connection = window.setInterval(try_to_connect, 1000);
    }
}

function try_to_connect() {
    console.log("try_to_connect")
    try {
        websocket_connect()
    }
    catch (e) {
        console.log("connection failed")
    }
}

timers = {
    retry_connection: window.setInterval(try_to_connect, 1000)
}
function update_display_values(data){
  console.log(data)
}









////////// SVG ELEMENT CONVENIENCE METHODS //////////
function create_rectangle(dom_parent, attributes_o = new Object()) {
  var rect = document.createElementNS( SVG_NS, "rect" );
  setAttributes(rect, attributes_o);
  dom_parent.appendChild(rect)
  return rect;
}
function create_text(dom_parent, display_text, attributes_o = new Object()) {
  var text_container = document.createElementNS( SVG_NS, "text");
  setAttributes(text_container, attributes_o);
  text_container.appendChild(document.createTextNode(""))
  text_container.update_text = function(new_text){
    var textnode = document.createTextNode(new_text);
    text_container.replaceChild(textnode, text_container.childNodes[0]);
  }
  text_container.update_text(display_text);
  dom_parent.appendChild(text_container)
  return text_container;
}
function create_group(dom_parent, attributes_o = new Object()){
  var group = document.createElementNS( SVG_NS, "g");
  setAttributes(group, attributes_o);
  dom_parent.appendChild(group);
  return group;
}
function create_path(dom_parent, attributes_o = new Object()){
  var path = document.createElementNS( SVG_NS, "path");
  setAttributes(path, attributes_o);
  dom_parent.appendChild(path);
  return path;
}
function create_ellipse(dom_parent, attributes_o = new Object()){
  var ellipse = document.createElementNS( SVG_NS, "ellipse");
  setAttributes(ellipse, attributes_o);
  dom_parent.appendChild(ellipse);
  return ellipse;
}
function create_group_from_array_of_paths(dom_parent, array_of_paths, path_attributes_o = new Object(), group_attributes_o = new Object()){
    var group = create_group(dom_parent, group_attributes_o = new Object());
    for (path_i=0; path_i<array_of_paths.length;path_i++){
      var path = array_of_paths[path_i];
      create_path(
        group,
        {
          d:path,
          class:"carousel_segment"
        }
      )
    }
    return group;
}








////////// INTERFACE COMPONENT CONSTRUCTORS //////////


class Block_Title_Horizontal{
  constructor(dom_parent, coordinates, title_text) {
    this.title_text = title_text;
    this.dom_parent = dom_parent;
    this.container = create_group(
      this.dom_parent,
      {
        class:"status_block_name_value",
        transform:`matrix(1,0,0,1,${coordinates[0]},${coordinates[1]})`,
      }
    );
    this.title_display = create_text(this.container, this.title_text, {class:"status_block_title"});
    this.set_value(this.title_text); 
  }
  set_value(value){
    let textnode = document.createTextNode(value);
    this.title_display.replaceChild(textnode, this.title_display.childNodes[0]);
    let offset_for_right_justify = this.dom_parent.getBBox().width - this.title_display.getBBox().width - 30;
    this.title_display.setAttribute("transform", `translate(${offset_for_right_justify},0)`);
  }
}


class Block_Title_Vertical{
  constructor(dom_parent, coordinates, title_text) {
    this.title_text = title_text;
    this.dom_parent = dom_parent;
    this.container = create_group(
      this.dom_parent,
      {
        class:"status_block_name_value",
        transform:`matrix(1,0,0,1,${coordinates[0]},${coordinates[1]})`,
      }
    );
    this.title_display = create_text(this.container, this.title_text, {class:"status_block_value"});
    this.set_value(this.title_text); 
  }
  set_value(value){
    let textnode = document.createTextNode(value);
    this.title_display.replaceChild(textnode, this.title_display.childNodes[0]);
    let offset_for_right_justify = this.dom_parent.getBBox().width - this.title_display.getBBox().width - 30;
    this.title_display.setAttribute("transform", `translate(${offset_for_right_justify},0)`);
  }
}


class Block_Display_Text{
  constructor(dom_parent, coordinates, display_text, width) {
    this.display_text = display_text;
    this.dom_parent = dom_parent;
    this.container = create_group(
      this.dom_parent,
      {
        class:"status_block_name_value",
        transform:`matrix(1,0,0,1,${coordinates[0]+5},${coordinates[1]+25})`,
      }
    );
    this.text_container = create_text(this.container, this.display_text, {class:"status_block_value"});
    this.set_text(this.display_text);

    this.local_ip_rect  = create_rectangle(
      this.dom_parent,
      {
        class:"cell_static_0",
        transform:`matrix(1,0,0,1,${coordinates[0]},${coordinates[1]})`,
      }
    )
    this.local_ip_rect.setAttribute("style",`width:`+width+`px`);
    
  }
  set_text(value){
    let textnode = document.createTextNode(value);
    this.text_container.replaceChild(textnode, this.text_container.childNodes[0]);
  };
  set_priority(value){ //-1,0,1
    if (value==0){
      this.local_ip_rect.setAttribute("class",`cell_static_0`);
    }
    if (value==1){
      this.local_ip_rect.setAttribute("class",`cell_static_1`);
    }
  }
}

class Block_Display_Bool{
  constructor(dom_parent, coordinates, title_text) {
    this.title_text = title_text;
    this.dom_parent = dom_parent;
    this.container = create_group(
      this.dom_parent,
      {
        class:"status_block_name_value",
        transform:`matrix(1,0,0,1,${coordinates[0]},${coordinates[1]})`,
      }
    );
    this.title_display = create_text(this.container, this.title_text, {class:"status_block_value"});
    this.set_value(this.title_text); 
  }
  set_value(value){
    let textnode = document.createTextNode(value);
    this.value_display.replaceChild(textnode, this.value_display.childNodes[0]);
    let offset_for_right_justify = this.dom_parent.getBBox().width - this.value_display.getBBox().width - 30;
    this.value_display.setAttribute("transform", `translate(${offset_for_right_justify},0)`);
  }
}

class Block_Display_Graph{
  constructor(dom_parent, coordinates, title_text) {
    this.title_text = title_text;
    this.dom_parent = dom_parent;
    this.container = create_group(
      this.dom_parent,
      {
        class:"status_block_name_value",
        transform:`matrix(1,0,0,1,${coordinates[0]},${coordinates[1]})`,
      }
    );
    this.title_display = create_text(this.container, this.title_text, {class:"status_block_value"});
    this.set_value(this.title_text); 
  }
  set_value(value){
    let textnode = document.createTextNode(value);
    this.value_display.replaceChild(textnode, this.value_display.childNodes[0]);
    let offset_for_right_justify = this.dom_parent.getBBox().width - this.value_display.getBBox().width - 30;
    this.value_display.setAttribute("transform", `translate(${offset_for_right_justify},0)`);
  }
}

class Block_Button{
  constructor(dom_parent, listener, coordinates, display_text, width) {
    this.display_text = display_text;
    this.dom_parent = dom_parent;
    this.container = create_group(
      this.dom_parent,
      {
        class:"status_block_name_value",
        transform:`matrix(1,0,0,1,${coordinates[0]+5},${coordinates[1]+25})`,
      }
    );
    this.text_container = create_text(this.container, this.display_text, {class:"status_block_value"});
    this.set_text(this.display_text);
    this.button_rect  = create_rectangle(
      this.dom_parent,
      {
        class:"cell_button_0",
        transform:`matrix(1,0,0,1,${coordinates[0]},${coordinates[1]})`,
      }
    )
    this.button_rect.class_ref = exception_details
    this.button_rect.setAttribute("style",`width:`+width+`px`);
    this.button_rect.addEventListener("click",listener)
  }
  set_text(value){
    let textnode = document.createTextNode(value);
    this.text_container.replaceChild(textnode, this.text_container.childNodes[0]);
  };
  set_priority(value){ //-1,0,1
    if (value==0){
      this.button_rect.setAttribute("class",`cell_button_0`);
    }
    if (value==1){
      this.button_rect.setAttribute("class",`cell_button_0`);
    }
  }
}

class Row{
  constructor(dom_parent, y_position
    ) {
    this.dom_parent = dom_parent;
    this.restart = new Block_Button(this.dom_parent, exception_details.toggle_visibility, [block_grid_x[1],y_position], "1000 h", 100)
    this.reboot = new Block_Button(this.dom_parent, exception_details.toggle_visibility, [block_grid_x[2],y_position], "1000 h", 100)
    this.tb_git_time = new Block_Button(this.dom_parent, exception_details.toggle_visibility, [block_grid_x[3],y_position], "...", 160)
    this.app_git_time = new Block_Button(this.dom_parent, exception_details.toggle_visibility, [block_grid_x[4],y_position], ".!.", 160)
    this.ip_local = new Block_Display_Text(this.dom_parent, [block_grid_x[6],y_position], "192.168.0.200", 140)
    this.exceptions = new Block_Button(this.dom_parent, exception_details.toggle_visibility, [block_grid_x[7],y_position], "...", 100)
    this.status = new Block_Button(this.dom_parent, exception_details.toggle_visibility, [block_grid_x[8],y_position], "...", 100)
    this.messages = new Block_Button(this.dom_parent, exception_details.toggle_visibility, [block_grid_x[9],y_position], "...", 100)
    this.cpu = new Block_Display_Text(this.dom_parent, [block_grid_x[10],y_position], "100%", 60)
    this.mem = new Block_Display_Text(this.dom_parent, [block_grid_x[11],y_position], "8888MB", 100)
    this.disk = new Block_Display_Text(this.dom_parent, [block_grid_x[12],y_position], "8888MB", 100)
    this.voltage = new Block_Display_Text(this.dom_parent, [block_grid_x[13],y_position], "3.33V", 80)
    this.os_version = new Block_Display_Text(this.dom_parent, [block_grid_x[14],y_position], "Linux feral 5.15.0-41-generic", 280)
  }
}

class Details_Display{
  constructor(dom_parent,coordinates,classname
    ) {
    this.dom_parent = dom_parent;
    this.background_rect  = create_rectangle(
      this.dom_parent,
      {
        class:"exception_details_rect",
        transform:`matrix(1,0,0,1,${coordinates[0]},${coordinates[1]})`,
      }
    )
    this.hide()
  }
  hide(){
    this.visible = false;
    this.dom_parent.removeChild(this.background_rect)
  }
  show(){
    this.visible = true;
    this.dom_parent.appendChild(this.background_rect)
  }
  toggle_visibility(e){
    self = e.target.class_ref
    console.log(e.target.class_ref)
    if(self.visible){
      self.hide()
    }else{
      self.show()
    }
  }
}

/* ########### D I S P L A Y S ########### */
function init() {
  canvas = document.getElementById( "top_level" );
  var background_rectangle = create_rectangle(canvas,{id:"background_rect"})
  interface.mode_title = create_text(canvas, "MODE: WAITING_FOR_CONNECTIONS", {class:"title_text",id:"mode_title"})
  interface.high_power_title = create_text(canvas, "HIGH POWER: OFF", {class:"title_text",id:"high_power_title"})

  exception_details = new Details_Display(canvas, [20,500], "exception_details_rect")

  new Block_Title_Horizontal(canvas, [block_grid_x[1],block_grid_y[1]], "runtime")
  new Block_Title_Horizontal(canvas, [block_grid_x[2],block_grid_y[1]], "uptime")
  new Block_Title_Horizontal(canvas, [block_grid_x[3],block_grid_y[1]], "tb_git")
  new Block_Title_Horizontal(canvas, [block_grid_x[4],block_grid_y[1]], "app_git")
  new Block_Title_Horizontal(canvas, [block_grid_x[6],block_grid_y[1]], "ip")
  new Block_Title_Horizontal(canvas, [block_grid_x[7],block_grid_y[1]], "errors")
  new Block_Title_Horizontal(canvas, [block_grid_x[8],block_grid_y[1]], "status")
  new Block_Title_Horizontal(canvas, [block_grid_x[9],block_grid_y[1]], "msgs")
  new Block_Title_Horizontal(canvas, [block_grid_x[10],block_grid_y[1]], "cpu")
  new Block_Title_Horizontal(canvas, [block_grid_x[11],block_grid_y[1]], "mem")
  new Block_Title_Horizontal(canvas, [block_grid_x[12],block_grid_y[1]], "disk")
  new Block_Title_Horizontal(canvas, [block_grid_x[13],block_grid_y[1]], "core")
  new Block_Title_Horizontal(canvas, [block_grid_x[14],block_grid_y[1]], "OS")
  new Block_Title_Horizontal(canvas, [block_grid_x[15],block_grid_y[1]], "")

  new Block_Title_Horizontal(canvas, [block_grid_x[5],block_grid_y[2]], "controller")
  new Block_Title_Horizontal(canvas, [block_grid_x[5],block_grid_y[3]], "rotor0102")
  new Block_Title_Horizontal(canvas, [block_grid_x[5],block_grid_y[4]], "rotor0304")
  new Block_Title_Horizontal(canvas, [block_grid_x[5],block_grid_y[5]], "rotor0506")
  new Block_Title_Horizontal(canvas, [block_grid_x[5],block_grid_y[6]], "rotor0708")
  new Block_Title_Horizontal(canvas, [block_grid_x[5],block_grid_y[7]], "rotor0910")
  new Block_Title_Horizontal(canvas, [block_grid_x[5],block_grid_y[8]], "rotor1112")
  new Block_Title_Horizontal(canvas, [block_grid_x[5],block_grid_y[9]], "rotor1314")

  hosts["controller"] = new Row(canvas, block_grid_y[2])
  hosts["rotor0102"] = new Row(canvas, block_grid_y[3])
  hosts["rotor0304"] = new Row(canvas, block_grid_y[4])
  hosts["rotor0506"] = new Row(canvas, block_grid_y[5])
  hosts["rotor0708"] = new Row(canvas, block_grid_y[6])
  hosts["rotor0910"] = new Row(canvas, block_grid_y[7])
  hosts["rotor1112"] = new Row(canvas, block_grid_y[8])
  hosts["rotor1314"] = new Row(canvas, block_grid_y[9])

  //status_details = new Details_Display(canvas, [20,500], "exception_details_rect")
  //msg_details = new Details_Display(canvas, [20,500], "exception_details_rect")
}


