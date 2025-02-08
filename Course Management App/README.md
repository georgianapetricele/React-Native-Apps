# Course Management App
A mobile application designed to help students track their courses and learning progress. Instructors can create and assign courses, while students can enroll and monitor their progress.

# Application Features
- WebSocket Integration – When a new course is added, the server sends a WebSocket notification to all connected clients with the course details. The app displays the name, instructor, and description using a toast, snackbar, or dialog.
- Progress Indicator – A progress indicator appears on all server or database operations.
- Error Handling & Logging – All server or database errors are displayed using a toast or snackbar, and a log message is recorded.

# Screens
- Instructor Section (Separate Activity/Screen)
  - Create a Course – Create a new course using POST /course by specifying all course details. Available both online and offline.
  - View All Courses – View all courses in a list using GET /courses. The list should display at least the ID, name, instructor, and category. If offline, an error message and retry option should be provided. Retrieved only once, the data should be available regardless of network status or restarts.
  - View Course Details – Select a course from the list to view all details using GET /course with the course ID. Retrieved only once, data should persist on the device even after restarts or when offline.
  - Delete a Course – Delete a course from the list using DELETE /course with the course ID. Available online.
- Student Section (Separate Activity/Screen) – Available Online Only
  - View Ongoing Courses – View all available courses currently marked as “ongoing” using GET /allCourses. The list should display name, duration, status, and enrolled students. Filtering will be performed on the client.
- Analytics Section (Separate Activity/Screen) – Available Online Only
  - Top 5 Most Popular Courses – Using GET /allCourses, generate a list of the top 5 most popular courses, sorted by status (ascending) and number of enrolled students (descending).
    
![Group 15](https://github.com/user-attachments/assets/94445842-5fd3-49c9-928b-6c0f1c235950)
![Group 16](https://github.com/user-attachments/assets/73783009-0ed7-4494-a047-2bcf562d23ae)

