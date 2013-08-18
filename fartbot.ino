//////////////////////////////////////////////////////////////////
//©2013 @alexksso - Fartbot Project
//Released under the MIT License - Please reuse change and share
//////////////////////////////////////////////////////////////////
#include <SoftwareSerial.h>

#define fadePin_L 3
#define fadePin_R 5

String readString, servo1, servo2;
SoftwareSerial mySerial(12, 11); // RX, TX


void setup(){
  //set the controls for motors MOSFET transistors - ensure motors are stopped
  pinMode(fadePin_L, OUTPUT);  
  pinMode(fadePin_R, OUTPUT);
  analogWrite(fadePin_R, 0); // Stop engine right
  analogWrite(fadePin_L, 0); // Stop engine Left
  
  //set the bluetooth communication
  // Open serial communications and wait for port to open:
  Serial.begin(57600);
  while (!Serial) {
    ; // wait for serial port to connect. Needed for Leonardo only
  }
  Serial.println("Goodnight moon!");
  
  mySerial.begin(57600);
  mySerial.println("two-servo-test-1.0");
  mySerial.println("type 15003000 to get the left at 38/255 speed and right at 76/255 speed")
  
}


void loop(){
    while (mySerial.available()) {
    delay(3);  //delay to allow buffer to fill 
    if (mySerial.available() >0) {
      char c = mySerial.read();  //gets one byte from serial buffer
      readString += c; //makes the string readString
    } 
  }

  if (readString.length() >0) {
      mySerial.println(readString); //see what was received
      
      // expect a string like 07002100 containing the two servo positions      
      servo1 = readString.substring(0, 4); //get the first four characters
      servo2 = readString.substring(4, 8); //get the next four characters 
      
      mySerial.println(servo1);  //print to serial monitor to see parsed results
      mySerial.println(servo2);

      int n1 = servo1.toInt();
      int n2 = servo2.toInt();
      int n1_scaled = constrain( (int) n1/39, 0, 255);
      int n2_scaled = constrain( (int) n2/39, 0, 255);
      mySerial.println("the numbers are :");
      mySerial.println(n1_scaled);  //print to serial monitor to see number results
      mySerial.println(n2_scaled);
            
      //myservo1.writeMicroseconds(n1); //set servo position 
      //myservo2.writeMicroseconds(n2);
      //max speed is 9999
      analogWrite(fadePin_R, n2_scaled);
      analogWrite(fadePin_L, n1_scaled);

      
      
    readString="";
  } 
}

void test_loop(){
  int j=0;

  for(int i = 0; i<360; i++){

    //convert 0-360 angle to radian (needed for sin function)
    float rad = DEG_TO_RAD * i;

    //calculate sin of angle as number between 0 and 255
    int sinOut = constrain((sin(rad) * 128) + 128, 0, 255); 

    analogWrite(fadePin_L, sinOut);
    analogWrite(fadePin_R, sinOut);
    delay(15);
  }

}

