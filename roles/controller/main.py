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

"""

#!/usr/bin/python

import glob
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
#from roles.controller.mode_play import Mode_Play

GPIO.setmode(GPIO.BCM)
GPIO.output(8, GPIO.LOW)

#role_module.GPIO.output(8, GPIO.HIGH)

class Poller(threading.Thread):
    def __init__(self, tb):
        threading.Thread.__init__(self)
        self.tb = tb
        self.start()

    def run(self):
        while True:
            time.sleep(5)
            self.tb.publish("request_computer_start_status","")
            self.tb.publish("request_sdc_start_status","")

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
        self.hosts = Hosts.Hosts(self.tb)

        ##### SUBSCRIPTIONS #####
        # CONNECTIVITY
        self.tb.subscribe_to_topic("connected")
        self.tb.subscribe_to_topic("deadman")
        self.tb.subscribe_to_topic("event_brushless_sensor_fault")
        self.tb.subscribe_to_topic("event_controller_connected")
        self.tb.subscribe_to_topic("event_controller_connected")
        self.tb.subscribe_to_topic("event_default_configuration_loaded_at_startup")
        self.tb.subscribe_to_topic("event_emergency_stop")
        self.tb.subscribe_to_topic("event_exceptions")
        self.tb.subscribe_to_topic("event_last_deadman")
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
        self.tb.subscribe_to_topic("event_overheat")
        self.tb.subscribe_to_topic("event_overvoltage")
        self.tb.subscribe_to_topic("event_short_circuit")
        self.tb.subscribe_to_topic("event_status")
        self.tb.subscribe_to_topic("event_undervoltage")
        self.tb.subscribe_to_topic("event_app_git_timestamp")
        self.tb.subscribe_to_topic("event_core_temp")
        self.tb.subscribe_to_topic("event_core_voltage")
        self.tb.subscribe_to_topic("event_ip")
        self.tb.subscribe_to_topic("event_memory_free")
        self.tb.subscribe_to_topic("event_os_version")
        self.tb.subscribe_to_topic("event_query_details")
        self.tb.subscribe_to_topic("event_ready")
        self.tb.subscribe_to_topic("event_runtime")
        self.tb.subscribe_to_topic("event_system_cpu")
        self.tb.subscribe_to_topic("event_system_disk")
        self.tb.subscribe_to_topic("event_tb_git_timestamp")
        self.tb.subscribe_to_topic("event_uptime")
        self.tb.subscribe_to_topic("response_computer_start_status")
        self.tb.subscribe_to_topic("response_sdc_start_status")


        """
        self.modes = {
            "error":Mode_Error(self.tb, self.hosts, self.set_current_mode, self.safety_enable.set_active),
            "waiting_for_connections":Mode_Waiting_For_Connections(self.tb, self.hosts, self.set_current_mode),
            "system_tests":Mode_System_Tests(self.tb, self.hosts, self.set_current_mode),
            "sing":Mode_Play(self.tb, self.hosts, self.set_current_mode),
            #"ending":Mode_ending(self.tb, self.hosts, self.set_current_mode),
        }
        #self.dashboard = dashboard.init()
        self.current_mode_name = self.mode_names.WAITING_FOR_CONNECTIONS
        self.current_mode = self.modes["waiting_for_connections"]
        self.current_mode.begin()
        """
        self.start()
        self.poller = Poller(self.tb)

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
                print(topic, message, origin, destination)
                self.hosts.dispatch(topic, message, origin, destination)
                #self.dashboard(codecs.decode(topic,'UTF-8'), message, origin, destination)
                #self.current_mode.add_to_queue(topic, message, origin, destination)


            except Exception as e:
                exc_type, exc_value, exc_traceback = sys.exc_info()
                print(e, repr(traceback.format_exception(exc_type, exc_value,exc_traceback)))
main = Main()


