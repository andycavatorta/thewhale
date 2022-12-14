"""
solve crash when motor power starts

if host error, cut power, stop sending commands
if host missing, stop sending commands

"""
"""
systems:

local system report
report collection system

deadman

remote power switch

http interface
    deets!

modes:

remote MIDI receiver

local MIDI spooler
    selector
    MIDI files
    automatic loader
    test sequence loader

note-to-motor-command interface


if host error, cut power, stop sending commands
if host missing, stop sending commands
add states [ waiting | all connected] [power off|power on] [stop|idle|play]
event_error

"""

#!/usr/bin/python

import codecs
import glob
import mido
import os
import queue
import RPi.GPIO as GPIO 
import serial
import sys
import time
import threading

app_path = os.path.dirname((os.path.dirname(os.path.dirname(os.path.realpath(__file__)))))
sys.path.append(os.path.split(app_path)[0])

import settings
from thirtybirds3 import thirtybirds

import roles.controller.safety_enable as Safety_Enable
import roles.controller.hosts as Hosts

from roles.controller.mode_error import Mode_Error
from roles.controller.mode_waiting_for_connections import Mode_Waiting_For_Connections
from roles.controller.mode_system_tests import Mode_System_Tests
from http_server_root import dashboard

#role_module.GPIO.output(8, GPIO.HIGH)


DASHBOARD_NOTES_TOPICS = [
    "request_C3",
    "request_Db3",
    "request_D3",
    "request_Db3",
    "request_E3",
    "request_F3",
    "request_Gb3",
    "request_G3",
    "request_Ab3",
    "request_A3",
    "request_Bb3",
    "request_B3",
    "request_C4",
    "request_Db4",
    "request_D4",
    "request_Eb4",
    "request_E4",
    "request_F4",
    "request_Gb4",
    "request_G4",
    "request_Ab4",
    "request_A4",
    "request_Bb4",
]

class Poller(threading.Thread):
    def __init__(self, tb, upstream_queue):
        threading.Thread.__init__(self)
        self.tb = tb
        self.upstream_queue = upstream_queue
        self.sleep_unit = 3
        self.start()

    def run(self):
        while True:
            time.sleep(self.sleep_unit)
            self.tb.publish("request_computer_start_status","")
            self.tb.publish("request_sdc_start_status","")
            self.upstream_queue(b"request_computer_start_status", "", "controller", "controller")
            self.tb.publish("request_computer_runtime_status","")
            self.tb.publish("request_sdc_runtime_status","")
            self.upstream_queue(b"request_computer_runtime_status", "", "controller", "controller")
            time.sleep(self.sleep_unit)
            self.tb.publish("request_computer_runtime_status","")
            self.tb.publish("request_sdc_runtime_status","")
            self.upstream_queue(b"request_computer_runtime_status", "", "controller", "controller")
            time.sleep(self.sleep_unit)
            self.tb.publish("request_computer_runtime_status","")
            self.tb.publish("request_sdc_runtime_status","")
            self.upstream_queue(b"request_computer_runtime_status", "", "controller", "controller")
            time.sleep(self.sleep_unit)
            self.tb.publish("request_computer_runtime_status","")
            self.tb.publish("request_sdc_runtime_status","")
            self.upstream_queue(b"request_computer_runtime_status", "", "controller", "controller")
            time.sleep(self.sleep_unit)
            self.tb.publish("request_computer_runtime_status","")
            self.tb.publish("request_sdc_runtime_status","")
            self.upstream_queue(b"request_computer_runtime_status", "", "controller", "controller")
            time.sleep(self.sleep_unit)
            self.tb.publish("request_computer_runtime_status","")
            self.tb.publish("request_sdc_runtime_status","")
            self.upstream_queue(b"request_computer_runtime_status", "", "controller", "controller")

class High_Power():
    def __init__(self, dashboard_ref):
        self.dashboard_ref = dashboard_ref
        self.pin_number = 8
        self.state_bool = False
        GPIO.setmode(GPIO.BCM)
        GPIO.setup(self.pin_number, GPIO.OUT)
        self.set_state(False)
    def set_state(self, state_bool):
        print("High_Power.set_state 0", state_bool)
        self.state_bool = state_bool
        if self.state_bool:
            print("High_Power.set_state 1", self.state_bool)
            GPIO.output(self.pin_number, GPIO.HIGH)
        else:
            print("High_Power.set_state 2", self.state_bool)
            GPIO.output(self.pin_number, GPIO.LOW)
        self.dashboard_ref("response_high_power", self.state_bool, "controller", "controller")
    def get_state(self):
        self.dashboard_ref("response_high_power", self.state_bool, "controller", "controller")
        return self.state_bool

