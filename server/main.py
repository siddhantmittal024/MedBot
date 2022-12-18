from datetime import datetime
from sklearn.tree import DecisionTreeClassifier, _tree
import warnings
import csv
from typing import List
from sklearn.svm import SVC
from sklearn.model_selection import cross_val_score
from sklearn.model_selection import train_test_split
import numpy as np
from sklearn import preprocessing
import pyttsx3
import pandas as pd
import re
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.responses import HTMLResponse
from fastapi.middleware.cors import CORSMiddleware
import json
app = FastAPI()

warnings.filterwarnings("ignore", category=DeprecationWarning)

training = pd.read_csv('Data/Training.csv')
testing = pd.read_csv('Data/Testing.csv')
cols = training.columns
cols = cols[:-1]
x = training[cols]
y = training['prognosis']
y1 = y

reduced_data = training.groupby(training['prognosis']).max()

# mapping strings to numbers
le = preprocessing.LabelEncoder()
le.fit(y)
y = le.transform(y)


x_train, x_test, y_train, y_test = train_test_split(
    x, y, test_size=0.33, random_state=42)
testx = testing[cols]
testy = testing['prognosis']
testy = le.transform(testy)


clf1 = DecisionTreeClassifier()
clf = clf1.fit(x_train, y_train)
# print(clf.score(x_train,y_train))
# print ("cross result========")
scores = cross_val_score(clf, x_test, y_test, cv=3)
# print (scores)
print(scores.mean())


model = SVC()
model.fit(x_train, y_train)
print("for svm: ")
print(model.score(x_test, y_test))

importances = clf.feature_importances_
indices = np.argsort(importances)[::-1]
features = cols


def readn(nstr):
    engine = pyttsx3.init()
    engine.setProperty('voice', "english+f5")
    engine.setProperty('rate', 130)
    engine.say(nstr)
    engine.runAndWait()
    engine.stop()


severityDictionary = dict()
description_list = dict()
precautionDictionary = dict()

symptoms_dict = {}

for index, symptom in enumerate(x):
    symptoms_dict[symptom] = index


def calc_condition(exp, days):
    sum = 0
    for item in exp:
        sum = sum+severityDictionary[item]
    if ((sum*days)/(len(exp)+1) > 13):
        return "You should take the consultation from doctor. "
    else:
        return "It might not be that bad but you should take precautions."


def getDescription():
    global description_list
    with open('MasterData/symptom_Description.csv') as csv_file:
        csv_reader = csv.reader(csv_file, delimiter=',')
        line_count = 0
        for row in csv_reader:
            _description = {row[0]: row[1]}
            description_list.update(_description)


def getSeverityDict():
    global severityDictionary
    with open('MasterData/symptom_severity.csv') as csv_file:

        csv_reader = csv.reader(csv_file, delimiter=',')
        try:
            for row in csv_reader:
                _diction = {row[0]: int(row[1])}
                severityDictionary.update(_diction)
        except:
            pass


def getprecautionDict():
    global precautionDictionary
    with open('MasterData/symptom_precaution.csv') as csv_file:

        csv_reader = csv.reader(csv_file, delimiter=',')
        line_count = 0
        for row in csv_reader:
            _prec = {row[0]: [row[1], row[2], row[3], row[4]]}
            precautionDictionary.update(_prec)


def check_pattern(dis_list, inp):
    pred_list = []
    inp = inp.replace(' ', '_')
    patt = f"{inp}"
    regexp = re.compile(patt)
    pred_list = [item for item in dis_list if regexp.search(item)]
    if (len(pred_list) > 0):
        return 1, pred_list
    else:
        return 0, []


def sec_predict(symptoms_exp):
    df = pd.read_csv('Data/Training.csv')
    X = df.iloc[:, :-1]
    y = df['prognosis']
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.3, random_state=20)
    rf_clf = DecisionTreeClassifier()
    rf_clf.fit(X_train, y_train)

    symptoms_dict = {symptom: index for index, symptom in enumerate(X)}
    input_vector = np.zeros(len(symptoms_dict))
    for item in symptoms_exp:
        input_vector[[symptoms_dict[item]]] = 1

    return rf_clf.predict([input_vector])


