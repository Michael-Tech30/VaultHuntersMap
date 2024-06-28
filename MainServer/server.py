import asyncio
import websockets
import json

connected = {}

async def server(websocket,path):
    try:
        registration_message = await websocket.recv()
        registration_data = json.loads(registration_message)
        client_id = registration_data['client_id']
        #if this is the first time the server has come across this id it will add it to the array as a list this way anyone else that wants to subscribe to the list will be able to. 
        if client_id not in connected:
            connected[client_id] = set()
        connected[client_id].add(websocket)
        print("this is the connected: ")
        print(connected)
        async for message in websocket:
            data = json.loads(message)
            print(data)
            #two types of data that should be sent. from web browser that ask for more data. from client server to send more data
            if 'give me more data' == data["data"]:
                for conn in connected["clientServer"]:
                    await conn.send(json.dumps(data))
            else:
                # Handle data response
                requester_client_id = data['name']
                if requester_client_id in connected:
                    for conn in connected[requester_client_id]:
                        await conn.send(json.dumps({"data": data['data']}))
    finally:
    # Clean up on disconnect
        if client_id in connected:
            connected[client_id].remove(websocket)
            if not connected[client_id]:  # Remove the set if empty
                del connected[client_id]
        for connections in connected.values():
            if websocket in connections:
                connections.remove(websocket)

async def main():
    async with websockets.serve(server, "ServerIp", 5000):
        await asyncio.Future()  # run the server indefinitely

if __name__ == '__main__':
    asyncio.run(main())