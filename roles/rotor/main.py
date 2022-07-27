# start-up self check
    # check safety features (serial watchdog, PID loop error)
    # check states

# watchdog queries (one at a time?)
    # temperature
    # PID error

# tb double deadman feature
    # if no message from controller, emergency stop
    # send message if watchdog queries successful


import glob
import os
import queue
import RPi.GPIO as GPIO 
import serial
import sys
import time
import threading

import settings

app_path = os.path.dirname((os.path.dirname(os.path.dirname(os.path.realpath(__file__)))))
sys.path.append(os.path.split(app_path)[0])

from thirtybirds3 import thirtybirds
from thirtybirds3.adapters.actuators.roboteq import sdc

class Main(threading.Thread):
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

        ##### SUBSCRIPTIONS #####
        # CONNECTIVITY
        self.tb.subscribe_to_topic("connected")
        self.tb.subscribe_to_topic("deadman")
        self.tb.subscribe_to_topic("request_computer_start_status")
        self.tb.subscribe_to_topic("request_sdc_start_status")

        self.scd = sdc.SDC(
            self.sdc_data_receiver,
            self.sdc_status_receiver, 
            self.sdc_exception_receiver,
            {}, #config
        )
        self.start()

    def sdc_data_receiver(self, msg):
        print("sdc_data_receiver", msg)

    def sdc_status_receiver(self, msg1, msg2):
        print("sdc_status_receiver", msg1, msg2)

    def sdc_exception_receiver(self, msg):
        print("sdc_exception_receiver", msg)


    def get_computer_start_status(self):
        return {
            "hostname":self.tb.get_hostname(),
            "local_ip":self.tb.get_local_ip(),
            "online_status":self.tb.get_online_status(),
            "connections":self.tb.check_connections(),
            "os_version":self.tb.get_os_version(),
            "tb_git_timestamp":self.tb.tb_get_git_timestamp(),
            "tb_scripts_version":self.tb.tb_get_scripts_version(),
            "app_git_timestamp":self.tb.app_get_git_timestamp(),
            "app_scripts_version":self.tb.app_get_scripts_version(),
        }

    def get_computer_runtime_status(self):
        return {
            "core_temp":self.tb.get_core_temp(),
            "wifi_strength":self.tb.get_wifi_strength(),
            "core_voltage":self.tb.get_core_voltage(),
            "system_cpu":self.tb.get_system_cpu(),
            "system_uptime":self.tb.get_system_uptime(),
            "system_disk":self.tb.get_system_disk(),
            "memory_free":self.tb.get_memory_free(),
        }

    def get_sdc_start_status(self):
        flags_sdc = []
        flags_motor1 = []
        flags_motor2 = []
        fault_flags_d = sdc.sdc.get_runtime_fault_flags()
        for key_value in fault_flags_d.items():
            if key_value[1] == True:
                flags_sdc.append(key_value[0])
        fault_flags_d = sdc.sdc.motor_1.get_runtime_status_flags()
        for key_value in fault_flags_d.items():
            if key_value[1] == True:
                flags_motor1.append(key_value[0])
        fault_flags_d = sdc.sdc.motor_2.get_runtime_status_flags()
        for key_value in fault_flags_d.items():
            if key_value[1] == True:
                flags_motor2.append(key_value[0])
        return {
            "flags_sdc":flags_sdc,
            "flags_motor1":flags_motor1,
            "flags_motor2":flags_motor2,
            "encoder_ppr_value_motor1":sdc.sdc.motor_1.get_encoder_ppr_value(),
            "operating_mode_motor1":sdc.sdc.motor_1.get_operating_mode(),
            "pid_differential_gain_motor1":sdc.sdc.motor_1.get_pid_differential_gain(),
            "pid_integral_gain_motor1":sdc.sdc.motor_1.get_pid_integral_gain(),
            "pid_proportional_gain_motor1":sdc.sdc.motor_1.get_pid_proportional_gain(),
            "encoder_ppr_value_motor2":sdc.sdc.motor_1.get_encoder_ppr_value(),
            "operating_mode_motor2":sdc.sdc.motor_1.get_operating_mode(),
            "pid_differential_gain_motor2":sdc.sdc.motor_1.get_pid_differential_gain(),
            "pid_integral_gain_motor2":sdc.sdc.motor_1.get_pid_integral_gain(),
            "pid_proportional_gain_motor2":sdc.sdc.motor_1.get_pid_proportional_gain(),
            "firmware_version":sdc.sdc.get_firmware_version(),
        }

    def get_sdc_runtime_status(self):
        """
        get_runtime_status_flags
            "amps_limit_activated":
            "motor_stalled":
            "loop_error_detected":
            "safety_stop_active":
            "forward_limit_triggered":
            "reverse_limit_triggered":
            "amps_trigger_activated":

        get_runtime_fault_flags
            "overheat":
            "overvoltage":
            "undervoltage":
            "short_circuit":
            "emergency_stop":
            "brushless_sensor_fault":
            "MOSFET_failure":
            "default_configuration_loaded_at_startup":
        """
        flags_sdc = []
        flags_motor1 = []
        flags_motor2 = []
        fault_flags_d = sdc.sdc.get_runtime_fault_flags()
        for key_value in fault_flags_d.items():
            if key_value[1] == True:
                flags_sdc.append(key_value[0])
        fault_flags_d = sdc.sdc.motor_1.get_runtime_status_flags()
        for key_value in fault_flags_d.items():
            if key_value[1] == True:
                flags_motor1.append(key_value[0])
        fault_flags_d = sdc.sdc.motor_2.get_runtime_status_flags()
        for key_value in fault_flags_d.items():
            if key_value[1] == True:
                flags_motor2.append(key_value[0])
        return {
            "flags_sdc":flags_sdc,
            "flags_motor1":flags_motor1,
            "flags_motor2":flags_motor2,
            "temperature":sdc.sdc.get_temperature(),
            "volts":sdc.sdc.get_volts(),
            "duty_cycle":sdc.sdc.motor_1.get_duty_cycle(),
            "closed_loop_error":sdc.sdc.motor_1.get_closed_loop_error(),
            "encoder_speed_relative":sdc.sdc.motor_1.get_encoder_speed_relative(),
        }


    ##### THIRTYBIRDS CALLBACKS #####
    def network_message_handler(self, topic, message, origin, destination):
        self.add_to_queue(topic, message, origin, destination)

    def exception_handler(self, exception):
        print("exception_handler",exception)

    def network_status_change_handler(self, status, hostname):
        self.add_to_queue(b"respond_host_connected",status,hostname, False)

    def add_to_queue(self, topic, message, origin, destination):
        self.queue.put((topic, message, origin, destination))

    def run(self):
        while True:
            try:
                topic, message, origin, destination = self.queue.get(True)
                if topic==b"deadman":
                    self.safety_enable.add_to_queue(topic, message, origin, destination)
                    continue
                print(topic, message, origin, destination)
                if topic==b"request_computer_start_status":
                    status = self.get_computer_start_status()
                    self.tb.publish("response_computer_start_status",status)

            except Exception as e:
                exc_type, exc_value, exc_traceback = sys.exc_info()
                print(e, repr(traceback.format_exception(exc_type, exc_value,exc_traceback)))

main = Main()
