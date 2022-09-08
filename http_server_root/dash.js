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
const key_grid_x = [
  0,
  20,
  100,
  180,
  260,
  340,
  420,
  500,
  580,
  660,
  740,
  820,
  900,
  980,
  1060,
  1140,
  1220,
  1300,
  1380,
  1460,
  1540,
  1620,
  1700,
  1780,
  1860,
  1940,
  ];
const block_grid_x = [
  0,
  20, 
  120,
  220,
  440,
  660,
  810,
  965,
  1090,
  1215,
  1340,
  1415,
  1585,
  1700,
  1800,
  1900,
  2250,
  ];
const block_grid_y = [
  0,
  40,
  80,
  120,
  160,
  200,
  240,
  280,
  320,
  360,
  500,
  550,
  600,
  650,
  700,
  750,
  800,
  850,
  900,
  950,
  1000,
  1050,
  1100,
  1150,
  1200,
  1250,
  1300,
  1450,
  1500,
  1550,
  1600];

hosts = {}
controllers = {}

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
    packet = JSON.stringify({ "target": target,"topic": topic,"message": message,"origin":"dashboard"})
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

class Block_Push_Button{
  constructor(dom_parent, hostname, coordinates, action_text, width) {
    this.action_text = action_text;
    this.hostname = hostname
    this.display_text = ""
    this.dom_parent = dom_parent;
    this.priority = 0
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
    this.button_rect.class_ref = this
    this.button_rect.setAttribute("style",`width:`+width+`px`);
    this.button_rect.addEventListener("click",this.handle_click)
    this.button_rect.addEventListener("mouseover",this.hover_state_on)
    this.button_rect.addEventListener("mouseout",this.hover_state_off)
  }
  handle_click(e){
    self = e.target.class_ref
    websocket_send(self.hostname,self.action_text,"")
  }
  hover_state_on(e){
    self = e.target.class_ref
    self.override_text()
  }
  hover_state_off(e){
    self = e.target.class_ref
    self.restore_text()
  }
  set_text(display_text){
    this.display_text = display_text
    let textnode = document.createTextNode(display_text);
    this.text_container.replaceChild(textnode, this.text_container.childNodes[0]);
  };
  override_text(){
    let textnode = document.createTextNode(this.action_text);
    this.text_container.replaceChild(textnode, this.text_container.childNodes[0]);
  };
  restore_text(){
    let textnode = document.createTextNode(this.display_text);
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
class Block_Toggle_Button{
  constructor(dom_parent, hostname, listener, coordinates, display_text, width) {
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

class Block_Five_State_Button{
  constructor(target_name, state_classes, state_labels, topic, coordinates) {
    this.dom_parent = canvas;
    this.target_name = target_name
    this.topic = topic
    this.states = ["inactive","true_confirmed","true_requested","false_confirmed","false_requested"]
    this.state_classes = state_classes
    this.state_labels = state_labels
    this.state = 0
    this.container = create_group(
      this.dom_parent,
      {
        class:"status_block_name_value",
        transform:`matrix(1,0,0,1,${coordinates[0]+5},${coordinates[1]+25})`,
      }
    );
    this.text_container = create_text(this.container, " ", {class:"status_block_value"});
    this.button_rect  = create_rectangle(
      this.dom_parent,
      {
        class:"cell_button_0",
        transform:`matrix(1,0,0,1,${coordinates[0]},${coordinates[1]})`,
      }
    )
    this.button_rect.class_ref = this
    this.button_rect.setAttribute("style",`width:`+coordinates[2]+`px`);
    this.button_rect.addEventListener("click",this.handle_click)
    this.set_state(0)
  }
  handle_click(e){
    self = e.target.class_ref
    if (self.state==1){
      self.set_state(4)
      websocket_send(self.target_name,self.topic,false)
      // setTimeout to restore button if no response
    }
    if (self.state==3){
      self.set_state(2)
      websocket_send(self.target_name,self.topic,true)
      // setTimeout to restore button if no response
    }
  }
  set_state(state_ord){
    this.state = state_ord
    this.set_label(state_ord)  
    this.set_class(state_ord)  
  }
  get_state(){
    return this.state
  }
  set_label(label_ord){
    this.state_label = label_ord
    let textnode = document.createTextNode(this.state_labels[label_ord]);
    this.text_container.replaceChild(textnode, this.text_container.childNodes[0]);
  }
  set_class(class_ord){
    this.button_rect.setAttribute("class", this.state_classes[class_ord]);
  }
}

class Row{
  constructor(hostname, y_position
    ) {
    this.dom_parent = canvas;
    this.restart = new Block_Push_Button(this.dom_parent, hostname, [block_grid_x[1],y_position], "restart", 80)
    this.reboot = new Block_Push_Button(this.dom_parent, hostname, [block_grid_x[2],y_position], "reboot", 80)
    this.tb_git_time = new Block_Push_Button(this.dom_parent, hostname, [block_grid_x[3],y_position], "pull thirtybirds", 200)
    this.app_git_time = new Block_Push_Button(this.dom_parent, hostname, [block_grid_x[4],y_position], "pull thewhale", 200)
    this.ip_local = new Block_Display_Text(this.dom_parent, [block_grid_x[6],y_position], "", 140)
    this.exceptions = new Block_Toggle_Button(this.dom_parent, hostname, exception_details.toggle_visibility, [block_grid_x[7],y_position], "...", 100)
    this.status = new Block_Toggle_Button(this.dom_parent, hostname, exception_details.toggle_visibility, [block_grid_x[8],y_position], "...", 100)
    this.messages = new Block_Toggle_Button(this.dom_parent, hostname, exception_details.toggle_visibility, [block_grid_x[9],y_position], "...", 100)
    this.cpu = new Block_Display_Text(this.dom_parent, [block_grid_x[10],y_position], "?%", 60)
    this.mem = new Block_Display_Text(this.dom_parent, [block_grid_x[11],y_position], "?MB", 100)
    this.disk = new Block_Display_Text(this.dom_parent, [block_grid_x[12],y_position], "?MB", 100)
    this.voltage = new Block_Display_Text(this.dom_parent, [block_grid_x[13],y_position], "?V", 80)
    this.temp = new Block_Display_Text(this.dom_parent, [block_grid_x[14],y_position], "?C", 80)
    this.os_version = new Block_Display_Text(this.dom_parent, [block_grid_x[15],y_position], "", 300)
    this.ts = 0
  }
  set_local_ip(value){
    this.ip_local.set_text(value)
  }
  set_timestamp(ts){
    this.ts = ts
  }
  get_timestamp(){
    return this.ts
  }
  set_colors_active(state){
    this.ip_local.set_priority(state)
    this.cpu.set_priority(state)
    this.mem.set_priority(state)
    this.disk.set_priority(state)
    this.voltage.set_priority(state)
    this.temp.set_priority(state)
    this.os_version.set_priority(state)
  }
  check_if_timestamp_is_fresh(){
    if( Math.abs(this.ts-(Date.now()/1000)) > 8 ){
      this.set_colors_active(0)
    }
  }
}

class SDCRow{
  constructor(hostname, rotor1name, rotor2name, y_position_1, y_position_2
    ) {
    this.dom_parent = canvas;
    this.volts_24 = new Block_Display_Text(this.dom_parent, [block_grid_x[1],y_position_1], "", 80)
    this.volts_5 = new Block_Display_Text(this.dom_parent, [block_grid_x[2],y_position_1], "", 80)
    this.emergency_stop = new Block_Five_State_Button(
        hostname, 
        ["button_five_state_inactive","button_five_state_true_confirmed","button_five_state_true_requested","button_five_state_false_confirmed","button_five_state_false_requested"],
        ["unconnected", "emergency stop on confirmed", "emergency stop on requested", "emergency stop off confirmed", "emergency stop off requested"],
        "request_emergency_stop",
        [block_grid_x[3],y_position_1,460]
      )
    this.idle_speed = new Block_Five_State_Button(
        hostname, 
        ["button_five_state_inactive","button_five_state_true_confirmed","button_five_state_true_requested","button_five_state_false_confirmed","button_five_state_false_requested"],
        ["unconnected", "idle speed confirmed", "idle stop requested", "idles stop confirmed", "idle speed requested"],
        "request_idle_speed",
        [block_grid_x[3],y_position_2,460]
      )
    this.rotor1name = new Block_Display_Text(this.dom_parent, [block_grid_x[5],y_position_1], rotor1name, 100)
    this.rotor2name = new Block_Display_Text(this.dom_parent, [block_grid_x[5],y_position_2], rotor2name, 100)
    //this.decrease_speed_1 = new Block_Display_Text(this.dom_parent, [block_grid_x[6],y_position_1], "-", 140)
    //this.decrease_speed_2 = new Block_Display_Text(this.dom_parent, [block_grid_x[6],y_position_2], "-", 140)
    //this.requested_speed_1 = new Block_Display_Text(this.dom_parent, [block_grid_x[7],y_position_1], "?", 100)
    //this.requested_speed_2 = new Block_Display_Text(this.dom_parent, [block_grid_x[7],y_position_2], "?", 100)
    //this.increase_speed_1 = new Block_Display_Text(this.dom_parent, [block_grid_x[8],y_position_1], "+", 100)
    //this.increase_speed_2 = new Block_Display_Text(this.dom_parent, [block_grid_x[8],y_position_2], "+", 100)
    this.decrease_speed_1 = new Block_Push_Button(this.dom_parent, rotor1name, [block_grid_x[6],y_position_1], "decrement", 140)
    this.decrease_speed_2 = new Block_Push_Button(this.dom_parent, rotor2name, [block_grid_x[6],y_position_2], "decrement", 140)
    this.requested_speed_1 = new Block_Push_Button(this.dom_parent, rotor1name, [block_grid_x[7],y_position_1], "stop", 100)
    this.requested_speed_2 = new Block_Push_Button(this.dom_parent, rotor2name, [block_grid_x[7],y_position_2], "stop", 100)
    this.increase_speed_1 = new Block_Push_Button(this.dom_parent, rotor1name, [block_grid_x[8],y_position_1], "increment", 100)
    this.increase_speed_2 = new Block_Push_Button(this.dom_parent, rotor2name, [block_grid_x[8],y_position_2], "increment", 100)
    this.duty_cycle_1 = new Block_Display_Text(this.dom_parent, [block_grid_x[9],y_position_1], "", 100)
    this.duty_cycle_2 = new Block_Display_Text(this.dom_parent, [block_grid_x[9],y_position_2], "", 100)
    this.closed_loop_error_1 = new Block_Display_Text(this.dom_parent, [block_grid_x[10],y_position_1], "", 60)
    this.closed_loop_error_2 = new Block_Display_Text(this.dom_parent, [block_grid_x[10],y_position_2], "", 60)
    this.encoder_speed_relative_1 = new Block_Display_Text(this.dom_parent, [block_grid_x[11],y_position_1], "", 100)
    this.encoder_speed_relative_2 = new Block_Display_Text(this.dom_parent, [block_grid_x[11],y_position_2], "", 100)
    this.pid_1 = new Block_Display_Text(this.dom_parent, [block_grid_x[12],y_position_1], "", 100)
    this.pid_2 = new Block_Display_Text(this.dom_parent, [block_grid_x[12],y_position_2], "", 100)
    this.operating_mode_motor1 = new Block_Display_Text(this.dom_parent, [block_grid_x[13],y_position_1], "", 80)
    this.operating_mode_motor2 = new Block_Display_Text(this.dom_parent, [block_grid_x[13],y_position_2], "", 80)
    this.encoder_ppr_value_motor1 = new Block_Display_Text(this.dom_parent, [block_grid_x[14],y_position_1], "", 80)
    this.encoder_ppr_value_motor2 = new Block_Display_Text(this.dom_parent, [block_grid_x[14],y_position_2], "", 80)
    this.firmware_version = new Block_Display_Text(this.dom_parent, [block_grid_x[15],y_position_1], "", 300)
  }
  set_local_ip(value){
    this.ip_local.set_text(value)
  }
  set_timestamp(ts){
    this.ts = ts
  }
  get_timestamp(){
    return this.ts
  }
  set_colors_active(state){
    this.volts_24.set_priority(state)
    this.volts_5.set_priority(state)
    this.pid_1.set_priority(state)
    this.pid_2.set_priority(state)
    this.operating_mode_motor1.set_priority(state)
    this.operating_mode_motor2.set_priority(state)
    this.encoder_ppr_value_motor1.set_priority(state)
    this.encoder_ppr_value_motor2.set_priority(state)
    this.firmware_version.set_priority(state)
  }
  check_if_timestamp_is_fresh(){
    if( Math.abs(this.ts-(Date.now()/1000)) > 10 ){
      this.set_colors_active(0)
    }
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
    //console.log(e.target.class_ref)
    if(self.visible){
      self.hide()
    }else{
      self.show()
    }
  }
}

function toggle_24v_power(e){
  console.log(e)
}

//high_power_button = new Block_Toggle_Button(document.getElementById( "top_level" ), "", toggle_24v_power, [block_grid_x[1],0], "24V POWER", 200)

/* ########### D I S P L A Y S ########### */
function init() {
  canvas = document.getElementById( "top_level" );
  var background_rectangle = create_rectangle(canvas,{id:"background_rect"})
  //interface.mode_title = create_text(canvas, "MODE: WAITING_FOR_CONNECTIONS", {class:"title_text",id:"mode_title"})

  exception_details = new Details_Display(canvas, [20,500], "exception_details_rect")

  new Block_Title_Horizontal(canvas, [block_grid_x[1],block_grid_y[1]], "runtime")
  new Block_Title_Horizontal(canvas, [block_grid_x[2],block_grid_y[1]], "uptime")
  new Block_Title_Horizontal(canvas, [block_grid_x[3],block_grid_y[1]], "tb_git")
  new Block_Title_Horizontal(canvas, [block_grid_x[4],block_grid_y[1]], "app_git")
  new Block_Title_Horizontal(canvas, [block_grid_x[5],block_grid_y[1]], "computer")
  new Block_Title_Horizontal(canvas, [block_grid_x[6],block_grid_y[1]], "ip")
  new Block_Title_Horizontal(canvas, [block_grid_x[7],block_grid_y[1]], "errors")
  new Block_Title_Horizontal(canvas, [block_grid_x[8],block_grid_y[1]], "status")
  new Block_Title_Horizontal(canvas, [block_grid_x[9],block_grid_y[1]], "msgs")
  new Block_Title_Horizontal(canvas, [block_grid_x[10],block_grid_y[1]], "cpu")
  new Block_Title_Horizontal(canvas, [block_grid_x[11],block_grid_y[1]], "mem")
  new Block_Title_Horizontal(canvas, [block_grid_x[12],block_grid_y[1]], "disk")
  new Block_Title_Horizontal(canvas, [block_grid_x[13],block_grid_y[1]], "core")
  new Block_Title_Horizontal(canvas, [block_grid_x[14],block_grid_y[1]], "temp")
  new Block_Title_Horizontal(canvas, [block_grid_x[15],block_grid_y[1]], "OS")

  new Block_Title_Horizontal(canvas, [block_grid_x[5],block_grid_y[2]], "controller")
  new Block_Title_Horizontal(canvas, [block_grid_x[5],block_grid_y[3]], "rotors0102")
  new Block_Title_Horizontal(canvas, [block_grid_x[5],block_grid_y[4]], "rotors0304")
  new Block_Title_Horizontal(canvas, [block_grid_x[5],block_grid_y[5]], "rotors0506")
  new Block_Title_Horizontal(canvas, [block_grid_x[5],block_grid_y[6]], "rotors0708")
  new Block_Title_Horizontal(canvas, [block_grid_x[5],block_grid_y[7]], "rotors0910")
  new Block_Title_Horizontal(canvas, [block_grid_x[5],block_grid_y[8]], "rotors1112")
  new Block_Title_Horizontal(canvas, [block_grid_x[5],block_grid_y[9]], "rotors1314")

  hosts["controller"] = new Row("controller", block_grid_y[2])
  hosts["rotors0102"] = new Row("rotors0102", block_grid_y[3])
  hosts["rotors0304"] = new Row("rotors0304", block_grid_y[4])
  hosts["rotors0506"] = new Row("rotors0506", block_grid_y[5])
  hosts["rotors0708"] = new Row("rotors0708", block_grid_y[6])
  hosts["rotors0910"] = new Row("rotors0910", block_grid_y[7])
  hosts["rotors1112"] = new Row("rotors1112", block_grid_y[8])
  hosts["rotors1314"] = new Row("rotors1314", block_grid_y[9])
  //status_details = new Details_Display(canvas, [20,500], "exception_details_rect")
  //msg_details = new Details_Display(canvas, [20,500], "exception_details_rect")

  new Block_Title_Horizontal(canvas, [block_grid_x[1],block_grid_y[10]], "24V")
  new Block_Title_Horizontal(canvas, [block_grid_x[2],block_grid_y[10]], "5V")
  new Block_Title_Horizontal(canvas, [block_grid_x[3],block_grid_y[10]], "emergency stop")
  //new Block_Title_Horizontal(canvas, [block_grid_x[4],block_grid_y[10]], "emergency stop")
  new Block_Title_Horizontal(canvas, [block_grid_x[5],block_grid_y[10]], "rotor")
  new Block_Title_Horizontal(canvas, [block_grid_x[6],block_grid_y[10]], "- - -")
  new Block_Title_Horizontal(canvas, [block_grid_x[7],block_grid_y[10]], "speed")
  new Block_Title_Horizontal(canvas, [block_grid_x[8],block_grid_y[10]], "+ + +")
  new Block_Title_Horizontal(canvas, [block_grid_x[9],block_grid_y[10]], "duty cycle")
  new Block_Title_Horizontal(canvas, [block_grid_x[10],block_grid_y[10]], "error")
  new Block_Title_Horizontal(canvas, [block_grid_x[11],block_grid_y[10]], "encoder")
  new Block_Title_Horizontal(canvas, [block_grid_x[12],block_grid_y[10]], "PID")
  new Block_Title_Horizontal(canvas, [block_grid_x[13],block_grid_y[10]], "mode")
  new Block_Title_Horizontal(canvas, [block_grid_x[14],block_grid_y[10]], "ppr")
  new Block_Title_Horizontal(canvas, [block_grid_x[15],block_grid_y[10]], "driver")

  controllers["rotors0102"] = new SDCRow("rotors0102","rotor01","rotor02", block_grid_y[11], block_grid_y[12])
  controllers["rotors0304"] = new SDCRow("rotors0304","rotor03","rotor04", block_grid_y[13], block_grid_y[14])
  controllers["rotors0506"] = new SDCRow("rotors0506","rotor05","rotor06", block_grid_y[15], block_grid_y[16])
  controllers["rotors0708"] = new SDCRow("rotors0708","rotor07","rotor08", block_grid_y[17], block_grid_y[18])
  controllers["rotors0910"] = new SDCRow("rotors0910","rotor09","rotor10", block_grid_y[19], block_grid_y[20])
  controllers["rotors1112"] = new SDCRow("rotors1112","rotor11","rotor12", block_grid_y[21], block_grid_y[22])
  controllers["rotors1314"] = new SDCRow("rotors1314","rotor13","rotor14", block_grid_y[23], block_grid_y[24])

  high_power_button = new Block_Five_State_Button(
    "controller", 
    ["button_five_state_inactive","button_five_state_true_confirmed","button_five_state_true_requested","button_five_state_false_confirmed","button_five_state_false_requested"],
    ["unconnected", "power on confirmed", "power on requested", "power off confirmed", "power off requested"],
    "request_high_power",
    [block_grid_x[1],block_grid_y[0],300]
  )
  mode_connection_button = new Block_Five_State_Button(
    "controller", 
    ["button_five_state_inactive","button_five_state_true_confirmed","button_five_state_true_requested","button_five_state_false_confirmed","button_five_state_false_requested"],
    ["unconnected", "power on confirmed", "power on requested", "waiting for connections", "power off requested"],
    "request_high_power",
    [block_grid_x[4],block_grid_y[0],300]
  )
  mode_connection_button.set_state(3)
  mode_midi_button = new Block_Five_State_Button(
    "controller", 
    ["button_five_state_inactive","button_five_state_true_confirmed","button_five_state_true_requested","button_five_state_false_confirmed","button_five_state_false_requested"],
    ["unconnected", "MIDI Input", "power on requested", "waiting for connections", "power off requested"],
    "request_high_power",
    [block_grid_x[6],block_grid_y[0],260]
  )
  mode_midi_button.set_state(1)
  mode_file_button = new Block_Five_State_Button(
    "controller", 
    ["button_five_state_inactive","button_five_state_true_confirmed","button_five_state_true_requested","button_five_state_false_confirmed","button_five_state_false_requested"],
    ["unconnected", "Music File Input", "power on requested", "waiting for connections", "power off requested"],
    "request_high_power",
    [block_grid_x[8],block_grid_y[0],300]
  )
  mode_file_button.set_state(1)

  note_C3_button = new Block_Five_State_Button(
    "controller", 
    ["button_five_state_inactive","button_five_state_true_confirmed","button_five_state_true_requested","button_five_state_false_confirmed","button_five_state_false_requested"],
    ["off", "C3 on", "C3_on", "C3 off", "C3_off"],
    "request_C3",
    [key_grid_x[1],block_grid_y[25],70]
  )
  note_C3_button.set_state(3)

  note_Db3_button = new Block_Five_State_Button(
    "controller", 
    ["button_five_state_inactive","button_five_state_true_confirmed","button_five_state_true_requested","button_five_state_false_confirmed","button_five_state_false_requested"],
    ["off", "Db3 on", "Db3_on", "Db3 off", "Db3_off"],
    "request_Db3",
    [key_grid_x[2],block_grid_y[25],70]
  )
  note_Db3_button.set_state(3)

  note_D3_button = new Block_Five_State_Button(
    "controller", 
    ["button_five_state_inactive","button_five_state_true_confirmed","button_five_state_true_requested","button_five_state_false_confirmed","button_five_state_false_requested"],
    ["off", "D3 on", "D3_on", "D3 off", "D3_off"],
    "request_D3",
    [key_grid_x[3],block_grid_y[25],70]
  )
  note_D3_button.set_state(3)

  note_Eb3_button = new Block_Five_State_Button(
    "controller", 
    ["button_five_state_inactive","button_five_state_true_confirmed","button_five_state_true_requested","button_five_state_false_confirmed","button_five_state_false_requested"],
    ["off", "Db3 on", "Eb3_on", "Eb3 off", "Eb3_off"],
    "request_Db3",
    [key_grid_x[4],block_grid_y[25],70]
  )
  note_Eb3_button.set_state(3)

  note_E3_button = new Block_Five_State_Button(
    "controller", 
    ["button_five_state_inactive","button_five_state_true_confirmed","button_five_state_true_requested","button_five_state_false_confirmed","button_five_state_false_requested"],
    ["off", "E3 on", "E3_on", "E3 off", "E3_off"],
    "request_E3",
    [key_grid_x[5],block_grid_y[25],70]
  )
  note_E3_button.set_state(3)

  note_F3_button = new Block_Five_State_Button(
    "controller", 
    ["button_five_state_inactive","button_five_state_true_confirmed","button_five_state_true_requested","button_five_state_false_confirmed","button_five_state_false_requested"],
    ["off", "F3 on", "F3_on", "F3 off", "F3_off"],
    "request_F3",
    [key_grid_x[6],block_grid_y[25],70]
  )
  note_F3_button.set_state(3)

  note_Gb3_button = new Block_Five_State_Button(
    "controller", 
    ["button_five_state_inactive","button_five_state_true_confirmed","button_five_state_true_requested","button_five_state_false_confirmed","button_five_state_false_requested"],
    ["off", "Gb3 on", "Gb3_on", "Gb3 off", "Gb3_off"],
    "request_Gb3",
    [key_grid_x[7],block_grid_y[25],70]
  )
  note_Gb3_button.set_state(3)

  note_G3_button = new Block_Five_State_Button(
    "controller", 
    ["button_five_state_inactive","button_five_state_true_confirmed","button_five_state_true_requested","button_five_state_false_confirmed","button_five_state_false_requested"],
    ["off", "G3 on", "G3_on", "G3 off", "G3_off"],
    "request_G3",
    [key_grid_x[8],block_grid_y[25],70]
  )
  note_G3_button.set_state(3)

  note_Ab3_button = new Block_Five_State_Button(
    "controller", 
    ["button_five_state_inactive","button_five_state_true_confirmed","button_five_state_true_requested","button_five_state_false_confirmed","button_five_state_false_requested"],
    ["off", "Ab3 on", "Ab3_on", "Ab3 off", "Ab3_off"],
    "request_Ab3",
    [key_grid_x[9],block_grid_y[25],70]
  )
  note_Ab3_button.set_state(3)

  note_A3_button = new Block_Five_State_Button(
    "controller", 
    ["button_five_state_inactive","button_five_state_true_confirmed","button_five_state_true_requested","button_five_state_false_confirmed","button_five_state_false_requested"],
    ["off", "A3 on", "A3_on", "A3 off", "A3_off"],
    "request_A3",
    [key_grid_x[10],block_grid_y[25],70]
  )
  note_A3_button.set_state(3)

  note_Bb3_button = new Block_Five_State_Button(
    "controller", 
    ["button_five_state_inactive","button_five_state_true_confirmed","button_five_state_true_requested","button_five_state_false_confirmed","button_five_state_false_requested"],
    ["off", "Bb3 on", "Bb3_on", "Bb3 off", "Bb3_off"],
    "request_Bb3",
    [key_grid_x[11],block_grid_y[25],70]
  )
  note_Bb3_button.set_state(3)

  note_B3_button = new Block_Five_State_Button(
    "controller", 
    ["button_five_state_inactive","button_five_state_true_confirmed","button_five_state_true_requested","button_five_state_false_confirmed","button_five_state_false_requested"],
    ["off", "B3 on", "B3_on", "B3 off", "B3_off"],
    "request_B3",
    [key_grid_x[12],block_grid_y[25],70]
  )
  note_B3_button.set_state(3)


  note_C4_button = new Block_Five_State_Button(
    "controller", 
    ["button_five_state_inactive","button_five_state_true_confirmed","button_five_state_true_requested","button_five_state_false_confirmed","button_five_state_false_requested"],
    ["off", "C4 on", "C4_on", "C4 off", "C4_off"],
    "request_C4",
    [key_grid_x[13],block_grid_y[25],70]
  )
  note_C4_button.set_state(3)

  note_Db4_button = new Block_Five_State_Button(
    "controller", 
    ["button_five_state_inactive","button_five_state_true_confirmed","button_five_state_true_requested","button_five_state_false_confirmed","button_five_state_false_requested"],
    ["off", "Db4 on", "Db4_on", "Db4 off", "Db4_off"],
    "request_Db4",
    [key_grid_x[14],block_grid_y[25],70]
  )
  note_Db4_button.set_state(3)

  note_D4_button = new Block_Five_State_Button(
    "controller", 
    ["button_five_state_inactive","button_five_state_true_confirmed","button_five_state_true_requested","button_five_state_false_confirmed","button_five_state_false_requested"],
    ["off", "D4 on", "D4_on", "D4 off", "D4_off"],
    "request_D4",
    [key_grid_x[15],block_grid_y[25],70]
  )
  note_D4_button.set_state(3)

  note_Eb4_button = new Block_Five_State_Button(
    "controller", 
    ["button_five_state_inactive","button_five_state_true_confirmed","button_five_state_true_requested","button_five_state_false_confirmed","button_five_state_false_requested"],
    ["off", "Eb4 on", "Eb4_on", "Eb4 off", "Eb4_off"],
    "request_Eb4",
    [key_grid_x[16],block_grid_y[25],70]
  )
  note_Eb4_button.set_state(3)

  note_E4_button = new Block_Five_State_Button(
    "controller", 
    ["button_five_state_inactive","button_five_state_true_confirmed","button_five_state_true_requested","button_five_state_false_confirmed","button_five_state_false_requested"],
    ["off", "E4 on", "E4_on", "E4 off", "E4_off"],
    "request_E4",
    [key_grid_x[17],block_grid_y[25],70]
  )
  note_E4_button.set_state(3)

  note_F4_button = new Block_Five_State_Button(
    "controller", 
    ["button_five_state_inactive","button_five_state_true_confirmed","button_five_state_true_requested","button_five_state_false_confirmed","button_five_state_false_requested"],
    ["off", "F4 on", "F4_on", "F4 off", "F4_off"],
    "request_F4",
    [key_grid_x[18],block_grid_y[25],70]
  )
  note_F4_button.set_state(3)

  note_Gb4_button = new Block_Five_State_Button(
    "controller", 
    ["button_five_state_inactive","button_five_state_true_confirmed","button_five_state_true_requested","button_five_state_false_confirmed","button_five_state_false_requested"],
    ["off", "Gb4 on", "Gb4_on", "Gb4 off", "Gb4_off"],
    "request_Gb4",
    [key_grid_x[19],block_grid_y[25],70]
  )
  note_Gb4_button.set_state(3)

  note_G4_button = new Block_Five_State_Button(
    "controller", 
    ["button_five_state_inactive","button_five_state_true_confirmed","button_five_state_true_requested","button_five_state_false_confirmed","button_five_state_false_requested"],
    ["off", "G4 on", "G4_on", "G4 off", "G4_off"],
    "request_G4",
    [key_grid_x[20],block_grid_y[25],70]
  )
  note_G4_button.set_state(3)

  note_Ab4_button = new Block_Five_State_Button(
    "controller", 
    ["button_five_state_inactive","button_five_state_true_confirmed","button_five_state_true_requested","button_five_state_false_confirmed","button_five_state_false_requested"],
    ["off", "Ab4 on", "Ab4_on", "Ab4 off", "Ab4_off"],
    "request_Ab4",
    [key_grid_x[21],block_grid_y[25],70]
  )
  note_Ab4_button.set_state(3)

  note_A4_button = new Block_Five_State_Button(
    "controller", 
    ["button_five_state_inactive","button_five_state_true_confirmed","button_five_state_true_requested","button_five_state_false_confirmed","button_five_state_false_requested"],
    ["off", "A4 on", "A4_on", "A4 off", "A4_off"],
    "request_A4",
    [key_grid_x[22],block_grid_y[25],70]
  )
  note_A4_button.set_state(3)

  note_Bb4_button = new Block_Five_State_Button(
    "controller", 
    ["button_five_state_inactive","button_five_state_true_confirmed","button_five_state_true_requested","button_five_state_false_confirmed","button_five_state_false_requested"],
    ["off", "Bb4 on", "Bb4_on", "Bb4 off", "Bb4_off"],
    "request_Bb4",
    [key_grid_x[23],block_grid_y[25],70]
  )
  note_Bb4_button.set_state(3)

  note_B4_button = new Block_Five_State_Button(
    "controller", 
    ["button_five_state_inactive","button_five_state_true_confirmed","button_five_state_true_requested","button_five_state_false_confirmed","button_five_state_false_requested"],
    ["off", "B4 on", "B4_on", "B4 off", "B4_off"],
    "request_B4",
    [key_grid_x[24],block_grid_y[25],70]
  )
  note_B4_button.set_state(3)



}

function check_for_stale_rows(){
  hosts["controller"].check_if_timestamp_is_fresh()
  hosts["rotors0102"].check_if_timestamp_is_fresh()
  hosts["rotors0304"].check_if_timestamp_is_fresh()
  hosts["rotors0506"].check_if_timestamp_is_fresh()
  hosts["rotors0708"].check_if_timestamp_is_fresh()
  hosts["rotors0910"].check_if_timestamp_is_fresh()
  hosts["rotors1112"].check_if_timestamp_is_fresh()
  hosts["rotors1314"].check_if_timestamp_is_fresh()
  controllers["rotors0102"].check_if_timestamp_is_fresh()
  controllers["rotors0304"].check_if_timestamp_is_fresh()
  controllers["rotors0506"].check_if_timestamp_is_fresh()
  controllers["rotors0708"].check_if_timestamp_is_fresh()
  controllers["rotors0910"].check_if_timestamp_is_fresh()
  controllers["rotors1112"].check_if_timestamp_is_fresh()
  controllers["rotors1314"].check_if_timestamp_is_fresh()
}

setInterval(check_for_stale_rows, 1000);
