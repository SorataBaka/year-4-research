# TODO: add statistics to to calculate standard deviation of average to input
# Handle imports and libraries
from imutils.video import VideoStream
from imutils import face_utils
from scipy.spatial import distance as dist
import imutils
import time
import dlib
import cv2
import numpy as np
from playsound import playsound

THRESHOLD=0.18
CONSEC_FRAME=2
COUNT=0
TOTAL=0
TOTAL_EAR=0
ITERATION=0

LOWEST_RATIO=1
HIGHEST_RATIO=0

# Handle face predictor
print("Loading face landmark model")
detector = dlib.get_frontal_face_detector()
predictor = dlib.shape_predictor("shape_predictor_68_face_landmarks.dat")

# Handle input video stream
print("Handling video input")
stream = VideoStream(0).start()

#Get eye indexes
(lstart, lend) = face_utils.FACIAL_LANDMARKS_IDXS["left_eye"]
(rstart, rend) = face_utils.FACIAL_LANDMARKS_IDXS["right_eye"]

# Define eye aspect ratio function
def calc_EAR(eye):
  leftPoint = dist.euclidean(eye[1], eye[5])
  rightPoint = dist.euclidean(eye[2], eye[4])
  horizontalDistance = dist.euclidean(eye[0], eye[3])

  ratio = (leftPoint + rightPoint) / (2.0 * horizontalDistance) 
  return ratio  

# Process frames
while True:
  frame = stream.read()
  frame = imutils.resize(frame, width=900)
  frame = cv2.flip(frame, flipCode=1)
  gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
  gray = cv2.cvtColor(gray, cv2.COLOR_GRAY2BGR)
  
  face_landmark_stream = np.copy(gray)
  face_landmark_stream = cv2.bilateralFilter(face_landmark_stream, 5, 1, 1)
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
    
    leftRatio = calc_EAR(leftEye)
    rightRatio = calc_EAR(rightEye)
    
    ratio = (leftRatio + rightRatio)/2.0
    TOTAL_EAR += ratio
    ITERATION += 1
    derivation = 0
    if(ITERATION < 500):
      if(ratio > HIGHEST_RATIO):
        HIGHEST_RATIO = ratio
      if(ratio < LOWEST_RATIO):
        LOWEST_RATIO = ratio
      
      if(ratio < THRESHOLD):
        COUNT += 1
      else:
        if(COUNT >= CONSEC_FRAME and COUNT < 10):
          TOTAL+=1
        COUNT=0
    else:
      AVERAGE_EAR = TOTAL_EAR/ITERATION
      variance = pow((ratio - AVERAGE_EAR), 2)
      derivation = np.sqrt(variance)
      if(derivation > 0.05):
        COUNT += 1
      else:
        if(COUNT >= CONSEC_FRAME and COUNT < 10):
          playsound("assets/sound.mp3")
          TOTAL += 1
        COUNT = 0
      
    
    cv2.putText(isolate_stream, "Blinks: {}".format(TOTAL), (20, 60), cv2.FONT_HERSHEY_PLAIN, 1, (255,255,0), 2)
    cv2.putText(isolate_stream, "Ratio: {}".format(ratio), (20, 90), cv2.FONT_HERSHEY_PLAIN, 1, (255,255,0), 2)
    cv2.putText(isolate_stream, "Left Ratio: {}".format(leftRatio), (20, 120), cv2.FONT_HERSHEY_PLAIN, 1, (255,255,0), 2)
    cv2.putText(isolate_stream, "Right Ratio: {}".format(rightRatio), (20, 150), cv2.FONT_HERSHEY_PLAIN, 1, (255,255,0), 2)
    cv2.putText(isolate_stream, "Consecutive Close: {}".format(COUNT), (20, 180), cv2.FONT_HERSHEY_PLAIN, 1, (255,255,0), 2)
    cv2.putText(isolate_stream, "Average EAR: {}".format(TOTAL_EAR/ITERATION), (20, 200), cv2.FONT_HERSHEY_PLAIN, 1, (255,255,0), 2)
    cv2.putText(isolate_stream, "Derivation: {}".format(derivation), (20, 220), cv2.FONT_HERSHEY_PLAIN, 1, (255,255,0), 2)
    cv2.putText(isolate_stream, "Iterations: {}".format(ITERATION), (20, 240), cv2.FONT_HERSHEY_PLAIN, 1, (255,255,0), 2)
    leftHull = cv2.convexHull(leftEye)
    rightHull = cv2.convexHull(rightEye)
    
    cv2.drawContours(isolate_stream, [leftHull], -1, (255, 255, 0), 1)
    cv2.drawContours(isolate_stream, [rightHull], -1, (255, 255, 0), 1)
    cv2.drawContours(face_landmark_stream, [leftHull], -1, (255, 255, 0), 1)
    cv2.drawContours(face_landmark_stream, [rightHull], -1, (255, 255, 0), 1)
    
    
  cv2.putText(frame, "Original Feed", (20, 30), cv2.FONT_HERSHEY_PLAIN, 1, (255, 0, 255), 2)
  cv2.putText(gray, "Processed Feed", (20, 30), cv2.FONT_HERSHEY_PLAIN, 1, (255, 0, 255), 2)
  cv2.putText(face_landmark_stream, "Feed + Isolate", (20, 30), cv2.FONT_HERSHEY_PLAIN, 1, (255, 0, 255), 2)
  cv2.putText(isolate_stream, "Isolate", (20, 30), cv2.FONT_HERSHEY_PLAIN, 1, (255, 0, 255), 2)
    
  horizontal_feed_0 = np.concatenate((frame, gray), axis=1)
  horizontal_feed_1 = np.concatenate((isolate_stream, face_landmark_stream), axis=1)
  vertical_feed = np.concatenate((horizontal_feed_0, horizontal_feed_1), axis=0)
  cv2.imshow("Frame", vertical_feed)
  
  key = cv2.waitKey(1) & 0xFF
  if(key == ord("q")):
    break

print(HIGHEST_RATIO)
print(LOWEST_RATIO)
cv2.destroyAllWindows()
stream.stop()