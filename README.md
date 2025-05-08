# reaction-beats
Reaction Beats
CSC 2463 – Programming Digital Media
Platform: p5.js + Tone.js + Arduino (Elegoo Uno)

Project Outline
Reaction Beats is a rhythm-based game where players use physical buttons connected to an Arduino to match the falling shapes on screen. The game challenges players to stay in rhythm by pressing the right button (red, green, or blue) as each circle reaches the strike zone. It integrates interactive visuals using p5.js; audio through tone.js; and physical inputs and outputs using the Arduino and Elegoo.

Narrative Description
Reaction Beats merges web-based graphics and sound with physical interactions. When the game starts, circles will fall randomly in the colors red, blue, or green. Players must press the corresponding button in sync with each falling beat:
•	Red LED → Button 0 on Pin 8
•	Blue LED → Button 1 on Pin 6
•	Green LED → Button 2 on Pin 4
Matching the button with the color will:
•	Plays a synthesized sound using Tone.js
•	Triggers a particle effect 
•	Lights up an LED 
•	Increasing the score
The game is over when the timer runs out. Reaction Beats includes a start screen, play state, and game-over screen.



Video 
https://youtu.be/_ujmzejQ2og

Schematics & Diagrams
Arduino Pin Layout:
•	Button 0 -> Pin 8
•	Button 1 -> Pin 6
•	Button 2 -> Pin 4
•	Red LED -> Pin 13
•	Blue LED -> Pin 11
•	Green LED -> Pin 9

Future Development Ideas
•	Add more and faster beats(tempo)
•	Add multiplayer by having two sides of buttons
•	Add more different sounds
•	Introduce streaks,combos,etc.


