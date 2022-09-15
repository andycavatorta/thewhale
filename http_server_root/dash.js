var SVG_NS ="http://www.w3.org/2000/svg";
var canvas = null;
var websocket;
var machinery_grid;
var high_power_button;

/* ##### NETWORK ##### */

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
    var topic = topic_data_origin[0];
    var message = topic_data_origin[1];
    var origin = topic_data_origin[2];
    //console.log(topic, message, origin)
    switch (topic) {
        case "deadman":
            break;
        case "response_sdc_start_status":
            console.log(">> data received" + evt.data)
            Data_Machinery_Rows[origin].motor_1_encoder_ppr_value = message["encoder_ppr_value_motor1"]
            machinery_grid.rows[origin].update_data("motor_1_encoder_ppr_value",message["encoder_ppr_value_motor1"])
            Data_Machinery_Rows[origin].motor_2_encoder_ppr_value = message["encoder_ppr_value_motor2"]
            machinery_grid.rows[origin].update_data("motor_2_encoder_ppr_value",message["encoder_ppr_value_motor2"])
            Data_Machinery_Rows[origin].firmware_version = message["firmware_version"]
            machinery_grid.rows[origin].update_data("firmware_version",message["firmware_version"])
            Data_Machinery_Rows[origin].motor_1_operating_mode = message["operating_mode_motor1"]
            machinery_grid.rows[origin].update_data("motor_1_operating_mode",message["operating_mode_motor1"])
            Data_Machinery_Rows[origin].motor_2_operating_mode = message["pid_integral_gain_motor2"]
            machinery_grid.rows[origin].update_data("motor_2_operating_mode",message["pid_integral_gain_motor2"])
            Data_Machinery_Rows[origin].motor_1_pid_proportional_gain = message["pid_proportional_gain_motor1"]
            machinery_grid.rows[origin].update_data("motor_1_pid_proportional_gain",message["pid_proportional_gain_motor1"])
            Data_Machinery_Rows[origin].motor_1_pid_integral_gain = message["pid_integral_gain_motor1"]
            machinery_grid.rows[origin].update_data("motor_1_pid_integral_gain",message["pid_integral_gain_motor1"])
            Data_Machinery_Rows[origin].motor_1_pid_differential_gain = message["pid_differential_gain_motor1"]
            machinery_grid.rows[origin].update_data("motor_1_pid_differential_gain",message["pid_differential_gain_motor1"])
            Data_Machinery_Rows[origin].motor_2_pid_proportional_gain = message["pid_proportional_gain_motor2"]
            machinery_grid.rows[origin].update_data("motor_2_pid_proportional_gain",message["pid_proportional_gain_motor2"])
            Data_Machinery_Rows[origin].motor_2_pid_integral_gain = message["pid_integral_gain_motor2"]
            machinery_grid.rows[origin].update_data("motor_2_pid_integral_gain",message["pid_integral_gain_motor2"])
            Data_Machinery_Rows[origin].motor_2_pid_differential_gain = message["pid_differential_gain_motor2"]
            machinery_grid.rows[origin].update_data("motor_2_pid_differential_gain",message["pid_differential_gain_motor2"])


            /*
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
            */
            break;
        case "response_sdc_runtime_status":
            var _keys_ = Object.keys(message)
            if(_keys_.length==0){
                return
            }
            console.log(">> data received" + evt.data)
            Data_Machinery_Rows[origin].mcu_current_time = message["current_time"]
            Data_Machinery_Rows[origin].motor_1_closed_loop_error = message["closed_loop_error_1"]
            machinery_grid.rows[origin].update_data("motor_1_closed_loop_error",message["closed_loop_error_1"])
            Data_Machinery_Rows[origin].motor_2_closed_loop_error = message["closed_loop_error_2"]
            machinery_grid.rows[origin].update_data("motor_2_closed_loop_error",message["closed_loop_error_2"])
            Data_Machinery_Rows[origin].motor_1_duty_cycle = message["duty_cycle_1"]
            machinery_grid.rows[origin].update_data("motor_1_duty_cycle",message["duty_cycle_1"])
            Data_Machinery_Rows[origin].motor_2_duty_cycle = message["duty_cycle_2"]
            machinery_grid.rows[origin].update_data("motor_2_duty_cycle",message["duty_cycle_2"])
            Data_Machinery_Rows[origin].motor_1_encoder_speed = message["encoder_speed_relative_1"]
            machinery_grid.rows[origin].update_data("motor_1_encoder_speed",message["encoder_speed_relative_1"])
            Data_Machinery_Rows[origin].motor_2_encoder_speed = message["encoder_speed_relative_2"]
            machinery_grid.rows[origin].update_data("motor_2_encoder_speed",message["encoder_speed_relative_2"])
            Data_Machinery_Rows[origin].motor_1_value = message["motor_command_applied_1"]
            machinery_grid.rows[origin].update_data("motor_1_value",message["motor_command_applied_1"])
            Data_Machinery_Rows[origin].motor_2_value = message["motor_command_applied_2"]
            machinery_grid.rows[origin].update_data("motor_2_value",message["motor_command_applied_2"])
            Data_Machinery_Rows[origin].volts = message["volts"]
            machinery_grid.rows[origin].update_data("volts",message["volts"])
            Data_Machinery_Rows[origin].emergency_stop = message["emergency_stop"]
            machinery_grid.rows[origin].update_data("emergency_stop",message["emergency_stop"])
            Data_Machinery_Rows[origin].current_time = message["current_time"]

            /*
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
            */
            break;
        case "response_computer_start_status":
            Data_Machinery_Rows[origin].system_uptime = message["system_uptime"]
            machinery_grid.rows[origin].update_data("system_uptime",message["system_uptime"])
            Data_Machinery_Rows[origin].system_runtime = message["system_runtime"]
            machinery_grid.rows[origin].update_data("system_runtime",message["system_runtime"])
            Data_Machinery_Rows[origin].tb_git_time = message["tb_git_timestamp"]
            machinery_grid.rows[origin].update_data("tb_git_timestamp",message["tb_git_timestamp"])
            Data_Machinery_Rows[origin].app_git_time = message["app_git_timestamp"]
            machinery_grid.rows[origin].update_data("app_git_timestamp",message["app_git_timestamp"])
            Data_Machinery_Rows[origin].system_disk = message["system_disk"]
            machinery_grid.rows[origin].update_data("system_disk",message["system_disk"])
            Data_Machinery_Rows[origin].os_version = message["os_version"]
            machinery_grid.rows[origin].update_data("os_version",message["os_version"])
            Data_Machinery_Rows[origin].local_ip = message["local_ip"]
            machinery_grid.rows[origin].update_data("local_ip",message["local_ip"])

            /*
            hosts[origin].ip_local.set_text(message["local_ip"])
            let tb_date = new Date(parseInt(message["tb_git_timestamp"])*1000)
            hosts[origin].tb_git_time.set_text( formatDate(tb_date))
            let app_date = new Date(parseInt(message["tb_git_timestamp"])*1000)
            hosts[origin].app_git_time.set_text( formatDate(app_date))
            let os_version_str = message["os_version"]["name"] + " " + message["os_version"]["version"]
            hosts[origin].os_version.set_text(os_version_str)
            hosts[origin].set_colors_active(1)
            */
            break;
        case "response_computer_runtime_status":
            Data_Machinery_Rows[origin].computer_current_time = message["current_time"]
            Data_Machinery_Rows[origin].system_cpu = message["system_cpu"]
            machinery_grid.rows[origin].update_data("system_cpu",message["system_cpu"])
            Data_Machinery_Rows[origin].memory_free = message["memory_free"]
            machinery_grid.rows[origin].update_data("memory_free",message["memory_free"])
            /*
            hosts[origin].temp.set_text(message["core_temp"])
            hosts[origin].voltage.set_text(message["core_voltage"])
            hosts[origin].cpu.set_text( parseFloat( message["system_cpu"] + "%").toFixed(2) )
            hosts[origin].reboot.set_text( ( parseFloat( message["system_uptime"] )/3600).toFixed(2) + "h")// "2022-06-30 21:05:37"
            hosts[origin].restart.set_text( ( parseFloat( message["system_runtime"])/3600).toFixed(2) + "h")// "2022-06-30 21:05:37"
            hosts[origin].disk.set_text( (parseInt(message["system_disk"][0])/1000000000).toFixed(2) + "GB")//[37196000.0, 926900000.0]
            hosts[origin].mem.set_text( (parseInt(message["memory_free"][0])/1000000).toFixed(2) + "MB")//[37196000.0, 926900000.0]
            hosts[origin].set_timestamp(parseInt(message["current_time"]))
            hosts[origin].set_colors_active(1)
            */
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










/* ##### UTILITIES ##### */

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

/* ##### SVG CONVENIENCE METHODS ##### */


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





/* ##### NETWORK ##### */







/* ##### DATA ##### */

// DATA HISTORY

class Data_History{
  constructor(
        history_length = 12,
        deviation_threshold = 1.5,
        deviation_callback = null,
    ){
    this.caller_ref = this.caller
    this.history_length = history_length;
    this.deviation_threshold = deviation_threshold;
    this.deviation_callback = deviation_callback;
    this.array = new Array();
  }
  set(val){
    var new_length = this.array.push(val);
    while (new_length>10){
        this.array.shift();
    }
    if(this.deviation_callback){
        var deviation = math.std(this.array)
        if (deviation >= this.deviation_threshold){
            this.deviation_callback(deviation,this.caller_ref)
        }
    }
  }
  clear(){
    this.array = new Array(); 
  }
  get(){
    return this.array[this.array.length-1];
  }
  get_all(){
    return new Array.from(this.array);
  }
}


/*
topics:
    deadman
    response_sdc_start_status
        firmware_version
        encoder_ppr_value_motor1
        encoder_ppr_value_motor2
        operating_mode_motor1
        operating_mode_motor2
        pid_differential_gain_motor1
        pid_integral_gain_motor1
        pid_proportional_gain_motor1
        pid_differential_gain_motor2
        pid_integral_gain_motor2
        pid_proportional_gain_motor2
    response_sdc_runtime_status
        emergency_stop
        volts
        closed_loop_error_1
        closed_loop_error_2
        duty_cycle_1
        duty_cycle_2
        encoder_speed_relative_1
        encoder_speed_relative_2
        motor_command_applied_1
        motor_command_applied_2
        current_time
    response_computer_start_status
        local_ip
        tb_git_timestamp
        app_git_timestamp
        os_version
        system_uptime
        system_runtime
        system_disk
    response_computer_runtime_status
        core_temp
        system_cpu
        memory_free
        current_time
    response_high_power
    response_emergency_stop
    response_motor_command_applied
    response_idle_speeds
    response_system_state [unconnected, waiting_for_connections, ready, playing_file, ]
*/






function Data_Machinery_Row(){
    this.app_git_timestamp = 0;
    this.app_git_timestamp = 0;
    this.closed_loop_error_1 = 0;
    this.closed_loop_error_2 = 0;
    this.computer_current_time = 0;
    this.duty_cycle_1 = 0;
    this.duty_cycle_2 = 0;
    this.emergency_stop = false;
    this.encoder_ppr_value_motor1 = 0;
    this.encoder_ppr_value_motor2 = 0;
    this.encoder_speed_relative_1 = 0;
    this.encoder_speed_relative_2 = 0;
    this.firmware_version = "";
    this.local_ip = "";
    this.mcu_current_time = 0;
    this.memory_free = [0/0];
    this.operating_mode_motor1 = 0;
    this.operating_mode_motor2 = 0;
    this.os_version = {};
    this.pid_proportional_gain_motor1 = 0;
    this.pid_integral_gain_motor2 = 0;
    this.pid_differential_gain_motor1 = 0;
    this.pid_proportional_gain_motor2 = 0;
    this.pid_integral_gain_motor1 = 0;
    this.pid_differential_gain_motor2 = 0;
    this.system_cpu = 0;
    this.system_disk = [];
    this.system_runtime = 0;
    this.system_uptime = 0;
    this.tb_git_timestamp = 0;
    this.tb_git_timestamp = 0;
    this.volts = ["0.0:0.0"];
}

var Data_Machinery_Rows = {
    controller:new Data_Machinery_Row(),
    rotors0102:new Data_Machinery_Row(),
    rotors0304:new Data_Machinery_Row(),
    rotors0506:new Data_Machinery_Row(),
    rotors0708:new Data_Machinery_Row(),
    rotors0910:new Data_Machinery_Row(),
    rotors1112:new Data_Machinery_Row(),
    rotors1314:new Data_Machinery_Row(),
}
// MAPPINGS


/* ##### INTERFACE COMPONENT CONSTRUCTORS ##### */

// PANEL SET
class Panel{
    constructor(
        dom_parent,
        panel_x,
        panel_y,
        style_class = "panel_set_panel",
    )
    {
        this.dom_parent = dom_parent;
        this.style_class = style_class;
        this.container = create_group(
            this.dom_parent,
            {
                class:"panel_set_container",
            }
        );
        this.rectangle = create_rectangle(this.container,{class:style_class})
        this.rectangle.setAttribute("x",panel_x+"px")
        this.rectangle.setAttribute("y",panel_y+"px")    
    }
    set_visibility(v_b){
        if (v_b){
            try {
                this.dom_parent.appendChild(this.container);
            } catch (error) {
            }
            //this.rectangle.setAttribute("visibility",v_b);
        }else{
            try {
                this.dom_parent.removeChild(this.container);
            } catch (error) {
            }
            //this.rectangle.setAttribute("visibility",v_b);
        }
    }
}

class Panel_Set{
    constructor(
        dom_parent,
        panel_top,
        panels_params
    )
    {
        this.dom_parent = dom_parent;
        this.panels_params = panels_params;
        this.panels = {}
        for (var panel_name in this.panels_params) {
            var params = this.panels_params[panel_name]
            this.panels[panel_name] = {
                button:new Toggle_Button_Sync(
                    this.dom_parent,
                    panel_name,
                    params["button_x"],
                    params["button_y"],
                    params["button_width_open"],
                    params["button_width_closed"],
                    32,
                    this.handle_button
                ),
                panel: new Panel(
                    this.dom_parent,
                    0,
                    panel_top
                )
            }
            this.panels[panel_name].button.set_label(params["label"])
            this.panels[panel_name].button.panel_set_ref = this;
        }
        this.active_panel = panel_name; 
        this.set_active_panel(panel_name);
    }
    handle_button(){
        self = this.panel_set_ref;
        self.set_active_panel(this.button_name);
    }
    set_active_panel(panel_name){
        for (var panel_key in this.panels){
            var panel = this.panels[panel_key]
            if (panel_key==panel_name){
                panel.button.set_state(true)
                panel.panel.set_visibility(true)
            }else{
                panel.button.set_state(false)
                panel.panel.set_visibility(false)
            }
        }
    }
}

// SYNC TOGGLE BUTTON
class Toggle_Button_Sync{
    constructor(
        dom_parent,
        button_name,
        x,
        y, 
        width_open, 
        width_closed,
        height,
        action,
        style_active = "toggle_button_active",
        style_inactive = "toggle_button_inactive",
        style_attention = "toggle_button_attention"
    )
    {
        this.button_name = button_name;
        this.action = action;
        this.dom_parent = dom_parent;
        this.x = x;
        this.y = y;
        this.width_open = width_open;
        this.width_closed = width_closed;
        this.height = height;
        this.style_active = style_active;
        this.style_inactive = style_inactive;
        this.style_attention = style_attention;
        this.visual_style = this.style_inactive;
        this.states = ["true_confirmed","true_requested","false_confirmed","false_requested"]
        this.state = true;
        this.container = create_group(
            this.dom_parent,
            {
                class:"toggle_button_container",
            }
        );
        this.button_rect  = create_rectangle(
            this.container,
            {
                class:this.style_inactive,
            }
        )
        this.button_rect.class_ref = this;
        this.button_rect.setAttribute("x",this.x+"px");
        this.button_rect.setAttribute("y",this.y+"px");
        this.button_rect.addEventListener("click",this.handle_click);
        this.text_container = create_text(this.container, " ", {class:this.style_inactive});
        this.text_container.setAttribute("x",this.x+"px");
        this.text_container.setAttribute("y",this.y+"px");
        this.text_container.class_ref = this;
        this.text_container.addEventListener("click",this.handle_click);
        this.button_rect.setAttribute("height", this.height + `px`);
        this.text_container.setAttribute("height",this.height + `px`);
        this.set_state(0);
        this.set_style("inactive");
        this.set_label(" ");
        this.set_collapse(false);
    }
    handle_click(e){
        self = e.target.class_ref
        self.set_state(true)
        self.update_style()
        self.action(self.button_name)
        // websocket_send(self.target_name,self.topic,false)
        // todo: setTimeout to restore button if no response
        //websocket_send(self.target_name,self.topic,true)
        // todo: setTimeout to restore button if no response
    }
    set_state(state_b){
        this.state = state_b;
        this.set_style((state_b?"active":"inactive"));
        this.update_style();
    }
    set_style(style_str){
        this.visual_style = style_str;
        this.update_style();
    }
    update_style(){
        // remove all classes
        this.text_container.setAttribute("class", "");
        this.text_container.classList.add("text_1");
        this.button_rect.setAttribute("class", "");
        switch (this.visual_style){
            case "active":
                this.text_container.classList.add(this.style_active);
                this.button_rect.classList.add(this.style_active);
                break;
            case "inactive":
                this.text_container.classList.add(this.style_inactive);
                this.button_rect.classList.add(this.style_inactive);
                break;
            case "attention":
                this.text_container.classList.add(this.style_attention);
                this.button_rect.classList.add(this.style_attention);
                break;
            default:
                break;
        }
    }
    set_label(label_str){
        let textnode = document.createTextNode(label_str);
        this.text_container.replaceChild(textnode, this.text_container.childNodes[0]);
    }
    set_collapse(c_b, remove_text = false){
        if (c_b){ // collapse
            this.container.setAttribute("width", this.width_closed + `px`);
            this.button_rect.setAttribute("width", this.width_closed + `px`);
            if (remove_text) {
                this.text_container.setAttribute("style",`visibility:hidden`);
            }
        }else{
            this.container.setAttribute("width", this.width_open + `px`);
            this.button_rect.setAttribute("width", this.width_open + `px`);
            this.text_container.setAttribute("style",`visibility:visible`);
        }
    }
    get_width(){
        return parseInt(this.button_rect.setAttribute("width"));
    }
}

// ASYNC TOGGLE BUTTON  
class Toggle_Button_Async{
    constructor(
        dom_parent,
        target_name,
        topic,
        state_labels,
        x,
        y, 
        width_open, 
        width_closed,
        height,
        style_active = "toggle_button_active",
        style_inactive = "toggle_button_inactive",
        style_attention = "toggle_button_attention",
        style_true_requested = "toggle_button_async_true_requested",
        style_true_confirmed = "toggle_button_async_true_confirmed",
        style_fasle_requested = "toggle_button_async_fasle_requested",
        style_false_confirmed = "toggle_button_async_false_confirmed",
    )
    {
        this.state_labels = state_labels
        this.target_name = target_name
        this.topic = topic
        this.dom_parent = dom_parent;
        this.x = x;
        this.y = y;
        this.width_open = width_open;
        this.width_closed = width_closed;
        this.height = height;
        this.style_active = style_active;
        this.style_inactive = style_inactive;
        this.style_attention = style_attention;
        this.style_true_requested = style_true_requested;
        this.style_true_confirmed = style_true_confirmed;
        this.style_fasle_requested = style_fasle_requested;
        this.style_false_confirmed = style_false_confirmed;
        this.visual_style = this.style_inactive;
        this.states = ["true_confirmed","true_requested","false_confirmed","false_requested"]
        this.state = 0
        this.container = create_group(
            this.dom_parent,
            {
                class:"toggle_button_container",
            }
        );
        this.button_rect  = create_rectangle(
            this.container,
            {
                class:this.style_inactive,
            }
        )
        this.button_rect.class_ref = this;
        this.button_rect.setAttribute("x",this.x+"px");
        this.button_rect.setAttribute("y",this.y+"px");
        this.button_rect.addEventListener("click",this.handle_click);
        this.text_container = create_text(this.container, " ", {class:this.style_inactive});
        this.text_container.setAttribute("x",this.x+"px");
        this.text_container.setAttribute("y",this.y+"px");
        this.text_container.class_ref = this;
        this.text_container.addEventListener("click",this.handle_click);
        this.container.setAttribute("height", this.height + `px`);
        this.button_rect.setAttribute("height", this.height + `px`);
        this.text_container.setAttribute("height",this.height + `px`);
        this.set_state(0);
        this.set_style("inactive");
        //this.set_label(" ");
        this.set_collapse(false);
    }
    handle_click(e){

        //["power (unconnected)", "power on confirmed", "power on requested", "power off confirmed", "power off requested"],
        self = e.target.class_ref
        console.log("handle_click",self.state)
        if (self.state==1){
            self.set_state(4)
            websocket_send(self.target_name,self.topic,false)
            // todo: setTimeout to restore button if no response
        }
        if (self.state==3){
            self.set_state(2)
            websocket_send(self.target_name,self.topic,true)
            // todo: setTimeout to restore button if no response
        }
    }
    set_state(state_int){
        this.state = state_int;
        this.set_label(state_int);
        this.update_style();
    }
    set_style(style_str){
        this.visual_style = style_str;
        this.update_style();
    }
    update_style(){
        // remove all classes
        this.button_rect.setAttribute("class", "");
        this.text_container.setAttribute("class", "");
        this.text_container.classList.add("text_1");
        switch (this.visual_style){
            case "active":
                this.text_container.classList.add(this.style_active);
                this.button_rect.classList.add(this.style_active);
                break;
            case "inactive":
                this.text_container.classList.add(this.style_inactive);
                this.button_rect.classList.add(this.style_inactive);
                break;
            case "attention":
                this.text_container.classList.add(this.style_attention);
                this.button_rect.classList.add(this.style_attention);
                break;
            default:
                break;
        }
        switch (this.state){
            case 0:
                this.text_container.classList.add(this.style_true_confirmed);
                this.button_rect.classList.add(this.style_true_confirmed);
                break;
            case 1:
                this.text_container.classList.add(this.style_true_requested);
                this.button_rect.classList.add(this.style_true_requested);
                break;
            case 2:
                this.text_container.classList.add(this.style_false_confirmed);
                this.button_rect.classList.add(this.style_false_confirmed);
                break;
            case 3:
                this.text_container.classList.add(this.style_fasle_requested);
                this.button_rect.classList.add(this.style_fasle_requested);
                break;
        }
    }
    set_label(label_str){
        //this.state_label = label_ord
        let textnode = document.createTextNode(label_str);
        this.text_container.replaceChild(textnode, this.text_container.childNodes[0]);
    }
    set_collapse(c_b, remove_text = false){
        if (c_b){ // collapse
            this.container.setAttribute("width", this.width_closed + `px`);
            this.button_rect.setAttribute("width", this.width_closed + `px`);
            if (remove_text) {
                this.text_container.setAttribute("style",`visibility:hidden`);
            }
        }else{
            this.container.setAttribute("width", this.width_open + `px`);
            this.button_rect.setAttribute("width", this.width_open + `px`);
            this.text_container.setAttribute("style",`visibility:visible`);
        }
    }
    get_width(){
        return parseInt(this.button_rect.getAttribute("width"));
    }
    set_position(x,y){
        var x_str = x + "px";
        var y_str = y + "px";
        this.container.setAttribute("x",x_str);
        this.container.setAttribute("y",y_str);
        this.button_rect.setAttribute("x",x_str);
        this.button_rect.setAttribute("y",y_str);
        this.text_container.setAttribute("x",x_str);
        this.text_container.setAttribute("y",y_str);
    }
}

// SIMPLE DISPLAY BOX  
class Display_Box_Simple{
    constructor(
        dom_parent,
        action,
        x,
        y, 
        width_open, 
        width_closed,
        height,
        style_active = "display_box_simple_active",
        style_inactive = "display_box_simple_inactive",
        style_attention = "display_box_simple_attention")
    {
        this.dom_parent = dom_parent;
        this.action = action;
        this.x = x;
        this.y = y;
        this.width_open = width_open;
        this.width_closed = width_closed;
        this.height = height;
        this.style_active = style_active;
        this.style_inactive = style_inactive;
        this.style_attention = style_attention;
        this.visual_style = this.style_inactive;
        this.container = create_group(
            this.dom_parent,
            {
                class:"display_box_simple_container",
            }
        );
        this.button_rect  = create_rectangle(
            this.container,
            {
                class:this.style_inactive,
            }
        )
        this.button_rect.setAttribute("x",this.x+"px");
        this.button_rect.setAttribute("y",this.y+"px");
        this.text_container = create_text(this.container, " ", {class:this.style_inactive});
        this.text_container.setAttribute("x",this.x+"px");
        this.text_container.setAttribute("y",this.y+"px");
        this.container.setAttribute("height", this.height + `px`);
        this.button_rect.setAttribute("height", this.height + `px`);
        this.text_container.setAttribute("height",this.height + `px`);
        this.set_style("inactive");
        this.set_text(" ");
        this.set_collapse(false);
    }
    set_style(style_str){
        this.text_container.setAttribute("class", "");
        this.text_container.classList.add("text_1");
        switch (style_str){
            case "active":
                this.text_container.classList.add(this.style_active);
                break;
            case "inactive":
                this.text_container.classList.add(this.style_inactive);
                break;
            case "attention":
                this.text_container.classList.add(this.style_attention);
                break;
            default:
                break;
        }
    }
    set_text(display_text){
        let textnode = document.createTextNode(display_text);
        this.text_container.replaceChild(textnode, this.text_container.childNodes[0]);
    }
    set_collapse(c_b, remove_text = false){
        if (c_b){ // collapse
            this.container.setAttribute("width", this.width_closed + `px`);
            this.button_rect.setAttribute("width", this.width_closed + `px`);
            if (remove_text) {
                this.text_container.setAttribute("style",`visibility:hidden`);
            }
        }else{
            this.container.setAttribute("width", this.width_open + `px`);
            this.button_rect.setAttribute("width", this.width_open + `px`);
            this.text_container.setAttribute("style",`visibility:visible`);
        }
    }
    get_width(){
        return parseInt(this.button_rect.getAttribute("width"));
    }
    set_position(x,y){
        var x_str = x + "px";
        var y_str = y + "px";
        this.container.setAttribute("x",x_str);
        this.container.setAttribute("y",y_str);
        this.button_rect.setAttribute("x",x_str);
        this.button_rect.setAttribute("y",y_str);
        this.text_container.setAttribute("x",x_str);
        this.text_container.setAttribute("y",y_str);
    }
}

class Display_Box_Title{
    constructor(
        dom_parent,
        label,
        action,
        x,
        y, 
        width_open, 
        width_closed,
        height,
        style_active = "display_box_title_active",
        style_inactive = "display_box_title_inactive",
        style_attention = "display_box_title_attention")
    {
        this.dom_parent = dom_parent;
        this.action = action;
        this.x = x;
        this.y = y;
        this.width_open = width_open;
        this.width_closed = width_closed;
        this.height = height;
        this.style_active = style_active;
        this.style_inactive = style_inactive;
        this.style_attention = style_attention;
        this.visual_style = this.style_inactive;
        this.container = create_group(
            this.dom_parent,
            {
                class:"display_box_title_container",
            }
        );
        this.button_rect  = create_rectangle(
            this.container,
            {
                class:this.style_inactive,
            }
        )
        //this.button_rect.setAttribute("x",this.x+"px");
        //this.button_rect.setAttribute("y",this.y+"px");
        this.text_container = create_text(this.container, " ", {class:this.style_inactive});
        //this.text_container.setAttribute("x",this.x+"px");
        //this.text_container.setAttribute("y",this.y+"px");
        this.container.setAttribute("height", this.height + `px`);
        this.button_rect.setAttribute("height", this.height + `px`);
        this.text_container.setAttribute("height",this.height + `px`);
        this.set_position(x,y)
        this.set_style("active");
        this.set_text(label);
        this.set_collapse(false);
    }
    set_style(style_str){
        this.text_container.setAttribute("class", "");
        this.text_container.classList.add("text_1");
        switch (style_str){
            case "active":
                this.text_container.classList.add(this.style_active);
                break;
            case "inactive":
                this.text_container.classList.add(this.style_inactive);
                break;
            case "attention":
                this.text_container.classList.add(this.style_attention);
                break;
            default:
                break;
        }
    }
    set_text(display_text){
        let textnode = document.createTextNode(display_text);
        this.text_container.replaceChild(textnode, this.text_container.childNodes[0]);
    }
    set_collapse(c_b, remove_text = false){
        if (c_b){ // collapse
            this.container.setAttribute("width", this.width_closed + `px`);
            this.button_rect.setAttribute("width", this.width_closed + `px`);
            if (remove_text) {
                this.text_container.setAttribute("style",`visibility:hidden`);
            }
        }else{
            this.container.setAttribute("width", this.width_open + `px`);
            this.button_rect.setAttribute("width", this.width_open + `px`);
            this.text_container.setAttribute("style",`visibility:visible`);
        }
    }
    set_position(x,y){
        var x_str = x + "px";
        var y_str = y + "px";
        this.container.setAttribute("x",x_str);
        this.container.setAttribute("y",y_str);
        this.button_rect.setAttribute("x",x_str);
        this.button_rect.setAttribute("y",y_str);
        this.text_container.setAttribute("x",x_str);
        this.text_container.setAttribute("y",y_str);
    }
    get_width(){
        return parseInt(this.button_rect.getAttribute("width"));
    }
}

class Machinery_Title_Row{
    constructor(
        dom_parent,
        x,
        y,
        column_data
    )
    {
        this.dom_parent = dom_parent;
        this.x = x;
        this.y = y;
        this.column_data = column_data;
        for (var column_data_i in this.column_data){
            var col = this.column_data[column_data_i];
            this[col[0]] = new Display_Box_Title(
                dom_parent,
                col[1],
                col[4],
                x,
                y,
                col[2],
                col[3],
                32
            );
        }
        this.update_layout()
    }
    update_layout(){
        var _x = parseInt(this.x)
        for(var column of this.column_data){
            var column_name = column[0]
            this[column_name].set_position(_x, this.y);
            var width = this[column_name].get_width();
            _x = _x + 4 + width;
        }
    }
}


class Machinery_Grid_Row{
    constructor(
        dom_parent,
        host_name,
        rotor_1_name,
        rotor_2_name,
        x,
        y, 
        column_data
    )
    {
        // add method to change lables of async button
        // add optional click capture for display box
        // add height parameter to all buttons
        this.dom_parent = dom_parent;
        this.host_name = host_name;
        this.rotor_1_name = rotor_1_name;
        this.rotor_2_name = rotor_2_name;
        this.x = x;
        this.y = y;
        this.column_data = column_data;
        //slow, double height
        var _x = parseInt(this.x)
        for(var column of this.column_data){
            var column_name = column[0]
            switch(column_name){
                case "system_runtime":
                    this.system_runtime = new Toggle_Button_Async(
                        this.dom_parent,//dom_parent
                        this.host_name,//target_name
                        "",//topic
                        ["","","","",""],//state_labels
                        x,//x
                        y,//y
                        column[2],//width_open
                        column[3],//width_closed
                        68//height
                    ); // async button
                    break;
                case "system_uptime":
                    this.system_uptime = new Toggle_Button_Async(
                        this.dom_parent,//dom_parent
                        this.host_name,//target_name
                        "",//topic
                        ["","","","",""],//state_labels
                        x,//x
                        y,//y
                        column[2],//width_open
                        column[3],//width_closed
                        68//height
                    ); // async button
                    break;
                case "app_git_timestamp":
                    this.app_git_timestamp = new Toggle_Button_Async(
                        this.dom_parent,//dom_parent
                        this.host_name,//target_name
                        "",//topic
                        ["","","","",""],//state_labels
                        x,//x
                        y,//y
                        column[2],//width_open
                        column[3],//width_closed
                        68//height
                    ); // async button
                    break;
                case "tb_git_timestamp":
                    this.tb_git_timestamp =  new Toggle_Button_Async(
                        this.dom_parent,//dom_parent
                        this.host_name,//target_name
                        "",//topic
                        ["","","","",""],//state_labels
                        x,//x
                        y,//y
                        column[2],//width_open
                        column[3],//width_closed
                        68//height
                    ); // async button
                    break;
                case "system_disk":
                    this.system_disk = new Display_Box_Simple(
                        this.dom_parent,// dom_parent,
                        false,// action,
                        x,// x,
                        y,// y, 
                        column[2],//width_open
                        column[3],//width_closed
                        68,// height,
                    ); // display box
                    break;
                case "os_version":
                    this.os_version = new Display_Box_Simple(
                        this.dom_parent,// dom_parent,
                        false,// action,
                        x,// x,
                        y,// y, 
                        column[2],//width_open
                        column[3],//width_closed
                        68,// height,
                    ); // display box
                    break;
                case "local_ip":
                    this.local_ip = new Display_Box_Simple(
                        this.dom_parent,// dom_parent,
                        false,// action,
                        x,// x,
                        y,// y, 
                        column[2],//width_open
                        column[3],//width_closed
                        68,// height,
                    ); // display box
                    break;
                case "hostname":
                    this.hostname = new Display_Box_Simple(
                        this.dom_parent,// dom_parent,
                        false,// action,
                        x,// x,
                        y,// y, 
                        column[2],//width_open
                        column[3],//width_closed
                        68,// height,
                    ); // display box
                    this.hostname.set_text(this.host_name)
                    break;
                case "memory_free":
                    this.memory_free = new Display_Box_Simple(
                        this.dom_parent,// dom_parent,
                        false,// action,
                        x,// x,
                        y,// y, 
                        column[2],//width_open
                        column[3],//width_closed
                        68,// height,
                    ); // display box
                    break;
                case "system_cpu":
                    this.system_cpu = new Display_Box_Simple(
                        this.dom_parent,// dom_parent,
                        false,// action,
                        x,// x,
                        y,// y, 
                        column[2],//width_open
                        column[3],//width_closed
                        68,// height,
                    ); // display box
                    break;
                case "errors":
                    this.errors = new Display_Box_Simple(
                        this.dom_parent,// dom_parent,
                        false,// action,
                        x,// x,
                        y,// y, 
                        column[2],//width_open
                        column[3],//width_closed
                        68,// height,
                    ); // display box
                    break;
                case "status":
                    this.status = new Display_Box_Simple(
                        this.dom_parent,// dom_parent,
                        false,// action,
                        x,// x,
                        y,// y, 
                        column[2],//width_open
                        column[3],//width_closed
                        68,// height,
                    ); // display box
                    break;
                case "messages":
                    this.messages = new Display_Box_Simple(
                        this.dom_parent,// dom_parent,
                        false,// action,
                        x,// x,
                        y,// y, 
                        column[2],//width_open
                        column[3],//width_closed
                        68,// height,
                    ); // display box
                    break;
                case "emergency_stop":
                    this.emergency_stop = new Toggle_Button_Async(
                        this.dom_parent,//dom_parent
                        this.host_name,//target_name
                        "",//topic
                        ["","","","",""],//state_labels
                        x,//x
                        y,//y
                        column[2],//width_open
                        column[3],//width_closed
                        68//height
                    ); // async button
                    if (this.host_name == "controller"){
                        this.emergency_stop.container.setAttribute("style",`visibility:hidden`);
                    }
                    break;
                case "rotor_name":
                    this.motor_1_name =  new Display_Box_Simple(
                        this.dom_parent,// dom_parent,
                        false,// action,
                        x,// x,
                        y,// y, 
                        column[2],//width_open
                        column[3],//width_closed
                        32,// height,
                    ); // display box
                    this.motor_1_name.set_text(this.rotor_1_name)
                    if (this.host_name == "controller"){
                        this.motor_1_name.container.setAttribute("style",`visibility:hidden`);
                    }
                    this.motor_2_name =  new Display_Box_Simple(
                        this.dom_parent,// dom_parent,
                        false,// action,
                        x,// x,
                        y,// y, 
                        column[2],//width_open
                        column[3],//width_closed
                        32,// height,
                    ); // display box
                    this.motor_2_name.set_text(this.rotor_2_name)
                    if (this.host_name == "controller"){
                        this.motor_2_name.container.setAttribute("style",`visibility:hidden`);
                    }
                    break;
                case "motor_slower_10x":
                    this.motor_1_slower_10x =  new Display_Box_Simple(
                        this.dom_parent,// dom_parent,
                        false,// action,
                        x,// x,
                        y,// y, 
                        column[2],//width_open
                        column[3],//width_closed
                        32,// height,
                    ); // display box
                    if (this.host_name == "controller"){
                        this.motor_1_slower_10x.container.setAttribute("style",`visibility:hidden`);
                    }
                    this.motor_2_slower_10x =  new Display_Box_Simple(
                        this.dom_parent,// dom_parent,
                        false,// action,
                        x,// x,
                        y,// y, 
                        column[2],//width_open
                        column[3],//width_closed
                        32,// height,
                    ); // display box
                    if (this.host_name == "controller"){
                        this.motor_2_slower_10x.container.setAttribute("style",`visibility:hidden`);
                    }
                    break;
                case "motor_slower_1x":
                    this.motor_1_slower_1x =  new Display_Box_Simple(
                        this.dom_parent,// dom_parent,
                        false,// action,
                        x,// x,
                        y,// y, 
                        column[2],//width_open
                        column[3],//width_closed
                        32,// height,
                    ); // display box
                    if (this.host_name == "controller"){
                        this.motor_1_slower_1x.container.setAttribute("style",`visibility:hidden`);
                    }
                    this.motor_2_slower_1x =  new Display_Box_Simple(
                        this.dom_parent,// dom_parent,
                        false,// action,
                        x,// x,
                        y,// y, 
                        column[2],//width_open
                        column[3],//width_closed
                        32,// height,
                    ); // display box
                    if (this.host_name == "controller"){
                        this.motor_2_slower_1x.container.setAttribute("style",`visibility:hidden`);
                    }
                    break;
                case "motor_value":
                    this.motor_1_value =  new Display_Box_Simple(
                        this.dom_parent,// dom_parent,
                        false,// action,
                        x,// x,
                        y,// y, 
                        column[2],//width_open
                        column[3],//width_closed
                        32,// height,
                    ); // display box
                    if (this.host_name == "controller"){
                        this.motor_1_value.container.setAttribute("style",`visibility:hidden`);
                    }
                    this.motor_2_value =  new Display_Box_Simple(
                        this.dom_parent,// dom_parent,
                        false,// action,
                        x,// x,
                        y,// y, 
                        column[2],//width_open
                        column[3],//width_closed
                        32,// height,
                    ); // display box
                    if (this.host_name == "controller"){
                        this.motor_2_value.container.setAttribute("style",`visibility:hidden`);
                    }
                    break;
                case "motor_faster_1x":
                    this.motor_1_faster_1x =  new Display_Box_Simple(
                        this.dom_parent,// dom_parent,
                        false,// action,
                        x,// x,
                        y,// y, 
                        column[2],//width_open
                        column[3],//width_closed
                        32,// height,
                    ); // display box
                    if (this.host_name == "controller"){
                        this.motor_1_faster_1x.container.setAttribute("style",`visibility:hidden`);
                    }
                    this.motor_2_faster_1x =  new Display_Box_Simple(
                        this.dom_parent,// dom_parent,
                        false,// action,
                        x,// x,
                        y,// y, 
                        column[2],//width_open
                        column[3],//width_closed
                        32,// height,
                    ); // display box
                    if (this.host_name == "controller"){
                        this.motor_2_faster_1x.container.setAttribute("style",`visibility:hidden`);
                    }
                    break;
                case "motor_faster_10x":
                    this.motor_1_faster_10x =  new Display_Box_Simple(
                        this.dom_parent,// dom_parent,
                        false,// action,
                        x,// x,
                        y,// y, 
                        column[2],//width_open
                        column[3],//width_closed
                        32,// height,
                    ); // display box
                    if (this.host_name == "controller"){
                        this.motor_1_faster_10x.container.setAttribute("style",`visibility:hidden`);
                    }
                    this.motor_2_faster_10x =  new Display_Box_Simple(
                        this.dom_parent,// dom_parent,
                        false,// action,
                        x,// x,
                        y,// y, 
                        column[2],//width_open
                        column[3],//width_closed
                        32,// height,
                    ); // display box
                    if (this.host_name == "controller"){
                        this.motor_2_faster_10x.container.setAttribute("style",`visibility:hidden`);
                    }
                    break;
                case "motor_closed_loop_error":
                    this.motor_1_closed_loop_error =  new Display_Box_Simple(
                        this.dom_parent,// dom_parent,
                        false,// action,
                        x,// x,
                        y,// y, 
                        column[2],//width_open
                        column[3],//width_closed
                        32,// height,
                    ); // display box
                    if (this.host_name == "controller"){
                        this.motor_1_closed_loop_error.container.setAttribute("style",`visibility:hidden`);
                    }
                    this.motor_2_closed_loop_error =  new Display_Box_Simple(
                        this.dom_parent,// dom_parent,
                        false,// action,
                        x,// x,
                        y,// y, 
                        column[2],//width_open
                        column[3],//width_closed
                        32,// height,
                    ); // display box
                    if (this.host_name == "controller"){
                        this.motor_2_closed_loop_error.container.setAttribute("style",`visibility:hidden`);
                    }
                    break;
                case "motor_duty_cycle":
                    this.motor_1_duty_cycle =  new Display_Box_Simple(
                        this.dom_parent,// dom_parent,
                        false,// action,
                        x,// x,
                        y,// y, 
                        column[2],//width_open
                        column[3],//width_closed
                        32,// height,
                    ); // display box
                    if (this.host_name == "controller"){
                        this.motor_1_duty_cycle.container.setAttribute("style",`visibility:hidden`);
                    }
                    this.motor_2_duty_cycle =  new Display_Box_Simple(
                        this.dom_parent,// dom_parent,
                        false,// action,
                        x,// x,
                        y,// y, 
                        column[2],//width_open
                        column[3],//width_closed
                        32,// height,
                    ); // display box
                    if (this.host_name == "controller"){
                        this.motor_2_duty_cycle.container.setAttribute("style",`visibility:hidden`);
                    }
                    break;
                case "motor_encoder_speed":
                    this.motor_1_encoder_speed =  new Display_Box_Simple(
                        this.dom_parent,// dom_parent,
                        false,// action,
                        x,// x,
                        y,// y, 
                        column[2],//width_open
                        column[3],//width_closed
                        32,// height,
                    ); // display box
                    if (this.host_name == "controller"){
                        this.motor_1_encoder_speed.container.setAttribute("style",`visibility:hidden`);
                    }
                    this.motor_2_encoder_speed =  new Display_Box_Simple(
                        this.dom_parent,// dom_parent,
                        false,// action,
                        x,// x,
                        y,// y, 
                        column[2],//width_open
                        column[3],//width_closed
                        32,// height,
                    ); // display box
                    if (this.host_name == "controller"){
                        this.motor_2_encoder_speed.container.setAttribute("style",`visibility:hidden`);
                    }
                    break;
                case "motor_pid_proportional_gain":
                    this.motor_1_pid_proportional_gain =  new Display_Box_Simple(
                        this.dom_parent,// dom_parent,
                        false,// action,
                        x,// x,
                        y,// y, 
                        column[2],//width_open
                        column[3],//width_closed
                        32,// height,
                    ); // display box
                    if (this.host_name == "controller"){
                        this.motor_1_pid_proportional_gain.container.setAttribute("style",`visibility:hidden`);
                    }
                    this.motor_2_pid_proportional_gain =  new Display_Box_Simple(
                        this.dom_parent,// dom_parent,
                        false,// action,
                        x,// x,
                        y,// y, 
                        column[2],//width_open
                        column[3],//width_closed
                        32,// height,
                    ); // display box
                    if (this.host_name == "controller"){
                        this.motor_2_pid_proportional_gain.container.setAttribute("style",`visibility:hidden`);
                    }
                    break;
                case "motor_pid_integral_gain":
                    this.motor_1_pid_integral_gain =  new Display_Box_Simple(
                        this.dom_parent,// dom_parent,
                        false,// action,
                        x,// x,
                        y,// y, 
                        column[2],//width_open
                        column[3],//width_closed
                        32,// height,
                    ); // display box
                    if (this.host_name == "controller"){
                        this.motor_1_pid_integral_gain.container.setAttribute("style",`visibility:hidden`);
                    }
                    this.motor_2_pid_integral_gain =  new Display_Box_Simple(
                        this.dom_parent,// dom_parent,
                        false,// action,
                        x,// x,
                        y,// y, 
                        column[2],//width_open
                        column[3],//width_closed
                        32,// height,
                    ); // display box
                    if (this.host_name == "controller"){
                        this.motor_2_pid_integral_gain.container.setAttribute("style",`visibility:hidden`);
                    }
                    break;
                case "motor_pid_differential_gain":
                    this.motor_1_pid_differential_gain =  new Display_Box_Simple(
                        this.dom_parent,// dom_parent,
                        false,// action,
                        x,// x,
                        y,// y, 
                        column[2],//width_open
                        column[3],//width_closed
                        32,// height,
                    ); // display box
                    if (this.host_name == "controller"){
                        this.motor_1_pid_differential_gain.container.setAttribute("style",`visibility:hidden`);
                    }
                    this.motor_2_pid_differential_gain =  new Display_Box_Simple(
                        this.dom_parent,// dom_parent,
                        false,// action,
                        x,// x,
                        y,// y, 
                        column[2],//width_open
                        column[3],//width_closed
                        32,// height,
                    ); // display box
                    if (this.host_name == "controller"){
                        this.motor_2_pid_differential_gain.container.setAttribute("style",`visibility:hidden`);
                    }
                    break;
                case "motor_operating_mode":
                    this.motor_1_operating_mode =  new Display_Box_Simple(
                        this.dom_parent,// dom_parent,
                        false,// action,
                        x,// x,
                        y,// y, 
                        column[2],//width_open
                        column[3],//width_closed
                        32,// height,
                    ); // display box
                    if (this.host_name == "controller"){
                        this.motor_1_operating_mode.container.setAttribute("style",`visibility:hidden`);
                    }
                    this.motor_2_operating_mode =  new Display_Box_Simple(
                        this.dom_parent,// dom_parent,
                        false,// action,
                        x,// x,
                        y,// y, 
                        column[2],//width_open
                        column[3],//width_closed
                        32,// height,
                    ); // display box
                    if (this.host_name == "controller"){
                        this.motor_2_operating_mode.container.setAttribute("style",`visibility:hidden`);
                    }
                    break;
                case "motor_encoder_ppr_value":
                    this.motor_1_encoder_ppr_value =  new Display_Box_Simple(
                        this.dom_parent,// dom_parent,
                        false,// action,
                        x,// x,
                        y,// y, 
                        column[2],//width_open
                        column[3],//width_closed
                        32,// height,
                    ); // display box
                    if (this.host_name == "controller"){
                        this.motor_1_encoder_ppr_value.container.setAttribute("style",`visibility:hidden`);
                    }
                    this.motor_2_encoder_ppr_value =  new Display_Box_Simple(
                        this.dom_parent,// dom_parent,
                        false,// action,
                        x,// x,
                        y,// y, 
                        column[2],//width_open
                        column[3],//width_closed
                        32,// height,
                    ); // display box
                    if (this.host_name == "controller"){
                        this.motor_2_encoder_ppr_value.container.setAttribute("style",`visibility:hidden`);
                    }
                    break;
                case "volts":
                    this.volts = new Display_Box_Simple(
                        this.dom_parent,// dom_parent,
                        false,// action,
                        x,// x,
                        y,// y, 
                        column[2],//width_open
                        column[3],//width_closed
                        68,// height,
                    ); // display box
                    if (this.host_name == "controller"){
                        this.volts.container.setAttribute("style",`visibility:hidden`);
                    }
                    break;
                case "firmware_version":
                    this.firmware_version = new Display_Box_Simple(
                        this.dom_parent,// dom_parent,
                        false,// action,
                        x,// x,
                        y,// y, 
                        column[2],//width_open
                        column[3],//width_closed
                        68,// height,
                    ); // display box
                    if (this.host_name == "controller"){
                        this.firmware_version.container.setAttribute("style",`visibility:hidden`);
                    }
                    break;
                default:
                    break;
            }
        }
        this.update_layout()
    }
    set_style(style_str){

    }
    set_collapse(c_b){

    }
    update_data(cell_name,data){
        switch(cell_name){
            case "system_uptime":
                var uptime_str = data[0] + "\n" + data[1];
                //this.system_uptime.set_label(uptime_str)
                break;
            case "system_runtime":
                var runtime_str = ( parseFloat(data)/3600).toFixed(2) + "h";
                this.system_runtime.set_label(runtime_str)
                break;
            case "app_git_timestamp":
                var date_str = formatDate(new Date(parseInt(data)*1000));
                this.app_git_timestamp.set_label(date_str)
                break;
            case "tb_git_timestamp":
                var date_str = new Date(parseInt(data)*1000);
                this.tb_git_timestamp.set_label(formatDate(date_str))
                break;
            case "system_disk":
                this.system_disk.set_text((parseInt(data[0])/1000000000).toFixed(2) + "GB")
                break;
            case "os_version":
                var os_version_str = data["name"] + " " + data["version"]
                this.os_version.set_text(os_version_str)
                break;
            case "local_ip":
                this.local_ip.set_text(data)
                break;
            case "hostname":
                this.hostname
                break;
            case "memory_free":
                var used = parseInt(data[0]/1000000);
                var total = parseInt(data[1]/1000000);
                this.memory_free.set_text(used + "MB/" + total + "MB")
                break;
            case "system_cpu":
                this.system_cpu.set_text(parseFloat(data).toFixed(2) + "%")
                break;
            case "errors":
                this.errors
                break;
            case "status":
                this.status
                break;
            case "messages":
                this.messages
                break;
            case "emergency_stop":
                this.emergency_stop.set_label(data)
                break;
            case "motor_1_name":
                this.motor_1_name
                break;
            case "motor_2_name":
                this.motor_2_name
                break;
            case "motor_1_slower_10x":
                this.motor_1_slower_10x
                break;
            case "motor_2_slower_10x":
                this.motor_2_slower_10x
                break;
            case "motor_1_slower_1x":
                this.motor_1_slower_1x
                break;
            case "motor_2_slower_1x":
                this.motor_2_slower_1x
                break;
            case "motor_1_value":
                this.motor_1_value.set_text(data)
                break;
            case "motor_2_value":
                this.motor_2_value.set_text(data)
                break;
            case "motor_1_faster_1x":
                this.motor_1_faster_1x
                break;
            case "motor_2_faster_1x":
                this.motor_2_faster_1x
                break;
            case "motor_1_faster_10x":
                this.motor_1_faster_10x
                break;
            case "motor_2_faster_10x":
                this.motor_2_faster_10x
                break;
            case "motor_1_closed_loop_error":
                this.motor_1_closed_loop_error.set_text(data)
                break;
            case "motor_2_closed_loop_error":
                this.motor_2_closed_loop_error.set_text(data)
                break;
            case "motor_1_duty_cycle":
                this.motor_1_duty_cycle.set_text(data)
                break;
            case "motor_2_duty_cycle":
                this.motor_2_duty_cycle.set_text(data)
                break;
            case "motor_1_encoder_speed":
                this.motor_1_encoder_speed.set_text(data)
                break;
            case "motor_2_encoder_speed":
                this.motor_2_encoder_speed.set_text(data)
                break;
            case "motor_1_pid_proportional_gain":
                this.motor_1_pid_proportional_gain
                break;
            case "motor_2_pid_proportional_gain":
                this.motor_2_pid_proportional_gain
                break;
            case "motor_1_pid_integral_gain":
                this.motor_1_pid_integral_gain
                break;
            case "motor_2_pid_integral_gain":
                this.motor_2_pid_integral_gain
                break;
            case "motor_1_pid_differential_gain":
                this.motor_1_pid_differential_gain
                break;
            case "motor_2_pid_differential_gain":
                this.motor_2_pid_differential_gain
                break;
            case "motor_1_operating_mode":
                this.motor_1_operating_mode
                break;
            case "motor_2_operating_mode":
                this.motor_2_operating_mode
                break;
            case "motor_1_encoder_ppr_value":
                this.motor_1_encoder_ppr_value
                break;
            case "motor_2_encoder_ppr_value":
                this.motor_2_encoder_ppr_value
                break;
            case "volts":
                var volts_a = data.split(":");
                var volts_str = parseFloat(volts_a[1])/10 + "V, " + parseFloat(volts_a[2])/10 + "V"
                this.volts.set_text(volts_str)
                break;
            case "firmware_version":
                this.firmware_version.set_text(data)
                break;
            default:
                console.log("error 1: column_name=", cell_name,data)
        }
    }
    update_layout(){
        var _x = parseInt(this.x)
        for(var column of this.column_data){
            var column_name = column[0]
            try{
                var current_column = this[column_name];
                this[column_name].set_position(_x, this.y);
                var width = this[column_name].get_width();
                _x = _x + 4 + width;
            }catch (error){
                switch(column_name){
                    case "rotor_name":
                        this.motor_1_name.set_position(_x, this.y);
                        this.motor_2_name.set_position(_x, this.y+36);
                        var width = this.motor_1_slower_10x.get_width();
                        _x = _x + 4 + width;
                        break;
                    case "motor_slower_10x":
                        this.motor_1_slower_10x.set_position(_x, this.y);
                        this.motor_2_slower_10x.set_position(_x, this.y+36);
                        var width = this.motor_1_slower_10x.get_width();
                        _x = _x + 4 + width;
                        break;
                    case "motor_slower_1x":
                        this.motor_1_slower_1x.set_position(_x, this.y);
                        this.motor_2_slower_1x.set_position(_x, this.y+36);
                        var width = this.motor_1_slower_1x.get_width();
                        _x = _x + 4 + width;
                        break;
                    case "motor_value":
                        this.motor_1_value.set_position(_x, this.y);
                        this.motor_2_value.set_position(_x, this.y+36);
                        var width = this.motor_1_value.get_width();
                        _x = _x + 4 + width;
                        break;
                    case "motor_faster_1x":
                        this.motor_1_faster_1x.set_position(_x, this.y);
                        this.motor_2_faster_1x.set_position(_x, this.y+36);
                        var width = this.motor_1_faster_1x.get_width();
                        _x = _x + 4 + width;
                        break;
                    case "motor_faster_10x":
                        this.motor_1_faster_10x.set_position(_x, this.y);
                        this.motor_2_faster_10x.set_position(_x, this.y+36);
                        var width = this.motor_1_faster_10x.get_width();
                        _x = _x + 4 + width;
                        break;
                    case "motor_closed_loop_error":
                        this.motor_1_closed_loop_error.set_position(_x, this.y);
                        this.motor_2_closed_loop_error.set_position(_x, this.y+36);
                        var width = this.motor_1_closed_loop_error.get_width();
                        _x = _x + 4 + width;
                        break;
                    case "motor_duty_cycle":
                        this.motor_1_duty_cycle.set_position(_x, this.y);
                        this.motor_2_duty_cycle.set_position(_x, this.y+36);
                        var width = this.motor_1_duty_cycle.get_width();
                        _x = _x + 4 + width;
                        break;
                    case "motor_encoder_speed":
                        this.motor_1_encoder_speed.set_position(_x, this.y);
                        this.motor_2_encoder_speed.set_position(_x, this.y+36);
                        var width = this.motor_1_encoder_speed.get_width();
                        _x = _x + 4 + width;
                        break;
                    case "motor_pid_proportional_gain":
                        this.motor_1_pid_proportional_gain.set_position(_x, this.y);
                        this.motor_2_pid_proportional_gain.set_position(_x, this.y+36);
                        var width = this.motor_1_pid_proportional_gain.get_width();
                        _x = _x + 4 + width;
                        break;
                    case "motor_pid_integral_gain":
                        this.motor_1_pid_integral_gain.set_position(_x, this.y);
                        this.motor_2_pid_integral_gain.set_position(_x, this.y+36);
                        var width = this.motor_1_pid_integral_gain.get_width();
                        _x = _x + 4 + width;
                        break;
                    case "motor_pid_differential_gain":
                        this.motor_1_pid_differential_gain.set_position(_x, this.y);
                        this.motor_2_pid_differential_gain.set_position(_x, this.y+36);
                        var width = this.motor_1_pid_differential_gain.get_width();
                        _x = _x + 4 + width;
                        break;
                    case "motor_operating_mode":
                        this.motor_1_operating_mode.set_position(_x, this.y);
                        this.motor_2_operating_mode.set_position(_x, this.y+36);
                        var width = this.motor_1_operating_mode.get_width();
                        _x = _x + 4 + width;
                        break;
                    case "motor_encoder_ppr_value":
                        this.motor_1_encoder_ppr_value.set_position(_x, this.y);
                        this.motor_2_encoder_ppr_value.set_position(_x, this.y+36);
                        var width = this.motor_1_encoder_ppr_value.get_width();
                        _x = _x + 4 + width;
                        break;
                    default:
                        console.log("error 1: column_name=", column_name, error)
                }
            }
        }
    }
}

/* ##### MACHINERY TAB ##### */

class Machinery_Grid{
    constructor(
        dom_parent,
        x,
        y, 
    )
    {
        this.dom_parent = dom_parent;
        this.x = x;
        this.y = y;
        this.column_data = [
            ["system_runtime","runtime",100,32,false],
            ["system_uptime","uptime",100,32,false],
            ["app_git_timestamp","app git time",140,32,false],
            ["tb_git_timestamp","tb git time",140,32,false],
            ["system_disk","disk free",120,32,false],
            ["os_version","os version",120,32,false],
            ["local_ip","local ip",120,32,false],
            ["memory_free","mem free",150,32,false],
            ["system_cpu","cpu",120,32,false],
            ["errors","error",68,32,false],
            ["status","status",68,32,false],
            ["messages","msgs",68,32,false],
            ["hostname","hostname",120,32,false],
            ["emergency_stop","STOP",120,32,false],
            ["rotor_name","rotor",120,32,false],
            ["motor_slower_10x","-10",120,32,false],
            ["motor_slower_1x","-1",120,32,false],
            ["motor_value","speed",120,32,false],
            ["motor_faster_1x","+1",120,32,false],
            ["motor_faster_10x","+10",120,32,false],
            ["motor_closed_loop_error","pid error",120,32,false],
            ["motor_duty_cycle","duty cycle",120,32,false],
            ["motor_encoder_speed","encoder",120,32,false],
            ["motor_pid_proportional_gain","P",32,32,false],
            ["motor_pid_integral_gain","I",32,32,false],
            ["motor_pid_differential_gain","D",32,32,false],
            ["motor_operating_mode","mode",68,32,false],
            ["motor_encoder_ppr_value","ppr",68,32,false],
            ["volts","5V:24",120,32,false],
            ["firmware_version","firmware",120,32,false],
        ]
        var machinery_row_title = new Machinery_Title_Row(this.dom_parent, x,y, this.column_data)
        var vertical_offset = 40;
        var vertical_spacing = 78;
        this.rows = {
            rotors0102:new Machinery_Grid_Row(this.dom_parent,"rotor0102","rotor01","rotor02",x,y+(vertical_offset+(vertical_spacing*0)), this.column_data),
            rotors0304:new Machinery_Grid_Row(this.dom_parent,"rotor0304","rotor03","rotor04",x,y+(vertical_offset+(vertical_spacing*1)), this.column_data),
            rotors0506:new Machinery_Grid_Row(this.dom_parent,"rotor0506","rotor05","rotor06",x,y+(vertical_offset+(vertical_spacing*2)), this.column_data),
            rotors0708:new Machinery_Grid_Row(this.dom_parent,"rotor0708","rotor07","rotor08",x,y+(vertical_offset+(vertical_spacing*3)), this.column_data),
            rotors0910:new Machinery_Grid_Row(this.dom_parent,"rotor0910","rotor09","rotor10",x,y+(vertical_offset+(vertical_spacing*4)), this.column_data),
            rotors1112:new Machinery_Grid_Row(this.dom_parent,"rotor1112","rotor11","rotor12",x,y+(vertical_offset+(vertical_spacing*5)), this.column_data),
            rotors1314:new Machinery_Grid_Row(this.dom_parent,"rotor1314","rotor13","rotor14",x,y+(vertical_offset+(vertical_spacing*6)), this.column_data),
            controller:new Machinery_Grid_Row(this.dom_parent,"controller","","",x,y+(vertical_offset+(vertical_spacing*7)), this.column_data),
        }

    }
}

// COLUMN TITLES


// ROWS



/* ##### MUSIC TAB ##### */

// KEYBOARD

// CHOOSE MUSIC FILE BUTTON

// TODAY'S MUSIC FILE BUTTON

// FILENAME DISPLAY

// REWIND BUTTON

// PLAY BUTTON

// STEPS DISPLAY

// SLOWER BUTTON

// PLAYBACK SPEED DISPLAY

// FASTER BUTTON

// MUSIC FILE SELECTOR



/* ##### GUI PARTS ##### */



function init() {
    canvas = document.getElementById( "top_level" );

    // MOTOR POWER BUTTON
    high_power_button = new Toggle_Button_Async(
        canvas,
        "controller", 
        "request_high_power",
        ["power (unconnected)", "power on confirmed", "power on requested", "power off confirmed", "power off requested"],
        20,
        20,
        390,
        20,
        32
    )

    // ROTOR IDLE BUTTON
    var rotor_idle_button = new Toggle_Button_Async(
        canvas,
        "controller", 
        "request_rotor_idle",
        ["idle (unconnected)", "idle on confirmed", "idle on requested", "idle off confirmed", "idle off requested"],
        440,
        20,
        340,
        20,
        32
    )

    // TB STATE BUTTON
    var system_state_display = new Display_Box_Simple(
        canvas,
        null,
        800,
        20,
        380,
        20,
        32
    )
    system_state_display.set_text("no system state data")

    // BASIC PANELS
    var panel_set = new Panel_Set(
        canvas,
        60,
        {
            machinery:{
                button_x:1200,
                button_y:30,
                button_width_open:180,
                button_width_closed:20,
                panel_style:"panel_set_panel",
                label:"machinery"
            },
            music:{
                button_x:1400,
                button_y:30,
                button_width_open:180,
                button_width_closed:20,
                panel_style:"panel_set_panel", 
                label:"music src"
            },
            keyboard:{
                button_x:1600,
                button_y:30,
                button_width_open:180,
                button_width_closed:20,
                panel_style:"panel_set_panel", 
                label:"keyboard"
            },
        }
    );
    panel_set.set_active_panel("machinery")


    machinery_grid = new Machinery_Grid(panel_set.panels["machinery"].panel.container, 20,60)

}
