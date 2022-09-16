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

class Hosts():
    rotors={
        "rotors0102":["rotor01","rotor02"],
        "rotors0304":["rotor03","rotor04"],
        "rotors0506":["rotor05","rotor06"],
        "rotors0708":["rotor07","rotor08"],
        "rotors0910":["rotor09","rotor10"],
        "rotors1112":["rotor11","rotor12"],
        "rotors1314":["rotor13","rotor14"],
    }


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
    idle_speeds_low={
        "rotor01":60,
        "rotor02":55,
        "rotor03":50,
        "rotor04":45,
        "rotor05":50, 
        "rotor06":55,
        "rotor07":60, 
        "rotor08":65, 
        "rotor09":70,
        "rotor10":75,
        "rotor11":80,
        "rotor12":85,
        "rotor13":90,
        "rotor14":95,
    }

    idle_speeds_high={
        "rotor01":160,
        "rotor02":180,
        "rotor03":100,
        "rotor04":90,
        "rotor05":0, #150, need to fix chain
        "rotor06":160,
        "rotor07":0, # wrong
        "rotor08":0, # wrong
        "rotor09":180,
        "rotor10":200,
        "rotor11":200,
        "rotor12":160,
        "rotor13":170,
        "rotor14":220,
    }

class Pitch_To_Rotor_Map():
    pitch={
        "C3":["rotor","rotor"], #4(1)
        "C#3":["rotor","rotor"], #5(1)
        "D3":["rotor","rotor"], #3(1)
        "D#3":["rotor","rotor"], #6(1) 
        "E3":["rotor","rotor"], #7(1)
        "F3":["rotor","rotor"], #2(1)
        "F#3":["rotor","rotor"], #8(1)
        "G3":["rotor","rotor"], #9(1)
        "G#3":["rotor","rotor"], #10(1)
        "A3":["rotor","rotor"], #11(1)
        "A#3":["rotor","rotor"], #12(1) 
        "B3":["rotor","rotor"], #1(1)
        "C4":["rotor","rotor"], #4(2)
        "C#4":["rotor","rotor"], #5(2)
        "D4":["rotor","rotor"], #3(2)
        "D#4":["rotor","rotor"], #6(2)
        "E4":["rotor","rotor"], #7(2)
        "F4":["rotor","rotor"], #2(2)
        "F#4":["rotor","rotor"], #8(2) 
        "G4":["rotor","rotor"], #9(2)
        "G#4":["rotor","rotor"], #10(2)
        "A4":["rotor","rotor"], #11(2)
        "A#4":["rotor","rotor"], #12(2) 
        "B4":["rotor","rotor"], #1(1)
        "C5":["rotor","rotor"], #13(2)
        "C#5":["rotor","rotor"], #14(1)
    }
    midi=[
        ["rotor04",50], #38, D3
        ["rotor05",65], #39 D#3
        ["rotor03",100], #40 E3
        ["rotor06",105], #41
        ["rotor07",150], #42
        ["rotor01",140], #43
        ["rotor08",130], #44
        ["rotor09",140], #45
        ["rotor10",165], #46
        [], #47
        ["rotor11",135], #48
        ["rotor12",140], #49
        ["rotor0",], #          50
        ["rotor0",], #51
        ["rotor0",], #52
        ["rotor0",], #53
        ["rotor0",], #54
        ["rotor0",], #55
        ["rotor0",], #56
        ["rotor0",], #57
        ["rotor0",], #58
        ["rotor0",], #59
        ["rotor0",], #60
        ["rotor0",], #61
        ["rotor0",], #62
        ["rotor0",], #63
    ]


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
