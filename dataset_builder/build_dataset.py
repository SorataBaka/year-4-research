# Handle imports and libraries
from imutils.video import VideoStream
from imutils import face_utils
from scipy.spatial import distance as dist
import imutils
import time
import dlib
import cv2
import numpy as np

# Declare global variables

THRESHOLD=0.19
CONSEC_FRAME=2

COUNT=0
TOTAL=0

TOTAL_EAR=0

openIndex = 0
closedIndex = 0

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
  # frame = imutils.resize(frame, width=FRAME_RESIZE)
  frame = cv2.flip(frame, flipCode=1)
  
  #Convert color for better detection
  gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
  gray = cv2.cvtColor(gray, cv2.COLOR_GRAY2BGR)
  
  face_landmark_stream = np.copy(gray)
  # face_landmark_stream = cv2.bilateralFilter(face_landmark_stream, -1,  1, 1)
  
  faces = detector(face_landmark_stream, 0)
  for face in faces:
    shape = predictor(face_landmark_stream, face)
    shape = face_utils.shape_to_np(shape)
    for(x, y) in shape:
      face_landmark_stream = cv2.circle(face_landmark_stream, (x, y), 1, (255, 255, 0), 2)
    
    leftEye = shape[lstart:lend]
    rightEye = shape[rstart:rend]
    
    #Extract the eye
    leftEyeXCoordinates = [pt[0] for pt in leftEye]
    leftEyeYCoordinates = [pt[1] for pt in leftEye]
    rightEyeXCoordinates = [pt[0] for pt in rightEye]
    rightEyeYCoordinates = [pt[1] for pt in rightEye]
    
    leftEyeXMax = max(leftEyeXCoordinates) + 100
    leftEyeXMin = min(leftEyeXCoordinates) - 100
    leftEyeYMax = max(leftEyeYCoordinates) + 100
    leftEyeYMin = min(leftEyeYCoordinates) - 100
    rightEyeXMax = max(rightEyeXCoordinates) + 100
    rightEyeXMin = min(rightEyeXCoordinates) - 100
    rightEyeYMax = max(rightEyeYCoordinates) + 100
    rightEyeYMin = min(rightEyeYCoordinates) - 100
    
    leftEyeImage = gray[leftEyeYMin:leftEyeYMax, leftEyeXMin:leftEyeXMax]
    rightEyeImage = gray[rightEyeYMin:rightEyeYMax, rightEyeXMin:rightEyeXMax]
    
    leftRatio = calc_EAR(leftEye)
    rightRatio = calc_EAR(rightEye)
    
    ratio = (leftRatio + rightRatio)/2.0
    
    TOTAL_EAR += ratio
    if(ratio <= THRESHOLD):
      COUNT += 1
      cv2.imwrite("dataset/eyes_closed/{}.jpg".format(closedIndex), leftEyeImage)
      closedIndex += 1
      cv2.imwrite("dataset/eyes_closed/{}.jpg".format(closedIndex), rightEyeImage)
      closedIndex += 1
      
    else:
      cv2.imwrite("dataset/eyes_open/{}.jpg".format(openIndex), leftEyeImage)
      openIndex += 1
      cv2.imwrite("dataset/eyes_open/{}.jpg".format(openIndex), rightEyeImage)
      openIndex += 1
      
      if(COUNT >= CONSEC_FRAME and COUNT < 8):
        TOTAL+=1
      COUNT=0

    leftHull = cv2.convexHull(leftEye)
    rightHull = cv2.convexHull(rightEye)
    
    cv2.drawContours(face_landmark_stream, [leftHull], -1, (255, 255, 0), 1)
    cv2.drawContours(face_landmark_stream, [rightHull], -1, (255, 255, 0), 1)
    
  cv2.putText(face_landmark_stream, "Feed + Isolate", (20, 30), cv2.FONT_HERSHEY_PLAIN, 1, (255, 0, 255), 1)
    
  fps = 1.0/(time.time() - start_time)
  
  cv2.imshow("Frame", face_landmark_stream)
  
  key = cv2.waitKey(1) & 0xFF
  if(key == ord("q")):
    break
  
cv2.destroyAllWindows()
stream.stop()