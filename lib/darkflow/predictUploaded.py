from darkflow.net.build import TFNet
import cv2
import os
import sys
import json

path          = os.path.dirname(os.path.realpath(__file__))
store         = ''
#imgpath       = 'C:\\Users\\ACER\\Desktop\\ThesisDesktop\\entamoeba-detector\\lib\\darkflow\\sample_images\\pathogenic.png'
imgpath       = sys.argv[1]
imgpath_store = ''


for char in path:
	if(char == '\\'):
		store = store + '/'
	else:
		store = store + char


for char in imgpath:
	if(char == '\\'):
		imgpath_store = imgpath_store + '/'
	else:
		imgpath_store = imgpath_store + char


pbDirectory   = store + "/built_graph/saved_model.pb"
metaDirectory = store + "/built_graph/saved_model.meta"

options = {
	"pbLoad"    : pbDirectory,
	"metaLoad"  : metaDirectory,
	"threshold" : 0.1
}

tfnet   = TFNet(options)
imgcv   = cv2.imread(str(imgpath_store))
results = tfnet.return_predict(imgcv)
largest = {}
print(results)

if(len(results) == 0):
	data = {
		'label'      : 'null',
		'confidence' : 'null'
	}
	with open(store+'/result/result_file.json', 'w') as write_file:
 		json.dump(data, write_file)
	sys.stdout.flush()
	sys.exit(0)
elif(len(results) == 1):
	largest = results[0]
else:
	largest = results[0]
	for index in range(1,len(results)):
		currentResult  = results[index]
		if(currentResult['confidence'] > largest['confidence']):
			largest = currentResult
		else:
			pass


cv2.rectangle(imgcv,(largest['topleft']['x'],largest['topleft']['y']),(largest['bottomright']['x'],largest['bottomright']['y']),(242, 118, 9),3)
					#top-left , #bottom-right, #color, #channels
cv2.imwrite(store+'/result/result.png',imgcv)

data = {
	'label'      : str(largest['label']),
	'confidence' : str(largest['confidence'])
}

with open(str(store)+'/result/result_file.json', 'w') as write_file:
	json.dump(data,write_file)
sys.stdout.flush()
sys.exit(0)
