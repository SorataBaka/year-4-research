from imutils.video import VideoStream
import cv2
import time
import f_detector
import imutils
import numpy as np
import requests
from datetime import datetime, timedelta

# instancio detector
detector = f_detector.eye_blink_detector()
# iniciar variables para el detector de parapadeo
COUNTER = 0
TOTAL = 0
SECONDCOUNTER = TOTAL
USERNAME="Chris"
TIMESINCELASTBLINK = datetime.now()

# handle database log
def logDatabase():
    global SECONDCOUNTER
    global TOTAL
    global TIMESINCELASTBLINK
    if(SECONDCOUNTER == TOTAL):
        return
    currentTime = datetime.now()
    if(currentTime - TIMESINCELASTBLINK < timedelta(seconds=3)):
        return
    
    
    TIMESINCELASTBLINK = currentTime
    SECONDCOUNTER = TOTAL
    x = requests.get("http://localhost:3000/log/" + USERNAME)
    print("Logged with status " + str(x.status_code))
    return
# ----------------------------- video -----------------------------
#ingestar data
vs = VideoStream(src=0).start()
while True:
    star_time = time.time()
    im = vs.read()
    im = cv2.flip(im, 1)
    im = imutils.resize(im, width=720)
    gray = cv2.cvtColor(im, cv2.COLOR_BGR2GRAY)
    # detectar_rostro    
    rectangles = detector.detector_faces(gray, 0)
    boxes_face = f_detector.convert_rectangles2array(rectangles,im)
    if len(boxes_face)!=0:
        # seleccionar el rostro con mas area
        areas = f_detector.get_areas(boxes_face)
        index = np.argmax(areas)
        rectangles = rectangles[index]
        boxes_face = np.expand_dims(boxes_face[index],axis=0)
        # blinks_detector
        COUNTER,TOTAL = detector.eye_blink(gray,rectangles,COUNTER,TOTAL)
        # agregar bounding box
        img_post = f_detector.bounding_box(im,boxes_face,['blinks: {}'.format(TOTAL)])
        logDatabase()
    else:
        img_post = im 
    # visualizacion 
    end_time = time.time() - star_time
    FPS = 1/end_time
    cv2.putText(img_post,f"FPS: {round(FPS,3)}",(10,50),cv2.FONT_HERSHEY_COMPLEX,1,(0,0,255),2)
    cv2.imshow('はばたき数',img_post)
    if cv2.waitKey(1) &0xFF == ord('q'):
        break