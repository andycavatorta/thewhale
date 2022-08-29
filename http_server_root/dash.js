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
          break;
      case "response_sdc_runtime_status":
          break;
      case "response_computer_start_status":
        break;
      case "response_computer_runtime_status":
        break;
      case "response_high_power":
        break;
      case "response_emergency_stop":
        break;
      case "response_motor_command_applied":
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
//class Button_Text

class Display_Text{
  constructor(
      dom_parent,
      column_title,
      row_title, 
      width)
    {
    this.dom_parent = dom_parent;
    this.column_title = column_title;
    this.row_title = row_title;
    this.width = width;
    this.active = false;
    this.container = create_group(
      this.dom_parent,
      {
        class:"status_block_name_value",
      }
    );
    this.text_container = create_text(this.container, " ", {class:"status_block_value"});
    this.button_rect  = create_rectangle(
      this.dom_parent,
      {
        class:"display_text_active",
      }
    )
    this.button_rect.class_ref = this
    this.button_rect.setAttribute("style",`width:`+width+`px`);
    this.set_active(this.active);
    this.set_text(" ");
  }
  set_active(active){
    this.active = active
    this.set_class(active)  
  }
  get_active(){
    return this.active
  }
  set_text(display_text){
    let textnode = document.createTextNode(display_text);
    this.text_container.replaceChild(textnode, this.text_container.childNodes[0]);
  }
  set_class(class_b){
    if (class_b){
      this.button_rect.setAttribute("class", "display_text_active");
    } else {
      this.button_rect.setAttribute("class", "display_text_inactive");
    }
    
  }
}
//class Display_Graph

class Grid_Folding{
  constructor(
      dom_parent, 
      coordinates,
      column_groups_a,
      row_names)
    {
    this.dom_parent = dom_parent;
    this.coordinates = coordinates;
    this.column_groups_a = column_groups_a;
    this.container = create_group(
      this.dom_parent,
      {}
    );
    /* generate cells */
    this.columns = {}
    this.rows = {}
    for (let column_group_index in column_groups_a) {
      let column_group = column_groups_a[column_group_index]
      for (let column_index in column_group["columns"]) {
        let column = column_group["columns"][column_index];
        this.columns[column["title"]] = {};
        this.columns[column["title"]]["title"] = create_text(this.container, column["title"], {class:"grid_title"});
      }
    }

    this.create_row("controller")
    /*
    this.rectangle  = create_rectangle(
      this.container,
      {
        class:classname,
        x:coordinates[0],
        y:coordinates[1],
        width:coordinates[2],
        height:coordinates[3],
      }
    )
    */
    this.update_layout()
  };
  create_row(row_name) {
    this.rows[row_name] = {};
    this.rows[row_name]["title"] = row_name;
    for (let column_group_index in this.column_groups_a) {
      let column_group = this.column_groups_a[column_group_index]
      for (let column_index in column_group["columns"]) {
        let column = column_group["columns"][column_index];        
        this.rows[row_name][column["title"]] = new Display_Text(this.container, column["title"], row_name, column["width"]);
        this.columns[column["title"]][row_name] = this.rows[row_name][column["title"]]
      }
    }
    //this.rows[row_name]["runtime"] = new Display_Text(this.container, "runtime", row_name, );
  };

  update_layout() {
    var left = 0
    for (let column_group_index in this.column_groups_a) {
      let column_group = this.column_groups_a[column_group_index];
      for (let column_index in column_group["columns"]) {
        let column = column_group["columns"][column_index];
        left = left + column["width"];
        this.columns[column["title"]]["title"].setAttribute("y", "100px");
        this.columns[column["title"]]["title"].setAttribute("x", left + `px`);

      }
    }
  };
  show() {

  };
  hide() {

  };
}

function init() {
  canvas = document.getElementById( "top_level" );
  var background_rectangle = create_rectangle(canvas,{id:"background_rect"})

  new Grid_Folding(
      canvas, 
      [50,50],
      [
        {
          foldable:true,
          folded:false,
          columns:[
            {title:"runtime", type:"Button_Text",width:80,action:""},
            {title:"uptime", type:"Button_Text",width:80,action:""},
            {title:"tb_git", type:"Button_Text",width:200,action:""},
            {title:"app_git", type:"Button_Text",width:200,action:""},
            {title:"os_version", type:"Button_Text",width:300,action:""},
            {title:"ip_local", type:"Display_Text",width:140},
            {title:"disk", type:"Display_Text",width:100},
          ]
        },
        {
          foldable:false,
          folded:false,
          columns:[
            {title:"computer_name", type:"Display_Text",width:140},
            {title:"errors", type:"Button_Text",width:100,action:""},
          ]
        },
        {
          foldable:true,
          folded:false,
          columns:[
            {title:"status", type:"Button_Text",width:100,action:""},
            {title:"msgs", type:"Button_Text",width:100},
            {title:"cpu", type:"Display_Graph",width:80, range:[0,100]},
            {title:"mem", type:"Display_Graph",width:80, range:[0,100]},
            {title:"temp", type:"Display_Graph",width:80, range:[0,100]},
          ]
        },
        {
          foldable:false,
          folded:false,
          columns:[
            {title:"mcu_name", type:"Display_Text",width:200},
            {title:"emergency_stop", type:"Button_Text",width:100,action:""},
            {title:"duty_cycle", type:"Display_Graph",width:120, range:[0,100]},
            {title:"loop_error", type:"Display_Graph",width:120, range:[0,100]},
            {title:"encoder_speed", type:"Display_Graph",width:120, range:[0,100]},
          ]
        },
        {
          foldable:true,
          folded:false,
          columns:[
            {title:"-10", type:"Button_Text",width:40,action:""},
            {title:"-1", type:"Button_Text",width:40,action:""},
            {title:"speed", type:"Button_Text",width:80,action:""},
            {title:"+1", type:"Button_Text",width:40,action:""},
            {title:"+10", type:"Button_Text",width:40,action:""},
          ]
        },
        {
          foldable:true,
          folded:false,
          columns:[
            {title:"24v", type:"Display_Text",width:60},
            {title:"5v", type:"Display_Text",width:60},
            {title:"mode", type:"Display_Text",width:80},
            {title:"pid", type:"Display_Text",width:80},
            {title:"ppr", type:"Display_Text",width:80},
            {title:"firmware_version", type:"Display_Text",width:200},
          ]
        },
      ],
      16
    )
}

