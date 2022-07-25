"""
host module functions:
    cache the varied state data of hosts, providing continuity when mode changes
    provide method names for publishing to thirtybirds topics
    provide state data to http_server
    
data flow:
    controller writes state data here
    current mode reads and requests state data here
    http_server reads and requests state data here

verbs:
    request - send request to host for data
    set - store response to request, called by controller.main()
    get - return locally stored data
    cmd - send command that returns nothing

to do:
    ensure thread safety
        what happens when controller writes to self.foo while mode and http_server read self.foo?
        safety could come from the fact that these are only used main.run and never simultaneously
    add vars and methods to store system tests

"""

import codecs
import os
import queue
import sys
import threading
import time

app_path = os.path.dirname((os.path.dirname(os.path.dirname(os.path.realpath(__file__)))))
sys.path.append(os.path.split(app_path)[0])

class Host():
    def __init__(self, hostname):
        self.connected = False
        self.core_temp = -1.0 
        self.core_voltage = -1.0 
        self.hostname = hostname
        self.ip = "0.0.0.0"
        self.last_deadman = 0 #unix timestamp
        self.memory_free = -1.0 
        self.os_version = "-"
        self.ready = False
        self.runtime = -1.0 
        self.system_cpu = 1.0  
        self.system_disk = -1.0 
        self.uptime = -1.0 

        self.app_git_timestamp =  -1
        self.tb_git_timestamp = -1

        self.exceptions = []
        self.messages = []
        self.status = []

    def set_batch_details(self, computer_details):
        """ this method will sort any batches of computer details """
        for detail_name in computer_details:
            if detail_name == "app_git_timestamp":
                self.set_app_git_timestamp(computer_details[detail_name])
            if detail_name == "connected":
                self.connected(computer_details[detail_name])
            if detail_name == "core_temp":
                self.set_core_temp(computer_details[detail_name])
            if detail_name == "core_voltage":
                self.set_core_voltage(computer_details[detail_name])
            if detail_name == "exceptions":
                self.set_exceptions(computer_details[detail_name])
            if detail_name == "ip":
                self.set_ip(computer_details[detail_name])
            if detail_name == "last_deadman":
                self.set_last_deadman(computer_details[detail_name])
            if detail_name == "memory_free":
                self.set_memory_free(computer_details[detail_name])
            if detail_name == "messages":
                self.set_messages(computer_details[detail_name])
            if detail_name == "os_version":
                self.set_os_version(computer_details[detail_name])
            if detail_name == "ready":
                self.set_ready(computer_details[detail_name])
            if detail_name == "runtime":
                self.set_runtime(computer_details[detail_name])
            if detail_name == "status":
                self.set_status(computer_details[detail_name])
            if detail_name == "system_cpu":
                self.set_system_cpu(computer_details[detail_name])
            if detail_name == "system_disk":
                self.set_system_disk(computer_details[detail_name])
            if detail_name == "tb_git_timestamp":
                self.set_tb_git_timestamp(computer_details[detail_name])
            if detail_name == "uptime":
                self.set_uptime(computer_details[detail_name])

    def set_app_git_timestamp(self, app_git_timestamp):
        self.app_git_timestamp = app_git_timestamp
    def get_app_git_timestamp(self):
        return self.app_git_timestamp

    def set_connected(self, connected):
        self.connected = connected
    def get_connected(self):
        return self.connected

    def set_core_temp(self, core_temp):
        self.core_temp = core_temp
    def get_core_temp(self):
        return self.core_temp

    def set_core_voltage(self,core_voltage ):
        self.core_voltage = core_voltage
    def get_core_voltage(self):
        return self.core_voltage

    def set_exceptions(self, exceptions):
        self.exceptions.append(exceptions)
    def get_exceptions(self):
        return self.exceptions

    def set_ip(self, ip):
        self.ip = ip
    def get_ip(self):
        return self.ip

    def set_last_deadman(self, last_deadman):
        self.last_deadman = last_deadman
    def get_last_deadman(self):
        return self.last_deadman

    def set_memory_free(self, memory_free):
        self.memory_free = memory_free
    def get_memory_free(self):
        return self.memory_free

    def set_messages(self, messages):
        self.messages.apppend(messages)
    def get_messages(self):
        return self.messages

    def set_os_version(self, os_version):
        self.os_version = os_version
    def get_os_version(self):
        return self.os_version

    def set_ready(self, ready):
        self.ready = ready
    def get_ready(self):
        return self.ready

    def set_runtime(self, runtime):
        self.runtime = runtime
    def get_runtime(self):
        return self.runtime

    def set_status(self, status):
        self.status.append(status) 
    def get_status(self):
        return self.status

    def set_system_cpu(self, system_cpu):
        self.system_cpu = system_cpu
    def get_system_cpu(self):
        return self.system_cpu

    def set_system_disk(self, system_disk):
        self.system_disk = system_disk
    def get_system_disk(self):
        return self.system_disk

    def set_tb_git_timestamp(self, tb_git_timestamp):
        self.tb_git_timestamp = tb_git_timestamp
    def get_tb_git_timestamp(self):
        return self.tb_git_timestamp

    def set_uptime(self, uptime):
        self.uptime = uptime
    def get_uptime(self):
        return self.uptime

    def get_static_details(self):
        return {
            "app_git_timestamp":self.app_git_timestamp,
            "ip":self.ip,
            "tb_git_timestamp":self.tb_git_timestamp,
            "os_version":self.os_version,
        }

    def get_dynamic_details(self):
        return {
            "connected":self.connected,
            "core_temp":self.core_temp,
            "core_voltage":self.core_voltage,
            "exceptions":self.exceptions,
            "last_deadman":self.last_deadman,
            "memory_free":self.memory_free,
            "messages":self.messages,
            "ready":self.os_version,
            "runtime":self.runtime,
            "status":self.status,
            "system_cpu":self.system_cpu,
            "system_disk":self.system_disk,
            "uptime":self.uptime,
        }

    def get_computer_details(self):
        return {
            "system_disk":self.system_disk,
            "core_temp":self.core_temp,
            "app_git_timestamp":self.app_git_timestamp,
            "tb_git_timestamp":self.tb_git_timestamp,
        }
    def get_computer_details_received(self):
        if self.system_disk == -1:
            return False
        if self.core_temp == -1:
            return False
        if self.app_git_timestamp == "":
            return False
        if self.tb_git_timestamp == "":
            return False
        return True