class Play_Midi_File(threading.Thread):
    def __init__(self, tb):
        threading.Thread.__init__(self)
        self.tb = tb
        self.file_name_0 = "midi/Tallis_salve_intemerata_transposed_x4.mid"
        self.file_name_1 = "midi/Qui_vult_venire_Lasso_mod2.mid"
        self.file_name_2 = "midi/Br-640.mid"
        self.file_name_3 = "midi/Br-640_first_harmonic.mid"
    def send_midi_to_rotors(self, on_off, midi_pitch):
        if midi_pitch >= 38 and midi_pitch <= 59:
            rotor_name, playing_speed = settings.Pitch_To_Rotor_Map.midi[midi_pitch-38]
            if on_off: # if playing
                #print(">>>> 1", playing_speed, rotor_name)
                self.tb.publish("request_motor_speed", playing_speed, rotor_name)
            else: #if idling
                idle_speed_high = settings.Rotors.idle_speeds_high[rotor_name]
                #print(">>>> 2", idle_speed_high, rotor_name)
                self.tb.publish("request_motor_speed", idle_speed_high, rotor_name)

    def rewind(self):
        pass

    def play(self):
        self.start()

    def pause(self):
        pass
        # stop thread or flip bool?
    def set_state(self, play_str):
        if play_str == "PLAY":
            self.play()
        if play_str == "STOP":
            self.rewind()
            self.pause()
        if play_str == "PAUSE":
            self.pause()

    def run(self):
        while True:
            """
            for msg in mido.MidiFile(self.file_name_0).play():
                if msg.type == "note_on":
                    self.send_midi_to_rotors(True, msg.note)
                    #print(msg.type, msg.note)
                if msg.type == "note_off":
                    self.send_midi_to_rotors(False, msg.note)
                    #print(msg.type, msg.note)
            """
            for msg in mido.MidiFile(self.file_name_3).play():
                if msg.type == "note_on":
                    self.send_midi_to_rotors(True, msg.note)
                    #print(msg.type, msg.note)
                if msg.type == "note_off":
                    self.send_midi_to_rotors(False, msg.note)
                    #print(msg.type, msg.note)
            time.sleep(60)
            for msg in mido.MidiFile(self.file_name_1).play():
                if msg.type == "note_on":
                    self.send_midi_to_rotors(True, msg.note)
                    #print(msg.type, msg.note)
                if msg.type == "note_off":
                    self.send_midi_to_rotors(False, msg.note)
                    #print(msg.type, msg.note)
            time.sleep(60)
            for msg in mido.MidiFile(self.file_name_2).play():
                if msg.type == "note_on":
                    self.send_midi_to_rotors(True, msg.note)
                    #print(msg.type, msg.note)
                if msg.type == "note_off":
                    self.send_midi_to_rotors(False, msg.note)
                    #print(msg.type, msg.note)
            time.sleep(60)

