# Handle imports and libraries
from tabnanny import verbose
import imutils.object_detection
from imutils.video import VideoStream
from imutils import face_utils
from scipy.spatial import distance as dist
import imutils
import time
import dlib
import cv2
import numpy as np
import tensorflow as tf

model = tf.keras.models.load_model("output/eye_open_close_rev4_70_50.keras")


# Declare global variables
FRAME_RESIZE = 800
START_TIME = time.time()

COUNT=0
TOTAL=0


class_names = ['eyes_closed', 'eyes_opened']
index = 0

# Handle face predictor
print("Loading face landmark model")
detector = dlib.get_frontal_face_detector()
predictor = dlib.shape_predictor("assets/shape_predictor_68_face_landmarks.dat")

# Handle input video stream
print("Handling video input")
stream = VideoStream(0).start()

#Get eye indexes
(lstart, lend) = face_utils.FACIAL_LANDMARKS_IDXS["left_eye"]
(rstart, rend) = face_utils.FACIAL_LANDMARKS_IDXS["right_eye"]
# Process frames
while True:
  frame = stream.read()
  start_time = time.time()
  frame = imutils.resize(frame, width=FRAME_RESIZE)
  frame = cv2.flip(frame, flipCode=1)

  #Convert color for better detection
  gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
  gray = cv2.cvtColor(gray, cv2.COLOR_GRAY2BGR)

  face_landmark_stream = np.copy(gray)
  # face_landmark_stream = cv2.bilateralFilter(face_landmark_stream, -1,  1, 1)
  isolate_stream = np.full_like(face_landmark_stream, 0)

  faces = detector(face_landmark_stream, 0)
  for face in faces:
    shape = predictor(face_landmark_stream, face)
    shape = face_utils.shape_to_np(shape)
    for(x, y) in shape:
      cv2.circle(face_landmark_stream, (x, y), 1, (255, 255, 0), 2)
      cv2.circle(isolate_stream, (x, y), 1, (255, 255, 0), 2)

    leftEye = shape[lstart:lend]
    rightEye = shape[rstart:rend]

    #Extract the eye
    leftEyeXCoordinates = [pt[0] for pt in leftEye]
    leftEyeYCoordinates = [pt[1] for pt in leftEye]
    rightEyeXCoordinates = [pt[0] for pt in rightEye]
    rightEyeYCoordinates = [pt[1] for pt in rightEye]

    leftEyeXMax = max(leftEyeXCoordinates) + 30
    leftEyeXMin = min(leftEyeXCoordinates) - 30
    leftEyeYMax = max(leftEyeYCoordinates) + 30
    leftEyeYMin = min(leftEyeYCoordinates) - 30
    rightEyeXMax = max(rightEyeXCoordinates) + 30
    rightEyeXMin = min(rightEyeXCoordinates) - 30
    rightEyeYMax = max(rightEyeYCoordinates) + 30
    rightEyeYMin = min(rightEyeYCoordinates) - 30
    
    leftEyeImage = gray[leftEyeYMin:leftEyeYMax, leftEyeXMin:leftEyeXMax]
    rightEyeImage = gray[rightEyeYMin:rightEyeYMax, rightEyeXMin:rightEyeXMax]
    
    leftEyeImage = cv2.resize(leftEyeImage,(70, 50))
    rightEyeImage = cv2.resize(rightEyeImage ,(70, 50))
    
    leftEyeImage = tf.keras.utils.img_to_array(leftEyeImage)
    leftPrediction = model.predict(np.expand_dims(leftEyeImage, axis=0), verbose=0)
    
    rightEyeImage = tf.keras.utils.img_to_array(rightEyeImage)
    rightPrediction = model.predict(np.expand_dims(rightEyeImage, axis=0), verbose=0)

    leftScore = tf.nn.softmax(leftPrediction[0])
    rightScore = tf.nn.softmax(rightPrediction[0])
    
    average = (rightScore + leftScore) / 2
    
    
    cv2.putText(frame, "Prediction: {} {:.2f}".format(class_names[np.argmax(average)], 100 * np.max(average)), (20, 80), cv2.FONT_HERSHEY_PLAIN, 1.5, (255, 255, 255), 1)
    cv2.putText(frame, "Left Prediction  : {} {:.2f}%".format(class_names[np.argmax(leftScore)], 100 * np.max(leftScore)), (20, 100), cv2.FONT_HERSHEY_PLAIN, 1.5, (255, 255, 255), 1)
    cv2.putText(frame, "Right Prediction : {} {:.2f}%".format(class_names[np.argmax(rightScore)], 100 * np.max(rightScore)), (20, 120), cv2.FONT_HERSHEY_PLAIN, 1.5, (255, 255, 255), 1)
    
    if(np.argmax(leftScore) == 0 and 100 * np.max(leftScore) >= 70.0) or (np.argmax(rightScore) == 0 and 100 * np.max(rightScore) >= 70.0):
      COUNT += 1
    else:
      if(COUNT >= 1 and COUNT < 5):
        TOTAL+=1
        is_blink = True
      COUNT=0
    
    cv2.putText(frame, "Blinks: {}".format(TOTAL), (20, 140), cv2.FONT_HERSHEY_PLAIN, 1.5, (0,0,0), 1)

    leftHull = cv2.convexHull(leftEye)
    rightHull = cv2.convexHull(rightEye)

    cv2.drawContours(frame, [leftHull], -1, (255, 255, 0), 1)
    cv2.drawContours(frame, [rightHull], -1, (255, 255, 0), 1)


  cv2.putText(frame, "Feed + Isolate", (20, 30), cv2.FONT_HERSHEY_PLAIN, 1, (255, 0, 255), 1)
  fps = 1.0/(time.time() - start_time)

  cv2.putText(frame, "FPS: {:.2f}".format(fps) ,(20, 50), cv2.FONT_HERSHEY_PLAIN, 1, (255, 0, 255), 1)
  cv2.imshow("Frame", frame)
  
  key = cv2.waitKey(1) & 0xFF
  if(key == ord("r")):
    TOTAL = 0
  if(key == ord("q")):
    break

cv2.destroyAllWindows()
stream.stop()