import RPi.GPIO as GPIO
from time import sleep

# Dead Man's Switch component for Pi Controller. Continuously outputs a square wave at 10 Hz 
# Teensy reads this and turns on PSU with 5v DC 
# System power is cut if the signal from the Pi is lost

GPIO.setmode(GPIO.BOARD) 
GPIO.setup(8, GPIO.OUT, initial=GPIO.LOW)

# Infinite 10 Hz Square Wave
while True:               
    GPIO.output(8, GPIO.HIGH)
    sleep(0.1)      # pause time in seconds
    GPIO.output(8, GPIO.LOW)
    sleep(0.1)


