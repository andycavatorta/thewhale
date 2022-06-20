import RPi.GPIO as GPIO
# from time import sleep
import time

# GPIO.setmode(GPIO.BOARD) 
# GPIO.setup(8, GPIO.OUT, initial=GPIO.LOW)
# count = 0
# while count < 50:
#    GPIO.output(8, GPIO.HIGH)
#    sleep(0.1)
#    GPIO.output(8, GPIO.LOW)
#    sleep(0.1)
#    count+=1

GPIO.setmode(GPIO.BCM)
GPIO.setup(4,GPIO.OUT)
GPIO.output(4, True)
time.sleep(1)
GPIO.output(4,False)