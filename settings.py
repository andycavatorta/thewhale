"""
This file contains the default config data for the reports system

On start-up thirtybirds loads config data.  It loads default configs from config/ unless otherwise specified.  New config data can be loaded dynamically at runtime.

Typical usage example:

from config import reports

foo = ClassFoo(reports.foo_config)

"""

class Deadman():
    DURATION = 0.1
    GPIO = 4

class Roles():
    hosts={
        "controller":"controller",
        "rotor0102":"rotor",
        "rotor0304":"rotor",
        "rotor0506":"rotor",
        "rotor0708":"rotor",
        "rotor0910":"rotor",
        "rotor1112":"rotor",
        "rotor1314":"rotor",
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
