from flask import Flask, request, render_template, redirect, url_for, Response
from flask import jsonify
import time, json
import os, pickle
import traceback
import string
import uuid
app = Flask(__name__)

# 載入歷史訊息
# message = [ (name, content, mid, timestamp), (name, content, mid, timestamp), ... ]
# message[0] 最新
# message[-1] 最舊

messages_file = "messages.pickle"
if os.path.exists(messages_file):
    with open(messages_file, 'rb') as f:
        messages = pickle.load(f)
else:
    messages = []
    with open(messages_file, 'wb') as f:
        pickle.dump(obj=messages, file=f)

@app.route("/", methods=['GET'])
def homepage():
    
    sort_key   = request.args.get('sort', '')   
    filter_key = request.args.get('filter', '') 
    try:
        page = int(request.args.get('page', '1'))
    except:
        return redirect('/?sort='+sort_key+'&filter='+filter_key+'&page='+str(1))
    return_messages = messages

    # print(filter_key)
    if filter_key != '':
        return_messages = list(filter(lambda x:filter_key in x[0] or filter_key in x[1], return_messages))
    
    # print(page)
    max_page = max( (len(return_messages)-1) // 5 + 1 , 1)
    if page > max_page:
        return redirect('/?sort='+sort_key+'&filter='+filter_key+'&page='+str(max_page))
    elif page <= 0:
        return redirect('/?sort='+sort_key+'&filter='+filter_key+'&page='+str(1))

    # print(sort_key)
    if sort_key == "time":        
        return_messages = sorted(return_messages, key=lambda x: x[3])
    elif sort_key == "r_time":
        return_messages = sorted(return_messages, key=lambda x: x[3], reverse=True)
    elif sort_key == "user":   
        return_messages = sorted(return_messages, key=lambda x: x[0])
    elif sort_key == "r_user": 
        return_messages = sorted(return_messages, key=lambda x: x[0], reverse=True)
    elif sort_key == "len":   
        return_messages = sorted(return_messages, key=lambda x: len(x[1]))
    elif sort_key == "r_len": 
        return_messages = sorted(return_messages, key=lambda x: len(x[1]), reverse=True)

    # pagination
    return_messages = return_messages[(page-1)*5:(page-1)*5+5]

    return render_template('index.html', message_pool= return_messages)


@app.route("/add", methods=['POST'])
def add_message():
    
    global messages
    name      = request.form['from_user']
    content   = request.form['new_message']
    timestamp = time.strftime("%Y-%m-%d %H:%M:%S", time.localtime())

    
    # 產生一個 messages 裡面沒有出現過的 mid    
    mid = uuid.uuid1()  
    
    # 在 messages 新增    
    messages.insert(0,(name, content, mid, timestamp))
    
    # 儲存更新後的messages
    with open(messages_file, 'wb') as f:
        pickle.dump(obj=messages, file=f)

    return redirect(url_for('homepage'))


@app.route("/delete", methods=['DELETE'])
def delete_message():
    
    global messages
    data = json.loads(request.data.decode("utf-8"))
    mid  = uuid.UUID(data['index'])


    # Delete the message whose id == mid 
    del messages[[message[2] for message in messages].index(mid)]
 
    # 儲存更新後的 messages
    with open(messages_file, 'wb') as f:
        pickle.dump(obj=messages, file=f)

    return Response("", status=200, mimetype='application/json')

if __name__ == '__main__':
    app.run()
