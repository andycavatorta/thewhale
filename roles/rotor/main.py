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
        self.hostname = self.tb.get_hostname()
        ##### SUBSCRIPTIONS #####
        # CONNECTIVITY
        self.tb.subscribe_to_topic("connected")
        self.tb.subscribe_to_topic("deadman")
        self.tb.subscribe_to_topic("pull_thewhale")
        self.tb.subscribe_to_topic("pull_thirtybirds")
        self.tb.subscribe_to_topic("reboot")
        self.tb.subscribe_to_topic("request_computer_runtime_status")
        self.tb.subscribe_to_topic("request_computer_start_status")
        self.tb.subscribe_to_topic("request_dashboard_button")
        self.tb.subscribe_to_topic("request_decrement")
        self.tb.subscribe_to_topic("request_emergency_stop")
        self.tb.subscribe_to_topic("request_idle_speed")
        self.tb.subscribe_to_topic("request_increment")
        self.tb.subscribe_to_topic("request_motor_speed")
        self.tb.subscribe_to_topic("request_sdc_runtime_status")
        self.tb.subscribe_to_topic("request_sdc_start_status")
        self.tb.subscribe_to_topic("request_stop")
        self.tb.subscribe_to_topic("restart")


        self.sdc = sdc.SDC(
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
            #"wifi_strength":self.tb.get_wifi_strength(),
            "core_voltage":self.tb.get_core_voltage(),
            "system_cpu":self.tb.get_system_cpu(),
            "system_uptime":self.tb.get_os_uptime(),
            "system_runtime":self.tb.get_script_runtime(),
            "system_disk":self.tb.get_system_disk(),
            "memory_free":self.tb.get_memory_free(),
            "current_time":time.time()
        }

    def get_sdc_start_status(self):
        if self.sdc.get_firmware_version() is None:
            return {}
        return {
            "firmware_version":self.sdc.get_firmware_version(),
            "encoder_ppr_value_motor1":self.sdc.motor_1.get_encoder_ppr_value(),
            "operating_mode_motor1":self.sdc.motor_1.get_operating_mode(),
            "pid_differential_gain_motor1":self.sdc.motor_1.get_pid_differential_gain(),
            "pid_integral_gain_motor1":self.sdc.motor_1.get_pid_integral_gain(),
            "pid_proportional_gain_motor1":self.sdc.motor_1.get_pid_proportional_gain(),
            "encoder_ppr_value_motor2":self.sdc.motor_2.get_encoder_ppr_value(),
            "operating_mode_motor2":self.sdc.motor_2.get_operating_mode(),
            "pid_differential_gain_motor2":self.sdc.motor_2.get_pid_differential_gain(),
            "pid_integral_gain_motor2":self.sdc.motor_2.get_pid_integral_gain(),
            "pid_proportional_gain_motor2":self.sdc.motor_2.get_pid_proportional_gain(),
        }

    def get_sdc_runtime_status(self):
        if self.sdc.get_firmware_version() is None:
            return {}
        flags_sdc = []
        fault_flags_d = self.sdc.get_runtime_fault_flags()
        if fault_flags_d is not None:
            for key_value in fault_flags_d.items():
                if key_value[1] == True:
                    flags_sdc.append(key_value[0])
            #fault_flags_d = self.sdc.motor_1.get_runtime_status_flags()
            #for key_value in fault_flags_d.items():
            #    if key_value[1] == True:
            #        flags_motor1.append(key_value[0])
            #fault_flags_d = self.sdc.motor_2.get_runtime_status_flags()
            #for key_value in fault_flags_d.items():
            #    if key_value[1] == True:
            #        flags_motor2.append(key_value[0])
        emergency_stop = True if "emergency_stop" in flags_sdc else False
        return {
            "emergency_stop":emergency_stop,
            "volts":self.sdc.get_volts(),
            "duty_cycle_1":self.sdc.motor_1.get_duty_cycle(),
            "duty_cycle_2":self.sdc.motor_2.get_duty_cycle(),
            "closed_loop_error_1":self.sdc.motor_1.get_closed_loop_error(),
            "closed_loop_error_2":self.sdc.motor_2.get_closed_loop_error(),
            "encoder_speed_relative_1":self.sdc.motor_1.get_encoder_speed_relative(),
            "encoder_speed_relative_2":self.sdc.motor_1.get_encoder_speed_relative(),
            "motor_command_applied_1":self.sdc.motor_1.get_motor_command_applied(),
            "motor_command_applied_2":self.sdc.motor_2.get_motor_command_applied(),
            "current_time":time.time()
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
                #print(topic, message, origin, destination)

                if topic==b"request_computer_start_status":
                    status = self.get_computer_start_status()
                    self.tb.publish("response_computer_start_status",status)

                if topic==b"request_computer_runtime_status":
                    status = self.get_computer_runtime_status()
                    self.tb.publish("response_computer_runtime_status",status)

                if topic==b"request_sdc_start_status":
                    status = self.get_sdc_start_status()
                    self.tb.publish("response_sdc_start_status",status)

                if topic==b"request_sdc_runtime_status":
                    status = self.get_sdc_runtime_status()
                    self.tb.publish("response_sdc_runtime_status",status)

                ### DASHBOARD FUNCTIONS ###
                if str(message) == self.hostname:
                    if topic==b"restart":
                        self.tb.restart("thewhale")
                    if topic==b"reboot":
                        self.tb.reboot()
                    if topic==b"pull_thirtybirds":
                        self.tb.tb_pull_from_github()
                    if topic==b"pull_thewhale":
                        self.tb.app_pull_from_github()

                if topic==b"request_emergency_stop":
                    if destination==self.hostname:
                        print("request_emergency_stop", message)
                        self.sdc.set_emergency_stop(message)
                        time.sleep(0.05)
                        status = self.sdc.get_emergency_stop()
                        self.tb.publish("response_emergency_stop",status)

                if topic==b"request_decrement":
                    hostname,motor_number = settings.Rotors.hosts[destination]
                    if hostname == self.hostname:
                        if motor_number == 1:
                            status = self.sdc.motor_1.get_motor_command_applied()
                            self.sdc.motor_1.go_to_speed_or_relative_position(status-1)
                            self.tb.publish("response_motor_command_applied",[1,status-1])
                        if motor_number == 2:
                            status = self.sdc.motor_2.get_motor_command_applied()
                            self.sdc.motor_2.go_to_speed_or_relative_position(status-1)
                            self.tb.publish("response_motor_command_applied",[2,status-1])

                if topic==b"request_motor_speed":
                    if destination == self.hostname:
                        motor_number, speed = message
                        if motor_number == 1:
                            #self.sdc.motor_1.go_to_speed_or_relative_position(speed)
                            #status = self.sdc.motor_1.get_motor_command_applied()
                            self.tb.publish("response_motor_command_applied",[1,speed])
                        if motor_number == 2:
                            #self.sdc.motor_2.go_to_speed_or_relative_position(speed)
                            #status = self.sdc.motor_2.get_motor_command_applied()
                            self.tb.publish("response_motor_command_applied",[2,speed])

                if topic==b"request_stop":
                    hostname,motor_number = settings.Rotors.hosts[destination]
                    if hostname == self.hostname:
                        if motor_number == 1:
                            self.sdc.motor_1.go_to_speed_or_relative_position(0)
                            status = self.sdc.motor_1.get_motor_command_applied()
                            self.tb.publish("response_motor_command_applied",[1,status])
                        if motor_number == 2:
                            self.sdc.motor_2.go_to_speed_or_relative_position(0)
                            status = self.sdc.motor_2.get_motor_command_applied()
                            self.tb.publish("response_motor_command_applied",[2,status])

                if topic==b"request_increment":
                    hostname,motor_number = settings.Rotors.hosts[destination]
                    if hostname == self.hostname:
                        if motor_number == 1:
                            status = self.sdc.motor_1.get_motor_command_applied()
                            self.sdc.motor_1.go_to_speed_or_relative_position(status+1)
                            self.tb.publish("response_motor_command_applied",[1,status+1])
                        if motor_number == 2:
                            status = self.sdc.motor_2.get_motor_command_applied()
                            self.sdc.motor_2.go_to_speed_or_relative_position(status+1)
                            self.tb.publish("response_motor_command_applied",[2,status+1])

            except Exception as e:
                exc_type, exc_value, exc_traceback = sys.exc_info()
                print(e, repr(traceback.format_exception(exc_type, exc_value,exc_traceback)))

main = Main()
