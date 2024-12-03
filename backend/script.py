import cv2
import numpy as np
import pyzbar.pyzbar as pyzbar
import urllib.request
import requests
import time
import sys

# Function to send data to the Node.js server
def send_data_to_server(data):
    url = 'http://localhost:8080/endpoint'  # Replace with your server's URL
    payload = {'data': data}
    try:
        response = requests.post(url, json=payload)
        print("Data sent to server:", response.status_code)
    except requests.exceptions.RequestException as e:
        print("Error sending data:", e)

# Initialize
font = cv2.FONT_HERSHEY_PLAIN
url = 'http://192.168.241.238/'  # Replace with your camera URL
cv2.namedWindow("Please Scan the QR Code", cv2.WINDOW_AUTOSIZE)

prev = ""  # Store the previously detected QR code data
last_sent_time = 0  # Store the last time data was sent

def run():
    global prev, last_sent_time
    print("Starting the QR code detection...")
    while True:
        try:
            img_resp = urllib.request.urlopen(url + 'cam-hi.jpg')
        except Exception as e:
            print("Error accessing camera:", e)
            break
        
        imgnp = np.array(bytearray(img_resp.read()), dtype=np.uint8)
        frame = cv2.imdecode(imgnp, -1)

        decodedObjects = pyzbar.decode(frame)
        
        # Check if any QR code was detected
        if decodedObjects:
            for obj in decodedObjects:
                pres = obj.data.decode()  # Decode byte data to string
                current_time = time.time()
                if prev != pres or (current_time - last_sent_time > 10):
                    print("Type:", obj.type)
                    print("Data: ", pres)
                    send_data_to_server(pres)
                    prev = pres
                    last_sent_time = current_time

                # Display the decoded QR code data on the frame
                cv2.putText(frame, str(obj.data, 'utf-8'), (50, 50), font, 2, (255, 0, 0), 3)
        else:
            # Display a message when no QR code is detected
            cv2.putText(frame, "No QR Code Detected", (50, 50), font, 2, (255, 0, 0), 3)

        # Show the live transmission frame
        cv2.imshow("Please Scan the QR Code", frame)
        key = cv2.waitKey(1)
        if key == 27:  # Exit on ESC key
            print("ESC pressed. Terminating...")
            break

    cv2.destroyAllWindows()
    print("Program terminated. Ready for another run.")

# Run the script
if __name__ == "__main__":
    try:
        run()
    except KeyboardInterrupt:
        print("Script terminated by user.")
        cv2.destroyAllWindows()  # Ensure all windows are closed
        sys.exit(0)
