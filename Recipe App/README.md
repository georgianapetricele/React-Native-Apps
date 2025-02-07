
# Recipe App
The application:
- supports CRUD operations on business objects. The main screen lists these objects.
- persists content locally for offline access, and synchronize with a remote server when online. Uses REST for communication and WebSockets for real time updates and notifications.
    - On update/delete while offline: persists the operation offline (survive restarts). Once the server is back online applies the changes to the server and on device.
    - On read while offline: displays local data with a note that the server is down.
    - On create while offline: saves input locally and syncs with the server when back online.
