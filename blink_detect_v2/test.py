import cv2

# Load the pre-trained Haar cascade classifiers for left and right eyes
left_eye_cascade = cv2.CascadeClassifier('haarcascade_lefteye_2splits.xml')
right_eye_cascade = cv2.CascadeClassifier('haarcascade_righteye_2splits.xml')

# Initialize video capture
cap = cv2.VideoCapture(0)

# Variables to keep track of blink count and previous blink state
blink_count = 0
prev_blink_state = False

while True:
    # Capture frame-by-frame
    ret, frame = cap.read()
    
    # Convert the frame to grayscale for cascade detection
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    
    # Detect eyes in the grayscale frame
    left_eyes = left_eye_cascade.detectMultiScale(gray, scaleFactor=3)
    right_eyes = right_eye_cascade.detectMultiScale(gray, scaleFactor=3)
    
    # Draw rectangles around the detected eyes
    for (x, y, w, h) in left_eyes:
        cv2.rectangle(frame, (x, y), (x+w, y+h), (255, 0, 0), 2)
    for (x, y, w, h) in right_eyes:
        cv2.rectangle(frame, (x, y), (x+w, y+h), (0, 255, 0), 2)
    
    # Check if both left and right eyes are detected
    if len(left_eyes) > 0 or len(right_eyes) > 0:
        # Eyes are open
        current_blink_state = False
    else:
        # Eyes are closed
        cv2.putText(frame, "BLINK", (100, 100), cv2.FONT_HERSHEY_PLAIN, 3, (255, 255, 0), 5)
    
    # Display the frame with eye detection
    cv2.imshow('Blink Detection', frame)
    
    # Press 'q' to quit
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

# Release the capture
cap.release()
cv2.destroyAllWindows()

# Print the total blink count
print("Total blinks:", blink_count)
