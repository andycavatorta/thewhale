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
        "rotor01":"rotors0102",
        "rotor02":"rotors0102",
        "rotor03":"rotors0304",
        "rotor04":"rotors0304",
        "rotor05":"rotors0506",
        "rotor06":"rotors0506",
        "rotor07":"rotors0708",
        "rotor08":"rotors0708",
        "rotor09":"rotors0910",
        "rotor10":"rotors0910",
        "rotor11":"rotors1112",
        "rotor12":"rotors1112",
        "rotor13":"rotors1314",
        "rotor14":"rotors1314",
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