def print_disease(node):
    node = node[0]
    val = node.nonzero()
    disease = le.inverse_transform(val[0])
    return list(map(lambda x: x.strip(), list(disease)))


getSeverityDict()
getDescription()
getprecautionDict()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # can alter with time
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def get():
    return "hello"


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    # await manager.connect(websocket)
    tree_ = clf.tree_
    feature_name = [
        cols[i] if i != _tree.TREE_UNDEFINED else "undefined!"
        for i in tree_.feature
    ]

    chk_dis = ",".join(cols).split(",")
    symptoms_present = []
    await websocket.send_text(json.dumps("MedBot says, Hello!!👋 "))

    await websocket.send_text(json.dumps("Enter the symptom you are experiencing.."))

    while True:
        # data = await websocket.receive_text()
        while True:
            symptom = await websocket.receive_text()
            conf, cnf_dis = check_pattern(chk_dis, symptom)
            # print(cnf_dis)
            if conf == 1:
                await websocket.send_text(json.dumps("Entered Symptom/Possible Symptoms: "))
                i = 0
                for it in (cnf_dis):
                    it = it.replace("_", " ")
                    await websocket.send_text(json.dumps(str(i)+'. '+(it)))
                    i = i+1

                if i-1 != 0:
                    await websocket.send_text(json.dumps("Select the one you meant (0 - " + str(i-1) + ") for a beter understanding: "))
                    conf_inp = await websocket.receive_text()
                    conf_inp = 1
                else:
                    conf_inp = 0

                symptom = cnf_dis[int(conf_inp)]
                # print(symptom)
                break

            else:
                await websocket.send_text(json.dumps("Enter valid symptom.."))

        await websocket.send_text(json.dumps("Okay... From how many days ? :"))

        while True:
            num_days = await websocket.receive_text()
            if (int(num_days) > 0):
                # print(num_days)
                break
            else:
                await websocket.send_text(json.dumps("Enter a valid input."))

        async def recurse(node, depth):
            # print("entered recurse.....")
            if tree_.feature[node] != _tree.TREE_UNDEFINED:
                name = feature_name[node]
                threshold = tree_.threshold[node]

                if name == symptom:
                    val = 1
                else:
                    val = 0
                if val <= threshold:
                    await recurse(tree_.children_left[node], depth + 1)
                else:
                    symptoms_present.append(name)
                    await recurse(tree_.children_right[node], depth + 1)
            else:
                present_disease = print_disease(tree_.value[node])
                # print( "You may have " +  present_disease )
                red_cols = reduced_data.columns
                symptoms_given = red_cols[reduced_data.loc[present_disease].values[0].nonzero(
                )]

                await websocket.send_text(json.dumps("Are you experiencing any of the: "))
                await websocket.send_text(json.dumps("Answer using (yes/no)"))
                symptoms_exp = []
                for syms in list(symptoms_given):
                    inp = ""
                    temp_symp = syms.replace("_", " ")
                    await websocket.send_text(json.dumps(temp_symp + "? : "))
                    while True:
                        inp = await websocket.receive_text()
                        if (inp == "yes" or inp == "no"):
                            break
                        else:
                            await websocket.send_text(json.dumps("Please provide proper answers i.e. (yes/no) : "))
                    if (inp == "yes"):
                        symptoms_exp.append(syms)

                second_prediction = sec_predict(symptoms_exp)
                # print(symptoms_exp)
                await websocket.send_text(json.dumps(calc_condition(symptoms_exp, int(num_days))))
                if (present_disease[0] == second_prediction[0]):
                    await websocket.send_text(json.dumps("You may have " + present_disease[0]))

                    # print(description_list[present_disease[0]])
                    await websocket.send_text(json.dumps(description_list[present_disease[0]]))
                else:
                    await websocket.send_text(json.dumps("You may have " +
                                                         present_disease[0] + " or " + second_prediction[0]))
                    await websocket.send_text(json.dumps(description_list[present_disease[0]]))
                    await websocket.send_text(json.dumps(description_list[second_prediction[0]]))

                precution_list = precautionDictionary[present_disease[0]]
                await websocket.send_text(json.dumps("You are adviced to take the following measures : "))
                for i, j in enumerate(precution_list):
                    await websocket.send_text(json.dumps(str(i+1)+") "+j))

        await recurse(0, 1)
        break
