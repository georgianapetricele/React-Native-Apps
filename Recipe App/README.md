
# Recipe App
The application:
- supports CRUD operations on business objects. The main screen lists these objects.
- persists content locally for offline access, and synchronize with the remote server database when online. Uses REST for communication and WebSockets for real time updates and notifications.
    - On update/delete while offline: persists the operation offline (survive restarts). Once the server is back online applies the changes to the server and on device.
    - On read while offline: displays local data with a note that the server is down.
    - On create while offline: saves input locally and syncs with the server when back online.
![WhatsApp Image 2025-02-08 at 11 50 38_c8d7f593](https://github.com/user-attachments/assets/0f907afb-0f68-46af-8b5b-617bc5a9ab12)
![WhatsApp Image 2025-02-08 at 11 51 35_9a3dde0c](https://github.com/user-attachments/assets/712d7447-bd9c-4acc-a10e-bc328ff5ad5d)
![WhatsApp Image 2025-02-08 at 11 51 12_5d672c14](https://github.com/user-attachments/assets/9523e8d8-7190-404c-8aa0-28efd1a7bcb3)
![WhatsApp Image 2025-02-08 at 11 51 49_7cf34ee5](https://github.com/user-attachments/assets/eea7f781-b30b-4a8b-9341-36b0a25dd938)
![WhatsApp Image 2025-02-08 at 11 51 01_946c5c60](https://github.com/user-attachments/assets/a1174b61-d0e8-414f-beb4-0773d5dda097)