class Controller(Host):
    def __init__(self, hostname, tb):
        Host.__init__(self, hostname)
        self.hostname = hostname
        self.safety_enable = False
        self.tb = tb
    def get_safety_enable(self):
        return self.safety_enable
    def set_safety_enable(self,safety_enable):
        self.safety_enable = safety_enable
    def get_computer_details(self):
        return {
            "app_git_timestamp":self.tb.app_get_git_timestamp(),
            "ip":self.tb.get_local_ip(),
            "tb_git_timestamp":self.tb.tb_get_git_timestamp(),
            "os_version":self.tb.get_os_version(),
            "connected":True,
            "core_temp":self.tb.get_core_temp(),
            "core_voltage":self.tb.get_core_voltage(),
            "exceptions":[],
            "last_deadman":self.get_last_deadman(),
            "memory_free":self.tb.get_memory_free(), 
            "messages":[],
            "ready":True,
            "runtime":self.tb.get_script_runtime(),
            "status":[],
            "system_cpu":self.tb.get_system_cpu(),
            "system_disk":self.tb.get_system_disk(),
            "uptime":self.tb.get_os_uptime(),
        }

class Rotor(Host):
    def __init__(self, hostname, tb):
        Host.__init__(self, hostname)
        self.hostname = hostname
        self.tb = tb
        self.controller_connected = False
        self.motor_1_duty_cycle = 0.0
        self.motor_1_motor_amps = 0.0
        self.motor_1_encoder_counter_absolute = 0.0
        self.motor_1_encoder_motor_speed_in_rpm = 0.0
        self.motor_1_closed_loop_error = 0.0
        self.motor_1_temperature = 0.0
        self.motor_1_amps_limit_activated = 0.0
        self.motor_1_motor_stalled = 0.0
        self.motor_1_loop_error_detected = 0.0
        self.motor_1_safety_stop_active = 0.0
        self.motor_1_forward_limit_triggered = 0.0
        self.motor_1_reverse_limit_triggered = 0.0
        self.motor_1_amps_trigger_activated = 0.0
        self.motor_2_duty_cycle = 0.0
        self.motor_2_motor_amps = 0.0
        self.motor_2_encoder_counter_absolute = 0.0
        self.motor_2_encoder_motor_speed_in_rpm = 0.0
        self.motor_2_closed_loop_error = 0.0
        self.motor_2_temperature = 0.0
        self.motor_2_amps_limit_activated = 0.0
        self.motor_2_motor_stalled = 0.0
        self.motor_2_loop_error_detected = 0.0
        self.motor_2_safety_stop_active = 0.0
        self.motor_2_forward_limit_triggered = 0.0
        self.motor_2_reverse_limit_triggered = 0.0
        self.motor_2_amps_trigger_activated = 0.0
        self.overheat = 0.0
        self.overvoltage = 0.0
        self.undervoltage = 0.0
        self.short_circuit = 0.0
        self.emergency_stop = 0.0
        self.brushless_sensor_fault = 0.0
        self.MOSFET_failure = 0.0
        self.default_configuration_loaded_at_startup = 0.0

    def set_query_details(self, computer_details):
        """ this method will sort any batches of computer details """
        for detail_name in computer_details:

            if detail_name == "controller_connected":
                self.controller_connected(computer_details[detail_name])
            if detail_name == "motor_1_duty_cycle":
                self.set_motor_1_duty_cycle(computer_details[detail_name])
            if detail_name == "motor_1_motor_amps":
                self.set_motor_1_motor_amps(computer_details[detail_name])
            if detail_name == "motor_1_encoder_counter_absolute":
                self.set_motor_1_encoder_counter_absolute(computer_details[detail_name])
            if detail_name == "motor_1_encoder_motor_speed_in_rpm":
                self.set_motor_1_encoder_motor_speed_in_rpm(computer_details[detail_name])
            if detail_name == "motor_1_closed_loop_error":
                self.set_motor_1_closed_loop_error(computer_details[detail_name])
            if detail_name == "motor_1_temperature":
                self.set_motor_1_temperature(computer_details[detail_name])
            if detail_name == "motor_1_amps_limit_activated":
                self.set_motor_1_amps_limit_activated(computer_details[detail_name])
            if detail_name == "motor_1_motor_stalled":
                self.set_motor_1_motor_stalled(computer_details[detail_name])
            if detail_name == "motor_1_loop_error_detected":
                self.set_motor_1_loop_error_detected(computer_details[detail_name])
            if detail_name == "motor_1_safety_stop_active":
                self.set_motor_1_safety_stop_active(computer_details[detail_name])
            if detail_name == "motor_1_forward_limit_triggered":
                self.set_motor_1_forward_limit_triggered(computer_details[detail_name])
            if detail_name == "motor_1_reverse_limit_triggered":
                self.set_motor_1_reverse_limit_triggered(computer_details[detail_name])
            if detail_name == "motor_1_amps_trigger_activated":
                self.set_motor_1_amps_trigger_activated(computer_details[detail_name])

            if detail_name == "motor_2_duty_cycle":
                self.set_motor_2_duty_cycle(computer_details[detail_name])
            if detail_name == "motor_2_motor_amps":
                self.set_motor_2_motor_amps(computer_details[detail_name])
            if detail_name == "motor_2_encoder_counter_absolute":
                self.set_motor_2_encoder_counter_absolute(computer_details[detail_name])
            if detail_name == "motor_2_encoder_motor_speed_in_rpm":
                self.set_motor_2_encoder_motor_speed_in_rpm(computer_details[detail_name])
            if detail_name == "motor_2_closed_loop_error":
                self.set_motor_2_closed_loop_error(computer_details[detail_name])
            if detail_name == "motor_2_temperature":
                self.set_motor_2_temperature(computer_details[detail_name])
            if detail_name == "motor_2_amps_limit_activated":
                self.set_motor_2_amps_limit_activated(computer_details[detail_name])
            if detail_name == "motor_2_motor_stalled":
                self.set_motor_2_motor_stalled(computer_details[detail_name])
            if detail_name == "motor_2_loop_error_detected":
                self.set_motor_2_loop_error_detected(computer_details[detail_name])
            if detail_name == "motor_2_safety_stop_active":
                self.set_motor_2_safety_stop_active(computer_details[detail_name])
            if detail_name == "motor_2_forward_limit_triggered":
                self.set_motor_2_forward_limit_triggered(computer_details[detail_name])
            if detail_name == "motor_2_reverse_limit_triggered":
                self.set_motor_2_reverse_limit_triggered(computer_details[detail_name])
            if detail_name == "motor_2_amps_trigger_activated":
                self.set_motor_2_amps_trigger_activated(computer_details[detail_name])

            if detail_name == "overheat":
                self.set_overheat(computer_details[detail_name])
            if detail_name == "overvoltage":
                self.set_overvoltage(computer_details[detail_name])
            if detail_name == "undervoltage":
                self.set_undervoltage(computer_details[detail_name])
            if detail_name == "short_circuit":
                self.set_short_circuit(computer_details[detail_name])
            if detail_name == "emergency_stop":
                self.set_emergency_stop(computer_details[detail_name])
            if detail_name == "brushless_sensor_fault":
                self.set_brushless_sensor_fault(computer_details[detail_name])
            if detail_name == "MOSFET_failure":
                self.set_MOSFET_failure(computer_details[detail_name])
            if detail_name == "default_configuration_loaded_at_startup":
                self.set_default_configuration_loaded_at_startup(computer_details[detail_name])

    def get_query details(self):
        return {
            "controller_connected":self.get_controller_connected(),
            "motor_1_duty_cycle":self.get_motor_1_duty_cycle(),
            "motor_1_motor_amps":self.get_motor_1_motor_amps(),
            "motor_1_encoder_counter_absolute":self.get_motor_1_encoder_counter_absolute(),
            "motor_1_encoder_motor_speed_in_rpm":self.get_motor_1_encoder_motor_speed_in_rpm(),
            "motor_1_closed_loop_error":self.get_motor_1_closed_loop_error(),
            "motor_1_temperature":self.get_motor_1_temperature(),
            "motor_1_amps_limit_activated":self.get_motor_1_amps_limit_activated(),
            "motor_1_motor_stalled":self.get_motor_1_motor_stalled(),
            "motor_1_loop_error_detected":self.get_motor_1_loop_error_detected(),
            "motor_1_safety_stop_active":self.get_motor_1_safety_stop_active(),
            "motor_1_forward_limit_triggered":self.get_motor_1_forward_limit_triggered(),
            "motor_1_reverse_limit_triggered":self.get_motor_1_reverse_limit_triggered(),
            "motor_1_amps_trigger_activated":self.get_motor_1_amps_trigger_activated(),
            "motor_2_duty_cycle":self.get_motor_2_duty_cycle(),
            "motor_2_motor_amps":self.get_motor_2_motor_amps(),
            "motor_2_encoder_counter_absolute":self.get_motor_2_encoder_counter_absolute(),
            "motor_2_encoder_motor_speed_in_rpm":self.get_motor_2_encoder_motor_speed_in_rpm(),
            "motor_2_closed_loop_error":self.get_motor_2_closed_loop_error(),
            "motor_2_temperature":self.get_motor_2_temperature(),
            "motor_2_amps_limit_activated":self.get_motor_2_amps_limit_activated(),
            "motor_2_motor_stalled":self.get_motor_2_motor_stalled(),
            "motor_2_loop_error_detected":self.get_motor_2_loop_error_detected(),
            "motor_2_safety_stop_active":self.get_motor_2_safety_stop_active(),
            "motor_2_forward_limit_triggered":self.get_motor_2_forward_limit_triggered(),
            "motor_2_reverse_limit_triggered":self.get_motor_2_reverse_limit_triggered(),
            "motor_2_amps_trigger_activated":self.get_motor_2_amps_trigger_activated(),
            "overheat":self.get_overheat(),
            "overvoltage":self.get_overvoltage(),
            "undervoltage":self.get_undervoltage(),
            "short_circuit":self.get_short_circuit(),
            "emergency_stop":self.get_emergency_stop(),
            "brushless_sensor_fault":self.get_brushless_sensor_fault(),
            "MOSFET_failure":self.get_MOSFET_failure(),
            "default_configuration_loaded_at_startup":self.get_default_configuration_loaded_at_startup(),
        }

    def set_controller_connected(self, controller_connected):
        self.controller_connected = controller_connected
    def get_controller_connected(self):
        return self.controller_connected

    def set_overheat(self, overheat):
        self.overheat = overheat
    def get_overheat(self):
        return self.overheat

    def set_overvoltage(self, overvoltage):
        self.overvoltage = overvoltage
    def get_overvoltage(self):
        return self.overvoltage

    def set_undervoltage(self, undervoltage):
        self.undervoltage = undervoltage
    def get_undervoltage(self):
        return self.undervoltage

    def set_short_circuit(self, short_circuit):
        self. short_circuit= short_circuit
    def get_short_circuit(self):
        return self.short_circuit

    def set_emergency_stop(self, emergency_stop):
        self.emergency_stop= emergency_stop
    def get_emergency_stop(self):
        return self.emergency_stop

    def set_brushless_sensor_fault(self, brushless_sensor_fault):
        self.brushless_sensor_fault = brushless_sensor_fault
    def get_brushless_sensor_fault(self):
        return self.brushless_sensor_fault

    def set_MOSFET_failure(self, MOSFET_failure):
        self.MOSFET_failure = MOSFET_failure
    def get_MOSFET_failure(self):
        return self.MOSFET_failure

    def set_default_configuration_loaded_at_startup(self, default_configuration_loaded_at_startup):
        self.default_configuration_loaded_at_startup = default_configuration_loaded_at_startup
    def get_default_configuration_loaded_at_startup(self):
        return self.default_configuration_loaded_at_startup

    def set_motor_1_duty_cycle(self, motor_1_duty_cycle):
        self.motor_1_duty_cycle = motor_1_duty_cycle
    def get_motor_1_duty_cycle(self):
        return self.motor_1_duty_cycle

    def set_motor_1_motor_amps(self, motor_1_motor_amps):
        self.motor_1_motor_amps = motor_1_motor_amps
    def get_motor_1_motor_amps(self):
        return self.motor_1_motor_amps

    def set_motor_1_encoder_counter_absolute(self, motor_1_encoder_counter_absolute):
        self.motor_1_encoder_counter_absolute = motor_1_encoder_counter_absolute
    def get_motor_1_encoder_counter_absolute(self):
        return self.motor_1_encoder_counter_absolute

    def set_motor_1_encoder_motor_speed_in_rpm(self, motor_1_encoder_motor_speed_in_rpm):
        self.motor_1_encoder_motor_speed_in_rpm = motor_1_encoder_motor_speed_in_rpm
    def get_motor_1_encoder_motor_speed_in_rpm(self):
        return self.motor_1_encoder_motor_speed_in_rpm

    def set_motor_1_closed_loop_error(self, motor_1_closed_loop_error):
        self.motor_1_closed_loop_error = motor_1_closed_loop_error
    def get_motor_1_closed_loop_error(self):
        return self.motor_1_closed_loop_error

    def set_motor_1_temperature(self, motor_1_temperature):
        self.motor_1_temperature = motor_1_temperature
    def get_motor_1_temperature(self):
        return self.motor_1_temperature

    def set_motor_1_amps_limit_activated(self, motor_1_amps_limit_activated):
        self.motor_1_amps_limit_activated = motor_1_amps_limit_activated
    def get_motor_1_amps_limit_activated(self):
        return self.motor_1_amps_limit_activated

    def set_motor_1_motor_stalled(self, motor_1_motor_stalled):
        self.motor_1_motor_stalled = motor_1_motor_stalled
    def get_motor_1_motor_stalled(self):
        return self.

    def set_motor_1_loop_error_detected(self, motor_1_loop_error_detected):
        self.motor_1_loop_error_detected = motor_1_loop_error_detected
    def get_motor_1_loop_error_detected(self):
        return self.motor_1_loop_error_detected

    def set_motor_1_safety_stop_active(self, motor_1_safety_stop_active):
        self.motor_1_safety_stop_active = motor_1_safety_stop_active
    def get_motor_1_safety_stop_active(self):
        return self.motor_1_safety_stop_active

    def set_motor_1_forward_limit_triggered(self, motor_1_forward_limit_triggered):
        self.motor_1_forward_limit_triggered = motor_1_forward_limit_triggered
    def get_motor_1_forward_limit_triggered(self):
        return self.motor_1_forward_limit_triggered

    def set_motor_1_reverse_limit_triggered(self, motor_1_reverse_limit_triggered):
        self.motor_1_reverse_limit_triggered = motor_1_reverse_limit_triggered
    def get_motor_1_reverse_limit_triggered(self):
        return self.motor_1_reverse_limit_triggered

    def set_motor_1_amps_trigger_activated(self, motor_1_amps_trigger_activated):
        self.motor_1_amps_trigger_activated = motor_1_amps_trigger_activated
    def get_motor_1_amps_trigger_activated(self):
        return self.motor_1_amps_trigger_activated

    def set_motor_2_duty_cycle(self, motor_2_duty_cycle):
        self.motor_2_duty_cycle = motor_2_duty_cycle
    def get_motor_2_duty_cycle(self):
        return self.motor_2_duty_cycle

    def set_motor_2_motor_amps(self, motor_2_motor_amps):
        self.motor_2_motor_amps = motor_2_motor_amps
    def get_motor_2_motor_amps(self):
        return self.motor_2_motor_amps

    def set_motor_2_encoder_counter_absolute(self, motor_2_encoder_counter_absolute):
        self.motor_2_encoder_counter_absolute = motor_2_encoder_counter_absolute
    def get_motor_2_encoder_counter_absolute(self):
        return self.motor_2_encoder_counter_absolute

    def set_motor_2_encoder_motor_speed_in_rpm(self, motor_2_encoder_motor_speed_in_rpm):
        self.motor_2_encoder_motor_speed_in_rpm = motor_2_encoder_motor_speed_in_rpm
    def get_motor_2_encoder_motor_speed_in_rpm(self):
        return self.motor_2_encoder_motor_speed_in_rpm

    def set_motor_2_closed_loop_error(self, motor_2_closed_loop_error):
        self.motor_2_closed_loop_error = motor_2_closed_loop_error
    def get_motor_2_closed_loop_error(self):
        return self.motor_2_closed_loop_error

    def set_motor_2_temperature(self, motor_2_temperature):
        self.motor_2_temperature = motor_2_temperature
    def get_motor_2_temperature(self):
        return self.motor_2_temperature

    def set_motor_2_amps_limit_activated(self, motor_2_amps_limit_activated):
        self.motor_2_amps_limit_activated = motor_2_amps_limit_activated
    def get_motor_2_amps_limit_activated(self):
        return self.motor_2_amps_limit_activated

    def set_motor_2_motor_stalled(self, motor_2_motor_stalled):
        self.motor_2_motor_stalled = motor_2_motor_stalled
    def get_motor_2_motor_stalled(self):
        return self.

    def set_motor_2_loop_error_detected(self, motor_2_loop_error_detected):
        self.motor_2_loop_error_detected = motor_2_loop_error_detected
    def get_motor_2_loop_error_detected(self):
        return self.motor_2_loop_error_detected

    def set_motor_2_safety_stop_active(self, motor_2_safety_stop_active):
        self.motor_2_safety_stop_active = motor_2_safety_stop_active
    def get_motor_2_safety_stop_active(self):
        return self.motor_2_safety_stop_active

    def set_motor_2_forward_limit_triggered(self, motor_2_forward_limit_triggered):
        self.motor_2_forward_limit_triggered = motor_2_forward_limit_triggered
    def get_motor_2_forward_limit_triggered(self):
        return self.motor_2_forward_limit_triggered

    def set_motor_2_reverse_limit_triggered(self, motor_2_reverse_limit_triggered):
        self.motor_2_reverse_limit_triggered = motor_2_reverse_limit_triggered
    def get_motor_2_reverse_limit_triggered(self):
        return self.motor_2_reverse_limit_triggered

    def set_motor_2_amps_trigger_activated(self, motor_2_amps_trigger_activated):
        self.motor_2_amps_trigger_activated = motor_2_amps_trigger_activated
    def get_motor_2_amps_trigger_activated(self):
        return self.motor_2_amps_trigger_activated

