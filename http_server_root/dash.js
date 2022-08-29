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
  //console.log(df_a)
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

function padTo2Digits(num) {
  return num.toString().padStart(2, '0');
}

function formatDate(date) {
  return (
    [
      date.getFullYear(),
      padTo2Digits(date.getMonth() + 1),
      padTo2Digits(date.getDate()),
    ].join('-') +
    ' ' +
    [
      padTo2Digits(date.getHours()),
      padTo2Digits(date.getMinutes()),
      padTo2Digits(date.getSeconds()),
    ].join(':')
  );
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

function websocket_send(target,topic,message) {
    packet = JSON.stringify({ "target": target,"topic": topic,"message": message})
    console.log("websocket_send", packet)
    websocket.send(packet)
}

function websocket_open(evt) {
    console.log("send test websocket message")
    try {
        websocket_send("","","")
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
    console.log("=====================================================================")
    websocket.send(command)
}

function websocket_message_handler(evt) {
    //console.log(">> data received" + evt.data)
    var topic_data_origin = JSON.parse(evt.data);
    console.log(topic_data_origin)
    var topic = topic_data_origin[0];
    var message = eval(topic_data_origin[1]);
    var origin = topic_data_origin[2];
    switch (topic) {
      case "deadman":
          break;
      case "response_sdc_start_status":
          //console.log(message)
          var _keys_ = Object.keys(message)
          if(_keys_.length==0){
            return
          }
          controllers[origin].encoder_ppr_value_motor1.set_text(message["encoder_ppr_value_motor1"])
          controllers[origin].encoder_ppr_value_motor2.set_text(message["encoder_ppr_value_motor2"])
          controllers[origin].firmware_version.set_text(message["firmware_version"])
          controllers[origin].operating_mode_motor1.set_text(message["operating_mode_motor1"])
          controllers[origin].operating_mode_motor2.set_text(message["operating_mode_motor2"])
          var pid_1_str = message["pid_differential_gain_motor1"]+","+message["pid_integral_gain_motor1"]+","+message["pid_proportional_gain_motor1"]
          var pid_2_str = message["pid_differential_gain_motor2"]+","+message["pid_integral_gain_motor2"]+","+message["pid_proportional_gain_motor2"]
          controllers[origin].pid_1.set_text(pid_1_str)
          controllers[origin].pid_2.set_text(pid_2_str)
          break;
      case "response_sdc_runtime_status":
          var _keys_ = Object.keys(message)
          if(_keys_.length==0){
            return
          }
          controllers[origin].closed_loop_error_1.set_text(message["closed_loop_error_1"])
          controllers[origin].closed_loop_error_2.set_text(message["closed_loop_error_2"])
          controllers[origin].duty_cycle_1.set_text(message["duty_cycle_1"])
          controllers[origin].duty_cycle_2.set_text(message["duty_cycle_2"])
          controllers[origin].encoder_speed_relative_1.set_text(message["encoder_speed_relative_1"])
          controllers[origin].encoder_speed_relative_2.set_text(message["encoder_speed_relative_2"])
          if(message["emergency_stop"]==true){
            controllers[origin].emergency_stop.set_state(1)
            controllers[origin].idle_speed.set_state(1)
          }else{
            controllers[origin].emergency_stop.set_state(3)
            controllers[origin].idle_speed.set_state(3)
          }
          var volts_a = message["volts"].split(":")
          controllers[origin].volts_24.set_text(parseFloat(volts_a[1])/10)
          controllers[origin].volts_5.set_text(parseFloat(volts_a[2])/1000)
          controllers[origin].set_timestamp(parseInt(message["current_time"]))
          controllers[origin].set_colors_active(1)
          break;
      case "response_computer_start_status":
          hosts[origin].ip_local.set_text(message["local_ip"])
          let tb_date = new Date(parseInt(message["tb_git_timestamp"])*1000)
          hosts[origin].tb_git_time.set_text( formatDate(tb_date))
          let app_date = new Date(parseInt(message["tb_git_timestamp"])*1000)
          hosts[origin].app_git_time.set_text( formatDate(app_date))
          let os_version_str = message["os_version"]["name"] + " " + message["os_version"]["version"]
          hosts[origin].os_version.set_text(os_version_str)
          //console.log("online_status",message["online_status"])
          //console.log("connections",message["connections"]) //[true, {"controller": true}]
          //console.log("os_version",message["os_version"]) // {"name": "ubuntu", "version": "22.04"}
          hosts[origin].set_colors_active(1)
        break;
      case "response_computer_runtime_status":
          hosts[origin].temp.set_text(message["core_temp"])
          hosts[origin].voltage.set_text(message["core_voltage"])
          hosts[origin].cpu.set_text( parseFloat( message["system_cpu"] + "%").toFixed(2) )
          hosts[origin].reboot.set_text( ( parseFloat( message["system_uptime"] )/3600).toFixed(2) + "h")// "2022-06-30 21:05:37"
          hosts[origin].restart.set_text( ( parseFloat( message["system_runtime"])/3600).toFixed(2) + "h")// "2022-06-30 21:05:37"
          hosts[origin].disk.set_text( (parseInt(message["system_disk"][0])/1000000000).toFixed(2) + "GB")//[37196000.0, 926900000.0]
          hosts[origin].mem.set_text( (parseInt(message["memory_free"][0])/1000000).toFixed(2) + "MB")//[37196000.0, 926900000.0]
          hosts[origin].set_timestamp(parseInt(message["current_time"]))
          hosts[origin].set_colors_active(1)
        break;
      case "response_high_power":
          if (message==true){
            high_power_button.set_state(1)
          }
          else{
            high_power_button.set_state(3)
          }
        break;
      case "response_emergency_stop":
          if (message==true){
            controllers[origin].emergency_stop.set_state(1)
          }
          else{
            controllers[origin].emergency_stop.set_state(3)
          }
        break;
      case "response_motor_command_applied":
          var motor_number = message[0]
          var command = message[1]
          if (motor_number==1){
            controllers[origin].requested_speed_1.set_text(command)
          }
          if (motor_number==2){
            controllers[origin].requested_speed_2.set_text(command)
          }
        break;
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
class Panel_Static{
  constructor(dom_parent, coordinates, classname) {
    this.dom_parent = dom_parent;
    this.coordinates = coordinates;
    //this.classname = classname;
    this.container = create_group(
      this.dom_parent,
      {
        class:"status_block_name_value",
        transform:`matrix(1,0,0,1,${coordinates[0]},${coordinates[1]})`,
      }
    );
    this.container.setAttribute("style",`width:`+coordinates[2]+`px`);
    this.container.setAttribute("style",`height:`+coordinates[3]+`px`);
    this.container.setAttribute("class", classname);


  };
  show() {

  };
  hide() {

  }
}




function init() {
  canvas = document.getElementById( "top_level" );
  var background_rectangle = create_rectangle(canvas,{id:"background_rect"})


  new Panel_Static(
      background_rectangle, 
      [50,50,200,200], 
      "panel_static"
    )

}