"""
"""

import codecs
import os
import queue
import settings
import threading
import time

class Mode_Waiting_For_Connections(threading.Thread):
    """
    These mode modules are classes to help keep the namespace organizes
    These mode modules are threaded because some of them will have time-based tasks.

    inventory carousels
    evacuate center carousel to edge carousels
    evacuate edge carousels into dinero tube
    evacuate fruits carousels into dinero tube via carousel

    """
    def __init__(self, tb, hosts, set_current_mode):
        threading.Thread.__init__(self)
        self.active = False
        self.tb = tb 
        self.hosts = hosts
        self.set_current_mode = set_current_mode
        self.queue = queue.Queue()
        self.behavior_mode_names = settings.Behavior_Modes
        self.timer = time.time()
        self.timeout_duration = 120 #seconds
        self.all_hostnames = settings.Roles.hosts.keys()
        self.connected_hostnames = ["controller"]
        self.start()

    def begin(self):
        self.connected_hostnames = ["controller"]
        self.timer = time.time()
        self.active = True

    def end(self):
        self.active = False

    def respond_host_connected(self, message, origin, destination): 
        self.connected_hostnames.append(origin)
        if self.hosts.get_all_host_connected() == True:
            self.set_current_mode(self.behavior_mode_names.SYSTEM_TESTS)
    
    def add_to_queue(self, topic, message, origin, destination):
        self.queue.put((topic, message, origin, destination))

    def run(self):
        while True:
            if self.active:
                try:
                    topic, message, origin, destination = self.queue.get(True,5)
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
                    if self.timer + self.timeout_duration < time.time(): # if timeout condition
                        self.set_current_mode(self.behavior_mode_names.ERROR)

                except AttributeError:
                    pass
            else:
                time.sleep(1)
