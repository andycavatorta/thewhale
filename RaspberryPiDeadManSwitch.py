import RPi.GPIO as GPIO
import time

GPIO.setmode(GPIO.BCM) 
GPIO.setup(4, GPIO.OUT)
count = 0
while count < 50:
    GPIO.output(4, GPIO.HIGH)
    time.sleep(1)
    GPIO.output(8, GPIO.LOW)
    time.sleep(1)
    #count+=1

