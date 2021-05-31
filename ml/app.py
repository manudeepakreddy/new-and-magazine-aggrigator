from flask import Flask,request
import pandas as pd
from ml import main
import json
app=Flask(__name__)

@app.route('/')
def test():
	return "Server is Up"

@app.route("/similarity",methods=["GET", "POST"])
def similarity():
	if request.method=="POST" or request.method == "GET":
		# data = news to query
		# {"description": string}
		data=request.get_json()
		csv_path = './data.csv'
		description = data["description"]
		indices = main(csv_path, description, 15)
		resp = {"indices": indices}
		print(indices)
		response = app.response_class(
        response=json.dumps(resp),
        status=200,
        mimetype='application/json'
    )
	return response
@app.route("/magsimilarity",methods=["GET", "POST"])
def magsimilarity():
	if request.method=="POST" or request.method == "GET":
		# data = news to query
		# {"description": string}
		data=request.get_json()
		csv_path = './magdata.csv'
		description = data["description"]
		indices = main(csv_path, description, 8)
		resp = {"indices": indices}
		print(indices)
		response = app.response_class(
        response=json.dumps(resp),
        status=200,
        mimetype='application/json'
    )
	return response

if __name__=='__main__':
	app.run(host="0.0.0.0",port=5000)

