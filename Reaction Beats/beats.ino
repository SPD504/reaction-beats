const int buttonPins[3] = {8, 6, 4};        // Button input pins
const int ledPins[3]    = {13, 11, 9};     // LED output pins (red, blue, green)
int prevStates[3]       = {HIGH, HIGH, HIGH};  // Debounce tracking

void setup() {
  Serial.begin(9600);

  // Set up buttons
  for (int i = 0; i < 3; i++) {
    pinMode(buttonPins[i], INPUT_PULLUP);
  }

  // Set up LEDs
  for (int i = 0; i < 3; i++) {
    pinMode(ledPins[i], OUTPUT);
    digitalWrite(ledPins[i], LOW);  
  }
}

void loop() {
  for (int i = 0; i < 3; i++) {
    int reading = digitalRead(buttonPins[i]);

    if (prevStates[i] == HIGH && reading == LOW) {
      Serial.print("BTN:");
      Serial.println(i);  // e.g., BTN:0

      // Turn on corresponding LED
      digitalWrite(ledPins[i], HIGH);

      delay(150);  

  
      digitalWrite(ledPins[i], LOW);
    }

    prevStates[i] = reading;
  }
}


