// Deadman's Switch Square Wave IN -> DC 5v OUT

const int squareIN = 9;
const int dcOUT = 10;
bool clockStatePrevious;
bool clockStateCurrent;
bool onTrigger = false;   //starts false, switches and stays true at 1st switching event
int timeoutCounter = 0;

void setup() 
{
  // put your setup code here, to run once:
  pinMode (squareIN, INPUT);
  pinMode (dcOUT, OUTPUT);

}
void loop() 
{
  // put your main code here, to run repeatedly:

  clockStateCurrent = digitalRead(squareIN);  // Read the current state
  if ((clockStateCurrent == clockStatePrevious) && (onTrigger == true))  // If it is the same as the previous read, increment the timeout counter
  {
    timeoutCounter++;
  }
  else if (clockStateCurrent != clockStatePrevious) // If it is different, reset the timeout counter
  {
    onTrigger = true;
    timeoutCounter = 0;
  }
  if (timeoutCounter >= 1000)
  {
    digitalWrite(dcOUT, LOW);
  }
  else if ((timeoutCounter < 1000) && (onTrigger == true))
  {
    digitalWrite(dcOUT,HIGH);
  }
  clockStatePrevious = clockStateCurrent; // save the current state for comparison next loop
  delay(1);    //sampling period of ~1ms
}
