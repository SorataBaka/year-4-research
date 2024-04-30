import cv2
import numpy as np

camera = cv2.VideoCapture(0)
face_cascade = cv2.CascadeClassifier("haarcascade_frontalface_default.xml")
eye_cascade = cv2.CascadeClassifier("haarcascade_righteye_2splits.xml")

while True:
  ret, frame = camera.read()
  frame = cv2.flip(frame, 1)
  gray = cv2.cvtColor(frame, cv2.COLOR_RGB2GRAY)
  gray = cv2.cvtColor(gray, cv2.COLOR_GRAY2BGR)
  gray = cv2.bilateralFilter(gray, 5, 1, 1)
  faceFrame = np.copy(gray)
  eyeFrame = np.copy(gray)
  
  faces = face_cascade.detectMultiScale(gray, 1.2, 5, minSize=(200, 200))
  if(len(faces) > 0):
    for (x, y, w, h ) in faces:
      faceFrame= cv2.rectangle(faceFrame, (x, y), (x + w, y + h), (255, 255, 0), 2)
      eyeFrame = np.copy(faceFrame)
      roi_face = gray[y:y+h,x:x+w]
      roi_face_clr = frame[y:y+h,x:x+w]
      eyes = eye_cascade.detectMultiScale(roi_face,1.3,minSize=(50,50))
      if(len(eyes) > 0):
        for (eyeX, eyeY, eyeW, eyeH) in eyes:
          eyeFrame = cv2.rectangle(eyeFrame, (eyeX + x, eyeY + y), (eyeX + x + eyeW, eyeY + y +  eyeH), (255,255, 0), 2)
          eyeIsolate = roi_face[eyeY:eyeY+eyeH, eyeX:eyeX+eyeW]
          cv2.imshow("EYE", eyeIsolate)
      else:
        print("Maybe blink")
          
  cv2.putText(frame, "Original Stream", (100, 100), cv2.FONT_HERSHEY_PLAIN, 3, (255, 255, 0), 5)
  cv2.putText(gray, "Grayscale", (100, 100), cv2.FONT_HERSHEY_PLAIN, 3, (255, 255, 0), 5)
  cv2.putText(faceFrame, "Face Stream", (100, 100), cv2.FONT_HERSHEY_PLAIN, 3, (255, 255, 0), 5)
  cv2.putText(eyeFrame, "Eye Stream", (100, 100), cv2.FONT_HERSHEY_PLAIN, 3, (255, 255, 0), 5)
  horizontal_concat = np.concatenate((frame, gray), axis=1)  
  horizontal_concat_1 = np.concatenate((faceFrame, eyeFrame), axis=1)
  vertical_concat = np.concatenate((horizontal_concat, horizontal_concat_1), axis=0)
  cv2.imshow("Camera feed", vertical_concat)
  if cv2.waitKey(1) & 0xFF == ord('q'):
      break
camera.release()