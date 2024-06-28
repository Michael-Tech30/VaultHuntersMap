import asyncio
import json
import websockets
filename =r'filename.txt'
#grabs the data from text files that are named the same as the player.
def readNumFromFile(name):
    file = open("./PlayerLocation/"+name+".txt", "r")
    xyz = file.read()
    xyz = xyz.split(',')
    xz = [1.0,2.0,"ds","ds"]
    if(len(xyz)> 1):
        xz[0] = float(xyz[0])
        xz[1] = float(xyz[2])
        xz[2] = name
        xz[3] = xyz[3]
    else :
        readNumFromFile()
    return xz

async def hello():
    async with websockets.connect('ws://localhost:5000') as websocket:
        #sets up client_id
        await websocket.send(json.dumps({"client_id": "clientServer"}))
        async for message in websocket:
            try:
                data = json.loads(message)
                if data["data"] == "give me more data":
                    dataToSend = readNumFromFile(data["name"])
                    await websocket.send(json.dumps({"data": dataToSend,"name":data["name"]}))
                else:
                    print("this data is not for me")
            except websockets.exceptions.ConnectionClosed:
                print("WebSocket connection closed unexpectedly")
                break  # Exit the loop on unexpected closure
asyncio.get_event_loop().run_until_complete(hello())