"""
This file contains the default config data for the reports system

On start-up thirtybirds loads config data.  It loads default configs from config/ unless otherwise specified.  New config data can be loaded dynamically at runtime.

Typical usage example:

from config import reports

foo = ClassFoo(reports.foo_config)

"""

class Deadman():
    DURATION = 0.1
    GPIO = 8

class Roles():
    hosts={
        "controller":"controller",
        "rotors0102":"rotor",
        "rotors0304":"rotor",
        "rotors0506":"rotor",
        "rotors0708":"rotor",
        "rotors0910":"rotor",
        "rotors1112":"rotor",
        "rotors1314":"rotor",
    }

class Rotors():
    hosts={
        "rotor01":["rotors0102",1],
        "rotor02":["rotors0102",2],
        "rotor03":["rotors0304",1],
        "rotor04":["rotors0304",2],
        "rotor05":["rotors0506",1],
        "rotor06":["rotors0506",2],
        "rotor07":["rotors0708",1],
        "rotor08":["rotors0708",2],
        "rotor09":["rotors0910",1],
        "rotor10":["rotors0910",2],
        "rotor11":["rotors1112",1],
        "rotor12":["rotors1112",2],
        "rotor13":["rotors1314",1],
        "rotor14":["rotors1314",2],
    }

class Pitch_To_Rotor_Map():
    pitch={
        "C3":["rotor","rotor"],
        "C#3":["rotor","rotor"],
        "D3":["rotor","rotor"],
        "D#3":["rotor","rotor"],
        "E3":["rotor","rotor"],
        "F3":["rotor","rotor"],
        "F#3":["rotor","rotor"],
        "G3":["rotor","rotor"],
        "G#3":["rotor","rotor"],
        "A3":["rotor","rotor"],
        "A#3":["rotor","rotor"],
        "B3":["rotor","rotor"],
        "C4":["rotor","rotor"],
        "C#4":["rotor","rotor"],
        "D4":["rotor","rotor"],
        "D#4":["rotor","rotor"],
        "E4":["rotor","rotor"],
        "F4":["rotor","rotor"],
        "F#4":["rotor","rotor"],
        "G4":["rotor","rotor"],
        "G#4":["rotor","rotor"],
        "A4":["rotor","rotor"],
        "A#4":["rotor","rotor"],
        "B4":["rotor","rotor"],
        "C5":["rotor","rotor"],
        "C#5":["rotor","rotor"],
        "D5":["rotor","rotor"],
        "D#5":["rotor","rotor"],
        "E5":["rotor","rotor"],
        "F5":["rotor","rotor"],
        "F#5":["rotor","rotor"],
        "G5":["rotor","rotor"],
        "G#5":["rotor","rotor"],
        "A5":["rotor","rotor"],
        "A#5":["rotor","rotor"],
        "B5":["rotor","rotor"],
        "C6":["rotor","rotor"],
        "D6":["rotor","rotor"],
    }

class Reporting():
    app_name = "thewhale"
    #level = "ERROR" #[DEBUG | INFO | WARNING | ERROR | CRITICAL]
    #log_to_file = True
    #print_to_stdout = True
    publish_to_dash = True
    
    class Status_Types:
        EXCEPTIONS = True
        INITIALIZATIONS = True
        NETWORK_CONNECTIONS = True
        NETWORK_MESSAGES = True
        SYSTEM_STATUS = True
        VERSION_STATUS = True
        ADAPTER_STATUS = True

class Version_Control():
    update_on_start = False
    github_repo_owner = "andycavatorta"
    github_repo_name = "thewhale"
    branch = "master"

class Behavior_Modes:
    ERROR = "error"
    WAITING_FOR_CONNECTIONS = "waiting_for_connections"
    SYSTEM_TESTS = "system_tests"
    PLAY = "play"
