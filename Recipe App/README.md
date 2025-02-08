
# Recipes App
"MyRecipes" is a mobile app that makes it easy for users to manage their recipes. With a simple and user-friendly interface, users can access all their saved recipes and view detailed information for each one. The app also allows users to add new recipes, update existing ones, and delete recipes they no longer need. 


# CRUD operations and Persistence Details
The application:
- Supports CRUD operations on business objects. The main screen lists these objects.
- Persists content locally for offline access, and synchronize with the remote server database when online. Uses REST for communication and WebSockets for real time updates and notifications.
    - On update/delete while offline: persists the operation offline (survive restarts). Once the server is back online applies the changes to the server and on device.
    - On read while offline: displays local data with a note that the server is down.
    - On create while offline: saves input locally and syncs with the server when back online.
  

![Group 4](https://github.com/user-attachments/assets/7b3804de-78a5-4c64-bcd2-61d5d8f96a03)
![Group 5 (1)](https://github.com/user-attachments/assets/dac716b6-d518-4998-8772-8fb981157064)