class System_Status():
    """
    singleton class because Main is crowded
    this tracks status and does not take action
    """
    def __init__(
            self,
            callback_motor_power,
            callback_playing,
        ):
        self.callback_motor_power = callback_motor_power
        self.callback_playing = callback_playing
        self.STOP = "STOP"
        self.IDLE = "IDLE"
        self.PLAY = "PLAY"
        self.host_connection_status = {
            "rotors0102":False,
            "rotors0304":False,
            "rotors0506":False,
            "rotors0708":False,
            "rotors0910":False,
            "rotors1112":False,
            "rotors1314":False,
        }
        self.sdc_connection_status = {
            "rotors0102":False,
            "rotors0304":False,
            "rotors0506":False,
            "rotors0708":False,
            "rotors0910":False,
            "rotors1112":False,
            "rotors1314":False,
        }
        self.status_hosts_connected = False
        self.status_sdcs_connected = False
        self.status_motor_power = False
        self.status_playing = False
        self.status_error = False

    def update_hosts_connected(self, name, status):
        # on transition from all to not all
        if self.status_hosts_connected and not status:
            self.status_sdcs_connected = False
            self.status_motor_power = False
            self.status_playing = self.STOP
            self.callback_playing(self.status_playing)
            self.callback_motor_power(self.status_motor_power)
        self.status_hosts_connected = self.host_connection_status.all()
        self.host_connection_status[hostname] = status
        return self.status_hosts_connected

    def set_motor_power(self, bool):
        if self.status_error:
            self.status_motor_power = False
            self.status_playing = self.STOP
            self.callback_motor_power(self.status_motor_power)
            self.callback_playing(self.status_playing)
            return self.status_motor_power
        if bool:
            if self.status_hosts_connected:
                self.status_motor_power = True
            else:
                self.status_motor_power = False
        else:
            self.status_motor_power = False
        self.callback_motor_power(self.status_motor_power)
        return self.status_motor_power

    def update_sdcs_connected(self, name, status):
        # on transition from all to not all
        if self.status_sdcs_connected and not status:
            self.status_motor_power = False
            self.status_playing = self.STOP
            self.callback_playing(self.status_playing)
            self.callback_motor_power(self.status_motor_power)
        self.status_sdcs_connected = self.sdc_connection_status.all()
        self.sdc_connection_status[hostname] = status
        return self.status_sdcs_connected

    def set_playing(self, play_mode):
        if self.status_error:
            self.status_motor_power = False
            self.callback_motor_power(self.status_motor_power)
            return self.status_motor_power
        if play_mode == self.STOP:
            self.status_playing = self.STOP
        if play_mode == self.IDLE:
            if self.status_hosts_connected and self.status_sdcs_connected and self.status_motor_power:
                self.status_playing = self.IDLE
            else:
                self.status_playing = self.STOP
        if play_mode == self.PLAY:
            if self.status_hosts_connected and self.status_sdcs_connected and self.status_motor_power:
                self.status_playing = self.PLAY
            else:
                self.status_playing = self.STOP
        self.callback_playing(self.status_playing)
        return self.status_playing

    def set_error (self, bool):
        if bool:
            self.status_motor_power = False
            self.status_playing = self.STOP
            self.callback_playing(self.status_playing)
            self.callback_motor_power(self.status_motor_power)
        self.status_error = bool
        return self.status_error