class Hosts():
    def __init__(self, tb ):
        self.tb = tb
        self.controller = Controller("controller", tb)
        self.rotor0102 = Rotor("rotor0102", tb)
        self.rotor0304 = Rotor("rotor0304", tb)
        self.rotor0506 = Rotor("rotor0506", tb)
        self.rotor0708 = Rotor("rotor0708", tb)
        self.rotor0910 = Rotor("rotor0910", tb)
        self.rotor1112 = Rotor("rotor1112", tb)
        self.rotor1314 = Rotor("rotor1314", tb)
        self.hostnames = {
            'controller':self.controller,
            'rotor0102':self.rotor0102,
            'rotor0304':self.rotor0304,
            'rotor0506':self.rotor0506,
            'rotor0708':self.rotor0708,
            'rotor0910':self.rotor0910,
            'rotor1112':self.rotor1112,
            'rotor1314':self.rotor1314,
        }

        self.dispatch(b"response_computer_details", self.controller.get_computer_details(), "controller", "controller")

    def get_all_host_connected(self):
        for hostname in self.hostnames:
            if hostname != "controller":
                if self.hostnames[hostname].get_connected() == False:
                    return False
        return True

    def request_all_computer_details(self):
        self.tb.publish("request_computer_details",True)

    def get_all_computer_details_received(self):
        absent_list = []
        host_keys  = self.hostnames.keys()
        host_list  = list(host_keys)
        host_list.remove("controller")
        for name in host_list:
            if self.hostnames[name].get_computer_details_received() == False:
                absent_list.append(name)
        print("get_all_computer_details_received.absent_list",absent_list)
        return len(absent_list) == 0

    def get_all_non_nominal_states(self):
        non_nominal_states = []
        computer_details_errors = []
        for hostname in self.hostnames:
            deets = self.hostnames[hostname].get_computer_details()
            if deets["core_temp"] > 75:
                computer_details_errors.append([hostname,"core_temp", deets["core_temp"]])
                non_nominal_states.append([hostname,"computer_details","core_temp", deets["core_temp"]])
            if deets["system_disk"][0] < 500000000:
                computer_details_errors.append([hostname,"system_disk", deets["system_disk"]])
                non_nominal_states.append([hostname,"computer_details","system_disk", deets["system_disk"]])
        # all: check current sensors
        return non_nominal_states

    def dispatch(self, topic, message, origin, destination):
        if isinstance(topic, bytes):
            topic = codecs.decode(topic, 'UTF-8')
        if isinstance(message, bytes):
            message = codecs.decode(message, 'UTF-8')
        if isinstance(origin, bytes):
            origin = codecs.decode(origin, 'UTF-8')
        if isinstance(destination, bytes):
            destination = codecs.decode(destination, 'UTF-8')
        ##### ROUTE MESSAGE TO METHOD #####
        if topic == "connected" or topic == "response_host_connected":
            self.hostnames[origin].set_connected(message)

        if topic == "response_query_details":
            self.hostnames[origin].set_query_details(message)
        if topic == "event_controller_connected":
            self.hostnames[origin].set_controller_connected(message)
        if topic == "response_app_git_timestamp":
            self.hostnames[origin].set_app_git_timestamp(message)
        if topic == "connected":
            self.hostnames[origin].connected(message)
        if topic == "response_core_temp":
            self.hostnames[origin].set_core_temp(message)
        if topic == "response_core_voltage":
            self.hostnames[origin].set_core_voltage(message)
        if topic == "event_exceptions":
            self.hostnames[origin].set_exceptions(message)
        if topic == "response_ip":
            self.hostnames[origin].set_ip(message)
        if topic == "event_last_deadman":
            self.hostnames[origin].set_last_deadman(message)
        if topic == "response_memory_free":
            self.hostnames[origin].set_memory_free(message)
        if topic == "event_messages":
            self.hostnames[origin].set_messages(message)
        if topic == "response_os_version":
            self.hostnames[origin].set_os_version(message)
        if topic == "response_ready":
            self.hostnames[origin].set_ready(message)
        if topic == "response_runtime":
            self.hostnames[origin].set_runtime(message)
        if topic == "event_status":
            self.hostnames[origin].set_status(message)
        if topic == "response_system_cpu":
            self.hostnames[origin].set_system_cpu(message)
        if topic == "response_system_disk":
            self.hostnames[origin].set_system_disk(message)
        if topic == "response_tb_git_timestamp":
            self.hostnames[origin].set_tb_git_timestamp(message)
        if topic == "response_uptime":
            self.hostnames[origin].set_uptime(message)
        if topic == "event_controller_connected":
            self.hostnames[origin].set_controller_connected(message)
        if topic == "event_motor_1_duty_cycle":
            self.hostnames[origin].set_motor_1_duty_cycle(message)
        if topic == "event_motor_1_motor_amps":
            self.hostnames[origin].set_motor_1_motor_amps(message)
        if topic == "event_motor_1_encoder_counter_absolute":
            self.hostnames[origin].set_motor_1_encoder_counter_absolute(message)
        if topic == "event_motor_1_encoder_motor_speed_in_rpm":
            self.hostnames[origin].set_motor_1_encoder_motor_speed_in_rpm(message)
        if topic == "event_motor_1_closed_loop_error":
            self.hostnames[origin].set_motor_1_closed_loop_error(message)
        if topic == "event_motor_1_temperature":
            self.hostnames[origin].set_motor_1_temperature(message)
        if topic == "event_motor_1_amps_limit_activated":
            self.hostnames[origin].set_motor_1_amps_limit_activated(message)
        if topic == "event_motor_1_motor_stalled":
            self.hostnames[origin].set_motor_1_motor_stalled(message)
        if topic == "event_motor_1_loop_error_detected":
            self.hostnames[origin].set_motor_1_loop_error_detected(message)
        if topic == "event_motor_1_safety_stop_active":
            self.hostnames[origin].set_motor_1_safety_stop_active(message)
        if topic == "event_motor_1_forward_limit_triggered":
            self.hostnames[origin].set_motor_1_forward_limit_triggered(message)
        if topic == "event_motor_1_reverse_limit_triggered":
            self.hostnames[origin].set_motor_1_reverse_limit_triggered(message)
        if topic == "event_motor_1_amps_trigger_activated":
            self.hostnames[origin].set_motor_1_amps_trigger_activated(message)
        if topic == "event_motor_2_duty_cycle":
            self.hostnames[origin].set_motor_2_duty_cycle(message)
        if topic == "event_motor_2_motor_amps":
            self.hostnames[origin].set_motor_2_motor_amps(message)
        if topic == "event_motor_2_encoder_counter_absolute":
            self.hostnames[origin].set_motor_2_encoder_counter_absolute(message)
        if topic == "event_motor_2_encoder_motor_speed_in_rpm":
            self.hostnames[origin].set_motor_2_encoder_motor_speed_in_rpm(message)
        if topic == "event_motor_2_closed_loop_error":
            self.hostnames[origin].set_motor_2_closed_loop_error(message)
        if topic == "event_motor_2_temperature":
            self.hostnames[origin].set_motor_2_temperature(message)
        if topic == "event_motor_2_amps_limit_activated":
            self.hostnames[origin].set_motor_2_amps_limit_activated(message)
        if topic == "event_motor_2_motor_stalled":
            self.hostnames[origin].set_motor_2_motor_stalled(message)
        if topic == "event_motor_2_loop_error_detected":
            self.hostnames[origin].set_motor_2_loop_error_detected(message)
        if topic == "event_motor_2_safety_stop_active":
            self.hostnames[origin].set_motor_2_safety_stop_active(message)
        if topic == "event_motor_2_forward_limit_triggered":
            self.hostnames[origin].set_motor_2_forward_limit_triggered(message)
        if topic == "event_motor_2_reverse_limit_triggered":
            self.hostnames[origin].set_motor_2_reverse_limit_triggered(message)
        if topic == "event_motor_2_amps_trigger_activated":
            self.hostnames[origin].set_motor_2_amps_trigger_activated(message)
        if topic == "event_overheat":
            self.hostnames[origin].set_overheat(message)
        if topic == "event_overvoltage":
            self.hostnames[origin].set_overvoltage(message)
        if topic == "event_undervoltage":
            self.hostnames[origin].set_undervoltage(message)
        if topic == "event_short_circuit":
            self.hostnames[origin].set_short_circuit(message)
        if topic == "event_emergency_stop":
            self.hostnames[origin].set_emergency_stop(message)
        if topic == "event_brushless_sensor_fault":
            self.hostnames[origin].set_brushless_sensor_fault(message)
        if topic == "event_MOSFET_failure":
            self.hostnames[origin].set_MOSFET_failure(message)
        if topic == "event_default_configuration_loaded_at_startup":
            self.hostnames[origin].set_default_configuration_loaded_at_startup(message)

