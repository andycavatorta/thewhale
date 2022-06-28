"""
systems:

#thirtybirds

remote power switch
deadman

note mapper
midi sources:
  keyboard (live)
  test sequence
  today's song segment
    get today's date
    get file with corresponding name
    spool file

midi receiver:
pass midi event to note mapper
send messages to rotors
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

import roles.controller.tests as tests
import roles.controller.safety_enable as Safety_Enable
import roles.controller.hosts as Hosts

from roles.controller.mode_error import Mode_Error
from roles.controller.mode_waiting_for_connections import Mode_Waiting_For_Connections
from roles.controller.mode_system_tests import Mode_System_Tests
from roles.controller.mode_sing import Mode_Sing


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
        #system tests
        self.tb.subscribe_to_topic("response_computer_details")
        # sing events
        self.tb.subscribe_to_topic("event_sdc_fault")

        self.email_message_data = []
        self.modes = {
            "error":Mode_Error(self.tb, self.hosts, self.set_current_mode, self.safety_enable.set_active),
            "waiting_for_connections":Mode_Waiting_For_Connections(self.tb, self.hosts, self.set_current_mode),
            "system_tests":Mode_System_Tests(self.tb, self.hosts, self.set_current_mode),
            "sing":Mode_Money(self.tb, self.hosts, self.set_current_mode),
            #"ending":Mode_ending(self.tb, self.hosts, self.set_current_mode),
        }
        #self.dashboard = dashboard.init()
        self.current_mode_name = self.mode_names.WAITING_FOR_CONNECTIONS
        self.current_mode = self.modes["waiting_for_connections"]
        self.current_mode.begin()
        self.start()

    ##### THIRTYBIRDS CALLBACKS #####
    def network_message_handler(self, topic, message, origin, destination):
        self.add_to_queue(topic, message, origin, destination)

    def exception_handler(self, exception):
        print("exception_handler",exception)

    def network_status_change_handler(self, status, hostname):
        self.add_to_queue(b"respond_host_connected",status,hostname, False)

    def add_to_queue(self, topic, message, origin, destination):
        self.queue.put((topic, message, origin, destination))

    ##### MODE MANAGEMENT #####
    def set_current_mode(self,mode_name):
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
        # when all computers are present
        # when power turns on or off
        self.add_to_queue(b"event_safety_enable", state_bool, "", "")

    def run(self):
        while True:
            try:
                topic, message, origin, destination = self.queue.get(True)
                if topic==b"deadman":
                    self.safety_enable.add_to_queue(topic, message, origin, destination)
                    continue

                self.hosts.dispatch(topic, message, origin, destination)
                #self.dashboard(codecs.decode(topic,'UTF-8'), message, origin, destination)
                self.current_mode.add_to_queue(topic, message, origin, destination)

            except Exception as e:
                exc_type, exc_value, exc_traceback = sys.exc_info()
                print(e, repr(traceback.format_exception(exc_type, exc_value,exc_traceback)))
main = Main()