class Main(threading.Thread):
    class mode_names:
        ERROR = "error"
        WAITING_FOR_CONNECTIONS = "waiting_for_connections"
        SYSTEM_TESTS = "system_tests"
        SING = "sing"

    def __init__(self):
        threading.Thread.__init__(self)
        self.tb = thirtybirds.Thirtybirds(
            settings, 
            app_path,
            self.network_message_handler,
            self.network_status_change_handler,
            self.exception_handler
        )
        self.queue = queue.Queue()
        self.safety_enable = Safety_Enable.Safety_Enable(self.safety_enable_handler)
        self.rotor_idle_state = False
        self.hosts = Hosts.Hosts(self.tb)


        ##### SUBSCRIPTIONS #####
        # CONNECTIVITY
        self.tb.subscribe_to_topic("connected")
        self.tb.subscribe_to_topic("deadman")
        self.tb.subscribe_to_topic("event_app_git_timestamp")
        self.tb.subscribe_to_topic("event_brushless_sensor_fault")
        self.tb.subscribe_to_topic("event_controller_connected")
        self.tb.subscribe_to_topic("event_controller_connected")
        self.tb.subscribe_to_topic("event_core_temp")
        self.tb.subscribe_to_topic("event_core_voltage")
        self.tb.subscribe_to_topic("event_default_configuration_loaded_at_startup")
        self.tb.subscribe_to_topic("event_emergency_stop")
        self.tb.subscribe_to_topic("event_error")
        self.tb.subscribe_to_topic("event_exceptions")
        self.tb.subscribe_to_topic("event_ip")
        self.tb.subscribe_to_topic("event_last_deadman")
        self.tb.subscribe_to_topic("event_memory_free")
        self.tb.subscribe_to_topic("event_messages")
        self.tb.subscribe_to_topic("event_MOSFET_failure")
        self.tb.subscribe_to_topic("event_motor_1_amps_limit_activated")
        self.tb.subscribe_to_topic("event_motor_1_amps_trigger_activated")
        self.tb.subscribe_to_topic("event_motor_1_closed_loop_error")
        self.tb.subscribe_to_topic("event_motor_1_duty_cycle")
        self.tb.subscribe_to_topic("event_motor_1_encoder_counter_absolute")
        self.tb.subscribe_to_topic("event_motor_1_encoder_motor_speed_in_rpm")
        self.tb.subscribe_to_topic("event_motor_1_forward_limit_triggered")
        self.tb.subscribe_to_topic("event_motor_1_loop_error_detected")
        self.tb.subscribe_to_topic("event_motor_1_motor_amps")
        self.tb.subscribe_to_topic("event_motor_1_motor_stalled")
        self.tb.subscribe_to_topic("event_motor_1_reverse_limit_triggered")
        self.tb.subscribe_to_topic("event_motor_1_safety_stop_active")
        self.tb.subscribe_to_topic("event_motor_1_temperature")
        self.tb.subscribe_to_topic("event_motor_2_amps_limit_activated")
        self.tb.subscribe_to_topic("event_motor_2_amps_trigger_activated")
        self.tb.subscribe_to_topic("event_motor_2_closed_loop_error")
        self.tb.subscribe_to_topic("event_motor_2_duty_cycle")
        self.tb.subscribe_to_topic("event_motor_2_encoder_counter_absolute")
        self.tb.subscribe_to_topic("event_motor_2_encoder_motor_speed_in_rpm")
        self.tb.subscribe_to_topic("event_motor_2_forward_limit_triggered")
        self.tb.subscribe_to_topic("event_motor_2_loop_error_detected")
        self.tb.subscribe_to_topic("event_motor_2_motor_amps")
        self.tb.subscribe_to_topic("event_motor_2_motor_stalled")
        self.tb.subscribe_to_topic("event_motor_2_reverse_limit_triggered")
        self.tb.subscribe_to_topic("event_motor_2_safety_stop_active")
        self.tb.subscribe_to_topic("event_motor_2_temperature")
        self.tb.subscribe_to_topic("event_os_version")
        self.tb.subscribe_to_topic("event_overheat")
        self.tb.subscribe_to_topic("event_overvoltage")
        self.tb.subscribe_to_topic("event_query_details")
        self.tb.subscribe_to_topic("event_ready")
        self.tb.subscribe_to_topic("event_runtime")
        self.tb.subscribe_to_topic("event_short_circuit")
        self.tb.subscribe_to_topic("event_status")
        self.tb.subscribe_to_topic("event_system_cpu")
        self.tb.subscribe_to_topic("event_system_disk")
        self.tb.subscribe_to_topic("event_tb_git_timestamp")
        self.tb.subscribe_to_topic("event_undervoltage")
        self.tb.subscribe_to_topic("event_uptime")
        self.tb.subscribe_to_topic("response_computer_runtime_status")
        self.tb.subscribe_to_topic("response_computer_start_status")
        self.tb.subscribe_to_topic("response_emergency_stop")
        self.tb.subscribe_to_topic("response_motor_command_applied")
        self.tb.subscribe_to_topic("response_sdc_runtime_status")
        self.tb.subscribe_to_topic("response_sdc_start_status")
        self.tb.subscribe_to_topic("tb_exception")
        self.tb.subscribe_to_topic("tb_status")
        """
        self.modes = {
            "error":Mode_Error(self.tb, self.hosts, self.set_current_mode, self.safety_enable.set_active),
            "waiting_for_connections":Mode_Waiting_For_Connections(self.tb, self.hosts, self.set_current_mode),
            "system_tests":Mode_System_Tests(self.tb, self.hosts, self.set_current_mode),
            "sing":Mode_Play(self.tb, self.hosts, self.set_current_mode),
            #"ending":Mode_ending(self.tb, self.hosts, self.set_current_mode),
        }
        self.current_mode_name = self.mode_names.WAITING_FOR_CONNECTIONS
        self.current_mode = self.modes["waiting_for_connections"]
        self.current_mode.begin()
        """
        self.dashboard = dashboard.init(self.queue)
        self.high_power = High_Power(self.dashboard)
        self.start()
        self.poller = Poller(self.tb, self.add_to_queue)
        self.play_midi_file = Play_Midi_File(self.tb)

        self.system_status = System_Status(
            self.high_power.set_state,
            self.play_midi_file.set_state
        )

    def convert_dashboard_notes_to_midi(self, topic, message, origin, destination):
        print("handle_dashboard_note_buttons", topic, message, origin, destination)
        note_index = DASHBOARD_NOTES_TOPICS.index(topic)
        midi_pitch = note_index + 48
        return midi_pitch

    def map_pitch_to_rotor_and_speed(self,pitch_num):
        return settings.Pitch_To_Rotor_Map.midi[pitch_num-48]

    def map_rotor_to_host_and_motor_number(self, rotor_name):
        return settings.Rotors.hosts[rotor_name]

    def get_computer_start_status(self):
        data = {
            "hostname":self.tb.get_hostname(),
            "local_ip":self.tb.get_local_ip(),
            "online_status":self.tb.get_online_status(),
            "connections":self.tb.check_connections(),
            "os_version":self.tb.get_os_version(),
            "tb_git_timestamp":self.tb.tb_get_git_timestamp(),
            "tb_scripts_version":self.tb.tb_get_scripts_version(),
            "app_git_timestamp":self.tb.app_get_git_timestamp(),
            "app_scripts_version":self.tb.app_get_scripts_version(),
            "system_uptime":self.tb.get_os_uptime(),
            "system_runtime":self.tb.get_script_runtime(),
            "system_disk":self.tb.get_system_disk(),
        }
        self.dashboard("response_computer_start_status", data, "controller", "controller")

    def get_computer_runtime_status(self):
        data = {
            "core_temp":self.tb.get_core_temp(),
            #"wifi_strength":self.tb.get_wifi_strength(),
            #"core_voltage":self.tb.get_core_voltage(),
            "system_cpu":self.tb.get_system_cpu(),
            "memory_free":self.tb.get_memory_free(),
            "current_time":time.time()
        }
        self.dashboard("response_computer_runtime_status", data, "controller", "controller")

    ##### THIRTYBIRDS CALLBACKS #####
    def network_message_handler(self, topic, message, origin, destination):
        self.add_to_queue(topic, message, origin, destination)

    def exception_handler(self, exception):
        print("exception_handler",exception)

    def network_status_change_handler(self, status, hostname):
        self.add_to_queue(b"response_host_connected",status,hostname, False)

    def add_to_queue(self, topic, message, origin, destination):
        self.queue.put((topic, message, origin, destination))

    ##### MODE MANAGEMENT #####
    def set_current_mode(self,mode_name):
        return
        print("current_mode",self.current_mode,"new mode",mode_name)
        self.tb.publish("cmd_set_mode",mode_name)
        self.current_mode_name = mode_name
        if mode_name == self.mode_names.ERROR:
            self.current_mode.end()
            self.current_mode = self.modes["error"]
            self.current_mode.begin()
        if mode_name == self.mode_names.WAITING_FOR_CONNECTIONS:
            self.current_mode.end()
            self.current_mode = self.modes["waiting_for_connections"]
            self.current_mode.begin()
        if mode_name == self.mode_names.SYSTEM_TESTS:
            self.current_mode.end()
            self.current_mode = self.modes["system_tests"]
            self.current_mode.begin()
        if mode_name == self.mode_names.SING:
            self.current_mode.end()
            self.current_mode = self.modes["sing"]
            self.current_mode.begin()

    def get_current_mode(self):
        return self.current_mode

    def safety_enable_handler(self, state_bool):
        pass
        # when all computers are present
        # when power turns on or off
        # self.add_to_queue(b"event_safety_enable", state_bool, "", "")

    def run(self):
        while True:
            try:
                topic, message, origin, destination = self.queue.get(True)
                if topic==b"deadman":
                    self.safety_enable.add_to_queue(topic, message, origin, destination)
                    continue
                if origin == "dashboard":
                    print("<<<<<<<<<<", topic, message, origin, destination)
                    if destination=="controller":
                        if topic=="restart":
                            self.tb.restart("thewhale")
                        if topic=="reboot":
                            self.tb.reboot()
                        if topic=="pull thirtybirds":
                            self.tb.tb_pull_from_github()
                        if topic=="pull thewhale":
                            self.tb.app_pull_from_github()
                        if topic=="request_high_power":
                            self.high_power.set_state(message)
                            self.dashboard("response_high_power", message, "controller", "controller")
                        if topic=="request_rotor_idle":
                            if self.high_power.get_state():
                                if self.rotor_idle_state: # if idling
                                    self.rotor_idle_state = False;
                                    for rotor_name in settings.Rotors.idle_speeds_low:
                                        self.tb.publish("request_motor_speed", 0, rotor_name)
                                else: 
                                    self.rotor_idle_state = True;
                                    for rotor_name in settings.Rotors.idle_speeds_low:
                                        self.tb.publish("request_motor_speed", settings.Rotors.idle_speeds_low[rotor_name], rotor_name)
                                self.dashboard("response_rotor_idle", self.rotor_idle_state, "controller", "controller")
                                time.sleep(3)
                                self.play_midi_file.start()
                            else:
                                self.dashboard("response_rotor_idle", False, "controller", "controller")

                        if topic=="request_midi_pitch":
                            midi_pitch, on_off = message
                            if midi_pitch >= 38 and midi_pitch <= 59:
                                rotor_name, playing_speed = settings.Pitch_To_Rotor_Map.midi[midi_pitch-38]
                                if on_off: # if playing
                                    #print(">>>> 1", playing_speed, rotor_name)
                                    self.tb.publish("request_motor_speed", playing_speed, rotor_name)
                                else: #if idling
                                    idle_speed_high = settings.Rotors.idle_speeds_high[rotor_name]
                                    #print(">>>> 2", idle_speed_high, rotor_name)
                                    self.tb.publish("request_motor_speed", idle_speed_high, rotor_name)

                        if topic in DASHBOARD_NOTES_TOPICS:
                            midi_pitch = self.convert_dashboard_notes_to_midi(topic, message, origin, destination)
                            rotor,speed = self.map_pitch_to_rotor_and_speed(midi_pitch)
                            host, motor_number = self.map_rotor_to_host_and_motor_number(rotor)
                            self.tb.publish("request_motor_speed", [motor_number, speed], host)
                            self.tb.publish("request_dashboard_button", message, host)
                    else:
                        if topic=="decrement":
                            self.tb.publish("request_decrement", message, destination)
                        if topic=="stop":
                            self.tb.publish("request_stop", message, destination)
                        if topic=="increment":
                            self.tb.publish("request_increment", message, destination)
                        if topic=="request_emergency_stop":
                            self.tb.publish("request_emergency_stop", message, destination)
                        #if topic=="request_idle_speed":
                        #    self.tb.publish("request_idle_speed", message, destination)
                        if topic=="restart":
                            self.tb.publish("restart", destination)
                        if topic=="reboot":
                            self.tb.publish("reboot", destination)
                        if topic=="pull thirtybirds":
                            self.tb.publish("pull_thirtybirds", destination)
                        if topic=="pull thewhale":
                            self.tb.publish("pull_thewhale", destination)
                else:
                    if topic == "event_error":
                        self.high_power.set_state(False)
                        self.play_midi_file.pause()
                        self.tb.publish("request_motor_speed", 0, "rotor01")
                        self.tb.publish("request_motor_speed", 0, "rotor02")
                        self.tb.publish("request_motor_speed", 0, "rotor03")
                        self.tb.publish("request_motor_speed", 0, "rotor04")
                        self.tb.publish("request_motor_speed", 0, "rotor05")
                        self.tb.publish("request_motor_speed", 0, "rotor06")
                        self.tb.publish("request_motor_speed", 0, "rotor07")
                        self.tb.publish("request_motor_speed", 0, "rotor08")
                        self.tb.publish("request_motor_speed", 0, "rotor09")
                        self.tb.publish("request_motor_speed", 0, "rotor10")
                        self.tb.publish("request_motor_speed", 0, "rotor11")
                        self.tb.publish("request_motor_speed", 0, "rotor12")
                        self.tb.publish("request_motor_speed", 0, "rotor13")
                        self.tb.publish("request_motor_speed", 0, "rotor14")
                    if topic == b"response_motor_command_applied":
                        pass
                        #print(topic, message, origin, destination)
                    if topic == b"request_computer_start_status":
                        self.get_computer_start_status()
                    if topic == b"request_computer_runtime_status":
                        self.get_computer_runtime_status()
                        # find a better place for this
                        self.high_power.get_state()
                    if topic == b"response_host_connected":
                        pass
                    self.dashboard(codecs.decode(topic,'UTF-8'), message, origin, destination)
                    self.hosts.dispatch(topic, message, origin, destination)
                    #self.current_mode.add_to_queue(topic, message, origin, destination)
            except Exception as e:
                exc_type, exc_value, exc_traceback = sys.exc_info()
                print(e, repr(traceback.format_exception(exc_type, exc_value,exc_traceback)))
main = Main()
