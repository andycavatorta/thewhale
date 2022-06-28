


# start-up self check
    # check safety features (serial watchdog, PID loop error)
    # check states

# watchdog queries (one at a time?)
    # temperature
    # PID error

# tb double deadman feature
    # if no message from controller, emergency stop
    # send message if watchdog queries successful

# 




app_path = os.path.dirname((os.path.dirname(os.path.dirname(os.path.realpath(__file__)))))
sys.path.append(os.path.split(app_path)[0])

import settings
from thirtybirds3 import thirtybirds
from thirtybirds3.adapters.roboteq_SDC import roboteq_SDC


class Main(threading.Thread):
        def __init__(
                self,
            hostname,
        ):
        self.hostname = hostname
        threading.Thread.__init__(self)
        self.controller = roboteq_SDC.Controller(
            self.data_receiver, 
            self.status_receiver, 
            self.exception_receiver,
            {}, #boards_config
            {}, #motor_1_config 
            {}, #motor_2_config
        )
        config_queries_t =[
            "board":{
                self.controller.board.get_brake_activation_delay
                self.controller.board.get_command_priorities
                self.controller.board.get_firmware_version
                self.controller.board.get_mcu_id
                self.controller.board.get_mixed_mode
                self.controller.board.get_overvoltage_cutoff_threhold
                self.controller.board.get_overvoltage_hysteresis
                self.controller.board.get_pwm_frequency
                self.controller.board.get_rs232_bit_rate
                self.controller.board.get_runtime_fault_flags
                self.controller.board.get_script_auto_start
                self.controller.board.get_serial_data_watchdog
                self.controller.board.get_serial_echo
                self.controller.board.get_short_circuit_detection_threshold
                self.controller.board.get_undervoltage_limit
            
            self.controller.motors[0].get_closed_loop_error_detection
            self.controller.motors[0].get_config_flags
            self.controller.motors[0].get_current_limit
            self.controller.motors[0].get_current_limit_action
            self.controller.motors[0].get_current_limit_amps
            self.controller.motors[0].get_current_limit_min_period
            self.controller.motors[0].get_default_velocity_in_position_mode
            self.controller.motors[0].get_encoder_high_count_limit
            self.controller.motors[0].get_encoder_high_limit_action
            self.controller.motors[0].get_encoder_low_count_limit
            self.controller.motors[0].get_encoder_low_limit_action
            self.controller.motors[0].get_encoder_ppr_value
            self.controller.motors[0].get_encoder_usage
            self.controller.motors[0].get_max_power_forward
            self.controller.motors[0].get_max_power_reverse
            self.controller.motors[0].get_max_rpm
            self.controller.motors[0].get_motor_acceleration_rate
            self.controller.motors[0].get_motor_deceleration_rate
            self.controller.motors[0].get_operating_mode
            self.controller.motors[0].get_pid_differential_gain
            self.controller.motors[0].get_pid_integral_cap
            self.controller.motors[0].get_pid_integral_gain
            self.controller.motors[0].get_pid_proportional_gain
            self.controller.motors[0].get_sensor_type_select
            self.controller.motors[0].get_stall_detection
            
            self.controller.motors[1].get_closed_loop_error_detection
            self.controller.motors[1].get_config_flags
            self.controller.motors[1].get_current_limit
            self.controller.motors[1].get_current_limit_action
            self.controller.motors[1].get_current_limit_amps
            self.controller.motors[1].get_current_limit_min_period
            self.controller.motors[1].get_default_velocity_in_position_mode
            self.controller.motors[1].get_encoder_high_count_limit
            self.controller.motors[1].get_encoder_high_limit_action
            self.controller.motors[1].get_encoder_low_count_limit
            self.controller.motors[1].get_encoder_low_limit_action
            self.controller.motors[1].get_encoder_ppr_value
            self.controller.motors[1].get_encoder_usage
            self.controller.motors[1].get_max_power_forward
            self.controller.motors[1].get_max_power_reverse
            self.controller.motors[1].get_max_rpm
            self.controller.motors[1].get_motor_acceleration_rate
            self.controller.motors[1].get_motor_deceleration_rate
            self.controller.motors[1].get_operating_mode
            self.controller.motors[1].get_pid_differential_gain
            self.controller.motors[1].get_pid_integral_cap
            self.controller.motors[1].get_pid_integral_gain
            self.controller.motors[1].get_pid_proportional_gain
            self.controller.motors[1].get_sensor_type_select
            self.controller.motors[1].get_stall_detection

            
        ]
        runtime_queries_t =[
            self.controller.board.get_volts

            self.controller.motors[0].get_closed_loop_error
            self.controller.motors[0].get_encoder_counter_absolute
            self.controller.motors[0].get_encoder_counter_relative
            self.controller.motors[0].get_encoder_motor_speed_in_rpm
            self.controller.motors[0].get_encoder_speed_relative
            self.controller.motors[0].get_expected_motor_position
            self.controller.motors[0].get_feedback
            self.controller.motors[0].get_motor_amps
            self.controller.motors[0].get_motor_power_output_applied
            self.controller.motors[0].get_runtime_status_flags
            self.controller.motors[0].get_temperature

            self.controller.motors[1].get_closed_loop_error
            self.controller.motors[1].get_encoder_counter_absolute
            self.controller.motors[1].get_encoder_counter_relative
            self.controller.motors[1].get_encoder_motor_speed_in_rpm
            self.controller.motors[1].get_encoder_speed_relative
            self.controller.motors[1].get_expected_motor_position
            self.controller.motors[1].get_feedback
            self.controller.motors[1].get_motor_amps
            self.controller.motors[1].get_motor_power_output_applied
            self.controller.motors[1].get_runtime_status_flags
            self.controller.motors[1].get_temperature

            
        ]
        self.start()

    def start_up_self_test(self):
        """
        ?FID None Read Firmware ID
        ?FIN None Read Firmware ID (numerical)
        ?A Channel Read Motor Amps
        ?E Channel Read Closed Loop Error
        ?F Channel Read Feedback
        ?FM Channel Read Runtime Status Flag
        ?FS None Read Status Flags
        ?P Channel Read Motor Power Output Applied
        ?SR Channel Read Encoder Speed Relative
        """

        # check safety features (serial watchdog, PID loop error)
        # check states


    def runtime_self_test(self):
        """
        ?A Channel Read Motor Amps
        ?E Channel Read Closed Loop Error
        ?F Channel Read Feedback
        ?FM Channel Read Runtime Status Flag
        ?FS None Read Status Flags
        ?P Channel Read Motor Power Output Applied
        ?SR Channel Read Encoder Speed Relative
        """








