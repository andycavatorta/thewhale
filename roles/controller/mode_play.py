"""

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
import codecs
import os
import queue
import random
import settings
import threading
import time
import traceback

class Mode_Play(threading.Thread):
    """
    This class watches for incoming messages
    Its only action will be to change the current mode
    """
    def __init__(self, tb, hosts, set_current_mode, choreography):
        threading.Thread.__init__(self)
        self.active = False
        self.tb = tb 
        self.hosts = hosts
        self.choreography = choreography
        self.mode_names = settings.Game_Modes
        self.set_current_mode = set_current_mode
        self.queue = queue.Queue()
        self.behavior_mode_names = settings.Behavior_Modes
        self.start()

    def begin(self):
        self.active = True
        #time.sleep(3)
        #self.set_current_mode(self.behavior_mode_names.MONEY_MODE)
        
    def end(self):
        self.active = False

    def add_to_queue(self, topic, message, origin, destination):
        self.queue.put((topic, message, origin, destination))

    def run(self):
        while True:
            try:
                topic, message, origin, destination = self.queue.get(True)
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
            except AttributeError:
                pass


class Midi_to_Rotor(threading.Thread):
    """
    This class receives midi on/off/pitch_bend events and looks up the best rotor to play the pitch.
    It must store states of each rotor and possible pitches for each
    It must have mappings for speeds and pitches
    to do: are threads necessary?
    only one rotor at a time plays a pitch
        note_off events stop the only rotor playing this pitch
        pitch_bend events bend the only rotor playing this pitch
    """
    def __init__(self, filename, midi_receiver):
        threading.Thread.__init__(self)
        self.queue = queue.Queue()
        self.rotor_occupied = [
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
        ]
        self.pitch_to_rotor_speed = {
            "33":[
                {"rotor":1, "speed":[0,0,0], "harmonic"=1}, #harmonic 1
            ],
            "34":[
                {"rotor":2, "speed":[0,0,0], "harmonic"=1}, #harmonic 1
            ],
            "35":[
                {"rotor":3, "speed":[0,0,0], "harmonic"=1}, #harmonic 1
            ],
            "36":[
                {"rotor":4, "speed":[0,0,0], "harmonic"=1}, #harmonic 1
            ],
            "37":[
                {"rotor":5, "speed":[0,0,0], "harmonic"=1}, #harmonic 1
            ],
            "38":[
                {"rotor":6, "speed":[0,0,0], "harmonic"=1}, #harmonic 1
            ],
            "39":[
                {"rotor":7, "speed":[0,0,0], "harmonic"=1}, #harmonic 1
            ],
            "40":[
                {"rotor":8, "speed":[0,0,0], "harmonic"=1}, #harmonic 1
            ],
            "41":[
                {"rotor":9, "speed":[0,0,0], "harmonic"=1}, #harmonic 1
            ],
            "42":[
                {"rotor":10, "speed":[0,0,0], "harmonic"=1}, #harmonic 1
            ],
            "43":[
                {"rotor":11, "speed":[0,0,0], "harmonic"=1}, #harmonic 1
            ],
            "44":[
                {"rotor":12, "speed":[0,0,0], "harmonic"=1}, #harmonic 1
            ],
            "45":[
                {"rotor":13, "speed":[0,0,0], "harmonic"=1}, #harmonic
                {"rotor":1, "speed":[0,0,0], "harmonic"=2}, #harmonic 2
            ],
            "46":[
                {"rotor":14, "speed":[0,0,0], "harmonic"=1}, #harmonic 
                {"rotor":2, "speed":[0,0,0], "harmonic"=2}, #harmonic 2
            ],
            "47":[
                {"rotor":3, "speed":[0,0,0], "harmonic"=2}, #harmonic 2
            ],
            "49":[
                {"rotor":4, "speed":[0,0,0], "harmonic"=2}, #harmonic 2
            ],
            "53":[
                {"rotor":5, "speed":[0,0,0], "harmonic"=2}, #harmonic 2
            ],
            "55":[
                {"rotor":6, "speed":[0,0,0], "harmonic"=2}, #harmonic 2
            ],
            "56":[
                {"rotor":7, "speed":[0,0,0], "harmonic"=2}, #harmonic 2
                {"rotor":1, "speed":[0,0,0], "harmonic"=3}, #harmonic 3
            ],
            "57":[
                {"rotor":8, "speed":[0,0,0], "harmonic"=2}, #harmonic 2
                {"rotor":2, "speed":[0,0,0], "harmonic"=3}, #harmonic 3
            ],
            "58":[
                {"rotor":9, "speed":[0,0,0], "harmonic"=2}, #harmonic 2
                {"rotor":3, "speed":[0,0,0], "harmonic"=3}, #harmonic 3
            ],
            "59":[
                {"rotor":10, "speed":[0,0,0], "harmonic"=2}, #harmonic 2
                {"rotor":4, "speed":[0,0,0], "harmonic"=3}, #harmonic 3
            ],
            "60":[
                {"rotor":11, "speed":[0,0,0], "harmonic"=2}, #harmonic 2
                {"rotor":5, "speed":[0,0,0], "harmonic"=3}, #harmonic 3
            ],
            "61":[
                {"rotor":12, "speed":[0,0,0], "harmonic"=2}, #harmonic 2
                {"rotor":6, "speed":[0,0,0], "harmonic"=3}, #harmonic 3
            ],
            "62":[
                {"rotor":13, "speed":[0,0,0], "harmonic"=2}, #harmonic 2
                {"rotor":7, "speed":[0,0,0], "harmonic"=3}, #harmonic 3
                {"rotor":1, "speed":[0,0,0], "harmonic"=4}, #harmonic 4
            ],
            "63":[
                {"rotor":14, "speed":[0,0,0], "harmonic"=2}, #harmonic 2
                {"rotor":8, "speed":[0,0,0], "harmonic"=3}, #harmonic 3
                {"rotor":2, "speed":[0,0,0], "harmonic"=4}, #harmonic 4
            ],
            "64":[
                {"rotor":9, "speed":[0,0,0], "harmonic"=3}, #harmonic 3
                {"rotor":3, "speed":[0,0,0], "harmonic"=4}, #harmonic 4
            ],
            "65":[
                {"rotor":10, "speed":[0,0,0], "harmonic"=3}, #harmonic 3
                {"rotor":4, "speed":[0,0,0], "harmonic"=4}, #harmonic 4
                {"rotor":1, "speed":[0,0,0], "harmonic"=5}, #harmonic 5
            ],
            "67":[
                {"rotor":11, "speed":[0,0,0], "harmonic"=3}, #harmonic 3
                {"rotor":4, "speed":[0,0,0], "harmonic"=4}, #harmonic 4
                {"rotor":2, "speed":[0,0,0], "harmonic"=5}, #harmonic 5
            ],
            "68":[
                {"rotor":12, "speed":[0,0,0], "harmonic"=3}, #harmonic 3
                {"rotor":5, "speed":[0,0,0], "harmonic"=4}, #harmonic 4
                {"rotor":3, "speed":[0,0,0], "harmonic"=5}, #harmonic 5
            ],
            "69":[
                {"rotor":13, "speed":[0,0,0], "harmonic"=3}, #harmonic 3
                {"rotor":6, "speed":[0,0,0], "harmonic"=4}, #harmonic 4
                {"rotor":3, "speed":[0,0,0], "harmonic"=5}, #harmonic 5
            ],
            "70":[
                {"rotor":14, "speed":[0,0,0], "harmonic"=3}, #harmonic 3
                {"rotor":7, "speed":[0,0,0], "harmonic"=4}, #harmonic 4
                {"rotor":4, "speed":[0,0,0], "harmonic"=5}, #harmonic 5
            ],
            "71":[
                {"rotor":8, "speed":[0,0,0], "harmonic"=4}, #harmonic 4
                {"rotor":5, "speed":[0,0,0], "harmonic"=5}, #harmonic 5
            ],
            "72":[
                {"rotor":9, "speed":[0,0,0], "harmonic"=4}, #harmonic 4
                {"rotor":6, "speed":[0,0,0], "harmonic"=5}, #harmonic 5
            ],
            "73":[
                {"rotor":10, "speed":[0,0,0], "harmonic"=4}, #harmonic 4
                {"rotor":7, "speed":[0,0,0], "harmonic"=5}, #harmonic 5
            ],
            "74":[
                {"rotor":11, "speed":[0,0,0], "harmonic"=4}, #harmonic 4
                {"rotor":8, "speed":[0,0,0], "harmonic"=5}, #harmonic 5
            ],
            "75":[
                {"rotor":12, "speed":[0,0,0], "harmonic"=4}, #harmonic 4
                {"rotor":9, "speed":[0,0,0], "harmonic"=5}, #harmonic 5
            ],
            "76":[
                {"rotor":13, "speed":[0,0,0], "harmonic"=4}, #harmonic 4
                {"rotor":10, "speed":[0,0,0], "harmonic"=5}, #harmonic 5
            ],
            "77":[
                {"rotor":14, "speed":[0,0,0], "harmonic"=4}, #harmonic 4
                {"rotor":11, "speed":[0,0,0], "harmonic"=5}, #harmonic 5
            ],
            "78":[
                {"rotor":12, "speed":[0,0,0], "harmonic"=5}, #harmonic 5
            ],
            "79":[
                {"rotor":13, "speed":[0,0,0], "harmonic"=5}, #harmonic 5
            ],
            "80":[
                {"rotor":14, "speed":[0,0,0], "harmonic"=5}, #harmonic 5
            ],
        }

    def add_to_queue(self, event, midi_pitch, midi_pitch_bend=0):
        """
        midi_pitch_bend is in range from -63 to 63
        """
        self.queue.put((event, midi_pitch, midi_pitch_bend))

    def run(self):
        while True:
            try:
                event, midi_pitch, midi_pitch_bend = self.queue.get(True)
                if event == "note_on":
                    rotor_options = self.self.pitch_to_rotor_speed(chr(midi_pitch))
                    # is this being played already?
                    # is there only one option?
                    # what is the lowest harmonic option
                    # set rotor to midi_pitch                   
                if event == "note_off":
                    speed_range = self.self.pitch_to_rotor_speed(chr(midi_pitch))
                    # find the rotor with this pitch and send quiet message
                    # set rotor to ""                    
                if event == "pitch_bend":
                    # find the rotor with this pitch and send updated speed
                    
            except AttributeError:
                pass

class Midi_File_Spooler(threading.Thread):
    """
    The spooler receives a filename and commands to start, stop, rewind, or set_speed (1.0==normal)
    and it sends individual events to a midi_receiver method

    """
    def __init__(self, filename, midi_receiver):
        threading.Thread.__init__(self)
        self.midi_receiver = midi_receiver
        self.queue = Queue.Queue()
        self.start()

    def open_file(self, filename):
        pass

    def run(self):
        while True:
            try:
                topic, message = self.queue.get(True)

            except Exception as e:
                exc_type, exc_value, exc_traceback = sys.exc_info()
                print(e, repr(traceback.format_exception(exc_type, exc_value,exc_traceback)))


class Midi_Source_Keyboard(threading.Thread):
    """
    The spooler receives a filename and commands to start, stop, rewind, or set_speed (1.0==normal)
    and it sends individual events to a midi_receiver method

    """
    def __init__(self, midi_receiver):
        threading.Thread.__init__(self)
        self.midi_receiver = midi_receiver
        self.queue = Queue.Queue()
        self.path = "/dev/midi1"
        self.connected = False
        self.start()
 
    def open_device(self):
        # to do: check device is open. report error
        self.device = open(self.path)

    def parse_midi(self, midi_str):
        stat_int = ord(midi_str[0])
        note_int = ord(midi_str[1])
        velocity_int = ord(midi_str[2])
        statBin_str = self.dec2bin(int(stat_int), 8)
        command_int = int(statBin_str[0:4], 2)
        channel_int = int(statBin_str[4:8], 2)
        return [command_int, channel_int, note_int, velocity_int]
        
    def dec2bin(self, n, fill):
        bStr = ''
        while n > 0:
            bStr = str(n % 2) + bStr
            n = n >> 1
        return bStr.zfill(fill)

    def run(self):
        last_time = time.time()
        bytes_from_device_l = []
        while True:
            try:
                midi_chr = self.device.read(1)
                if time.time() - last_time <= 0.01:
                    bytes_from_device_l.append(midi_chr)
                    if len(bytes_from_device_l)>=3:
                        midi_str = "".join(bytes_from_device_l)
                        midi_l = self.parse_midi(midi_str)
                        self.midi_receiver(midi_l)
                        bytes_from_device_l = []
                else:
                    bytes_from_device_l = [midi_chr]
                last_time = time.time()
            except Exception as e:
                exc_type, exc_value, exc_traceback = sys.exc_info()
                print(e, repr(traceback.format_exception(exc_type, exc_value,exc_traceback)))



