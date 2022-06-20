import RPi.GPIO as GPIO
from time import sleep

GPIO.setmode(GPIO.BOARD) 
GPIO.setup(8, GPIO.OUT, initial=GPIO.LOW)
count = 0
while count < 50:
    GPIO.output(8, GPIO.HIGH)
    sleep(0.1)
    GPIO.output(8, GPIO.LOW)
    sleep(0.1)
    count+=1

