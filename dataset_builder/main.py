# Handle imports and libraries
import imutils.object_detection
from imutils.video import VideoStream
from imutils import face_utils
from scipy.spatial import distance as dist
import imutils
import time
import dlib
import cv2
import numpy as np
import csv

# Declare global variables

THRESHOLD=0.18
CONSEC_FRAME=2
FRAME_RESIZE = 1000

COUNT=0
TOTAL=0

TOTAL_EAR=0
ITERATION=0
START_TIME = time.time()

EAR_list = []


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
  start_time = time.time()
  frame = imutils.resize(frame, width=FRAME_RESIZE)
  frame = cv2.flip(frame, flipCode=1)
  
  # Image cleaning
  frame = cv2.GaussianBlur(frame, (5, 5), 0 )
  
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
    
    leftEyeXMax = max(leftEyeXCoordinates) + 20
    leftEyeXMin = min(leftEyeXCoordinates) - 20
    leftEyeYMax = max(leftEyeYCoordinates) + 20
    leftEyeYMin = min(leftEyeYCoordinates) - 20
    rightEyeXMax = max(rightEyeXCoordinates) + 20
    rightEyeXMin = min(rightEyeXCoordinates) - 20
    rightEyeYMax = max(rightEyeYCoordinates) + 20
    rightEyeYMin = min(rightEyeYCoordinates) - 20
    
    leftEyeImage = gray[leftEyeYMin:leftEyeYMax, leftEyeXMin:leftEyeXMax]
    rightEyeImage = gray[rightEyeYMin:rightEyeYMax, rightEyeXMin:rightEyeXMax]
    
    
    leftRatio = calc_EAR(leftEye)
    rightRatio = calc_EAR(rightEye)
    
    ratio = (leftRatio + rightRatio)/2.0
    
    TOTAL_EAR += ratio
    ITERATION += 1
    
    derivation = 0
    
    if(ITERATION < 500):
      if(ratio < THRESHOLD):
        COUNT += 1
        cv2.imwrite("dataset/eyes_closed/left/{}.jpg".format(ITERATION), leftEyeImage)
        cv2.imwrite("dataset/eyes_closed/right/{}.jpg".format(ITERATION), rightEyeImage)
      else:
        if(COUNT >= CONSEC_FRAME and COUNT < 8):
          cv2.imwrite("dataset/eyes_open/left/{}.jpg".format(ITERATION), leftEyeImage)
          cv2.imwrite("dataset/eyes_open/right/{}.jpg".format(ITERATION), rightEyeImage)
          TOTAL+=1
        COUNT=0
    else:
      AVERAGE_EAR = TOTAL_EAR/ITERATION
      variance = pow((ratio - AVERAGE_EAR), 2)
      derivation = np.sqrt(variance)
      if(derivation > 0.09):
        COUNT += 1
        cv2.imwrite("dataset/eyes_closed/left/{}.jpg".format(ITERATION), leftEyeImage)
        cv2.imwrite("dataset/eyes_closed/right/{}.jpg".format(ITERATION), rightEyeImage)
      else:
        if(COUNT >= CONSEC_FRAME and COUNT < 8):
          cv2.imwrite("dataset/eyes_open/left/{}.jpg".format(ITERATION), leftEyeImage)
          cv2.imwrite("dataset/eyes_open/right/{}.jpg".format(ITERATION), rightEyeImage)
          TOTAL += 1
        COUNT = 0
      
    leftHull = cv2.convexHull(leftEye)
    rightHull = cv2.convexHull(rightEye)
    
    cv2.drawContours(isolate_stream, [leftHull], -1, (255, 255, 0), 1)
    cv2.drawContours(isolate_stream, [rightHull], -1, (255, 255, 0), 1)
    cv2.drawContours(face_landmark_stream, [leftHull], -1, (255, 255, 0), 1)
    cv2.drawContours(face_landmark_stream, [rightHull], -1, (255, 255, 0), 1)
    
    
  cv2.putText(frame, "Original Feed", (20, 30), cv2.FONT_HERSHEY_PLAIN, 1, (255, 0, 255), 1)
  cv2.putText(gray, "Processed Feed", (20, 30), cv2.FONT_HERSHEY_PLAIN, 1, (255, 0, 255), 1)
  cv2.putText(face_landmark_stream, "Feed + Isolate", (20, 30), cv2.FONT_HERSHEY_PLAIN, 1, (255, 0, 255), 1)
  cv2.putText(isolate_stream, "Isolate", (20, 30), cv2.FONT_HERSHEY_PLAIN, 1, (255, 0, 255), 1)
    
  horizontal_feed_0 = np.concatenate((frame, gray), axis=1)
  horizontal_feed_1 = np.concatenate((isolate_stream, face_landmark_stream), axis=1)
  vertical_feed = np.concatenate((horizontal_feed_1, horizontal_feed_0), axis=0)
  fps = 1.0/(time.time() - start_time)
  
  cv2.putText(vertical_feed, "FPS: {:.2f}".format(fps) ,(20, 50), cv2.FONT_HERSHEY_PLAIN, 1, (255, 0, 255), 1)
  cv2.imshow("Frame", vertical_feed)
  
  CURRENT_TIME = time.time()
  if(CURRENT_TIME - START_TIME >= 60 * 1000):
    break
  key = cv2.waitKey(1) & 0xFF
  if(key == ord("q")):
    break
  
cv2.destroyAllWindows()
stream.stop()