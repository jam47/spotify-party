from flask import Flask
from flask import render_template

app = Flask(__name__)

@app.route('/')
def return_index():
    return render_template('index.html')

@app.route('/util.js')
def return_util():
    return render_template('util.js')

if __name__ == '__main__':
    app.run(debug=True)
