"""
All displays off
All carousel LEDs off
All playfield LEDs off

turn on all $ in carousels



"""

import codecs
import os
import queue
import settings
import threading
import time

class Mode_System_Tests(threading.Thread):
    """
    These mode modules are classes to help keep the namespace organizes
    These mode modules are threaded because some of them will have time-based tasks.
    """
    PHASE_COMPUTER_DETAILS = "phase_computer_details"
    PHASE_DEVICE_PRESENCE = "phase_device_presence"
    PHASE_DEVICE_STATES = "phase_device_states"
    PHASE_CHECK_CURRENT_LEAK = "phase_check_current_leak"
    PHASE_VISUAL_TESTS = "phase_visual_tests"
    def __init__(self, tb, hosts, set_current_mode):
        threading.Thread.__init__(self)
        self.active = False
        self.tb = tb
        self.hosts = hosts
        self.set_mode = set_current_mode
        self.queue = queue.Queue()
        self.phase = self.PHASE_COMPUTER_DETAILS
        self.behavior_mode_names = settings.Behavior_Modes
        self.timer = time.time()
        self.timeout_duration = 20 #seconds
        self.start()


    def begin(self):
        self.active = True
        self.timer = time.time()
        self.phase = self.PHASE_COMPUTER_DETAILS
        time.sleep(10)
        self.hosts.request_all_computer_details()


    def end(self):
        self.active = False


    def reset(self):
        self.timer = time.time()
        self.phase = self.PHASE_COMPUTER_DETAILS
        self.hosts.request_all_computer_details()
        print("")
        print("===========PHASE_COMPUTER_DETAILS============")
        print("")


    def response_host_connected(self, message, origin, destination):
        # inappropriate response
        # if message is False, change mode back to Wait_For_Connections
        if message == False:
            self.set_mode(self.behavior_mode_names.WAITING_FOR_CONNECTIONS)


    def response_computer_details(self, message, origin, destination):
        if self.phase == self.PHASE_COMPUTER_DETAILS:
            if self.hosts.get_all_computer_details_received() == True:
                self.phase = self.PHASE_DEVICE_STATES
                # when all computers details have responded
                self._check_all_device_states_()


    # device states
    def _check_all_device_states_(self):
        if self.phase == self.PHASE_DEVICE_STATES:
            if len(self.hosts.get_all_non_nominal_states()) == 0:
                self.set_mode(self.behavior_mode_names.PLAY)
            else:
                print("")
                print("non-nominal states reported")
                print(self.hosts.get_all_non_nominal_states())
                print("")
                self.set_mode(self.behavior_mode_names.ERROR)


    def response_visual_tests(self, message, origin, destination):
        # No need to pass params.  Hosts handles this.
        # This is just responding to the events
        self.set_mode(self.behavior_mode_names.PLAY)


    def add_to_queue(self, topic, message, origin, destination):
        self.queue.put((topic, message, origin, destination))


    def run(self):
        while True:
            if self.active:
                try:
                    topic, message, origin, destination = self.queue.get(True,1)
                    if isinstance(topic, bytes):
                        topic = codecs.decode(topic, 'UTF-8')
                    if isinstance(message, bytes):
                        message = codecs.decode(message, 'UTF-8')
                    if isinstance(origin, bytes):
                        origin = codecs.decode(origin, 'UTF-8')
                    if isinstance(destination, bytes):
                        destination = codecs.decode(destination, 'UTF-8')
                    getattr(self,topic)(
                            message, 
                            origin, 
                            destination,
                        )
                    
                except queue.Empty:
                    pass

                except AttributeError:
                    pass
            else:
                time.sleep(1)
