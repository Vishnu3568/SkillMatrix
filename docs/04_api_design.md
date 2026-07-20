# REST API Specification

This document provides details for the RESTful API endpoints of **SkillMatrix**. All responses, including errors, use standard JSON formats and HTTP response status codes.

---

## Response Envelope Conventions

### Successful Response
```json
{
  "success": true,
  "message": "Action completed successfully",
  "data": {}
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "BAD_REQUEST",
    "message": "Detailed error message here",
    "details": []
  }
}
```

---

## 1. Authentication Endpoints

### Register Student
* **Method**: `POST`
* **Route**: `/api/v1/auth/register`
* **Authentication**: None
* **Authorized Roles**: Public
* **Request Body**:
  ```json
  {
    "name": "Jane Doe",
    "email": "jane@example.com",
    "password": "Password123"
  }
  ```
* **Response (201 Created)**:
  ```json
  {
    "success": true,
    "message": "Registration successful",
    "data": {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "user": {
        "id": "60d0fe4f5311236168a109ca",
        "name": "Jane Doe",
        "email": "jane@example.com",
        "role": "student"
      }
    }
  }
  ```
* **Errors**:
  * `400 Bad Request` (Validation failure, e.g., weak password, malformed email).
  * `409 Conflict` (Email already registered).

### Login
* **Method**: `POST`
* **Route**: `/api/v1/auth/login`
* **Authentication**: None
* **Authorized Roles**: Public
* **Request Body**:
  ```json
  {
    "email": "admin@skillmatrix.com",
    "password": "AdminSecurePassword123"
  }
  ```
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Login successful",
    "data": {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "user": {
        "id": "60d0fe4f5311236168a109cb",
        "name": "System Admin",
        "email": "admin@skillmatrix.com",
        "role": "admin"
      }
    }
  }
  ```
* **Errors**:
  * `400 Bad Request` (Missing credentials).
  * `401 Unauthorized` (Invalid email or password).

### Get Current User Profile
* **Method**: `GET`
* **Route**: `/api/v1/auth/me`
* **Authentication**: JWT Bearer Token Required
* **Authorized Roles**: `admin`, `student`
* **Request Body**: None
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "user": {
        "id": "60d0fe4f5311236168a109ca",
        "name": "Jane Doe",
        "email": "jane@example.com",
        "role": "student"
      }
    }
  }
  ```
* **Errors**:
  * `401 Unauthorized` (Missing or invalid token).

---

## 2. Course Management Endpoints

### Browse Courses
* **Method**: `GET`
* **Route**: `/api/v1/courses`
* **Authentication**: JWT Bearer Token Required
* **Authorized Roles**: `admin`, `student`
* **Query Parameters**:
  * `search` (Optional: searches title and description)
  * `status` (Optional, Admin only: `draft`, `published`)
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "courses": [
        {
          "id": "60d0fe4f5311236168a109d0",
          "title": "Intro to Web Development",
          "description": "Learn HTML, CSS, and basic Javascript.",
          "thumbnailUrl": "https://cdn.skillmatrix.com/webdev.jpg",
          "status": "published",
          "createdBy": "60d0fe4f5311236168a109cb"
        }
      ]
    }
  }
  ```
* **Notes**: Students can only retrieve courses with `status: "published"`. Admins can retrieve all courses.

### View Course Details
* **Method**: `GET`
* **Route**: `/api/v1/courses/:id`
* **Authentication**: JWT Bearer Token Required
* **Authorized Roles**: `admin`, `student`
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "course": {
        "id": "60d0fe4f5311236168a109d0",
        "title": "Intro to Web Development",
        "description": "Learn HTML, CSS, and basic Javascript.",
        "thumbnailUrl": "https://cdn.skillmatrix.com/webdev.jpg",
        "status": "published",
        "lessonsCount": 5
      }
    }
  }
  ```
* **Errors**:
  * `404 Not Found` (Course does not exist).

### Create Course
* **Method**: `POST`
* **Route**: `/api/v1/courses`
* **Authentication**: JWT Bearer Token Required
* **Authorized Roles**: `admin`
* **Request Body**:
  ```json
  {
    "title": "React Advanced Techniques",
    "description": "Deep dive into React Hooks, Context, Suspense, and Redux.",
    "thumbnailUrl": "https://cdn.skillmatrix.com/react-adv.jpg"
  }
  ```
* **Response (201 Created)**:
  ```json
  {
    "success": true,
    "message": "Course created successfully",
    "data": {
      "course": {
        "id": "60d0fe4f5311236168a109d2",
        "title": "React Advanced Techniques",
        "description": "Deep dive into React Hooks...",
        "thumbnailUrl": "https://cdn.skillmatrix.com/react-adv.jpg",
        "status": "draft",
        "createdBy": "60d0fe4f5311236168a109cb"
      }
    }
  }
  ```

### Update Course
* **Method**: `PATCH`
* **Route**: `/api/v1/courses/:id`
* **Authentication**: JWT Bearer Token Required
* **Authorized Roles**: `admin`
* **Request Body**:
  ```json
  {
    "title": "React Masterclass 2026",
    "status": "published"
  }
  ```
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Course updated successfully",
    "data": {
      "course": {
        "id": "60d0fe4f5311236168a109d2",
        "title": "React Masterclass 2026",
        "description": "Deep dive into React Hooks...",
        "thumbnailUrl": "https://cdn.skillmatrix.com/react-adv.jpg",
        "status": "published",
        "createdBy": "60d0fe4f5311236168a109cb"
      }
    }
  }
  ```

### Delete Course
* **Method**: `DELETE`
* **Route**: `/api/v1/courses/:id`
* **Authentication**: JWT Bearer Token Required
* **Authorized Roles**: `admin`
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Course and all associated lessons deleted successfully"
  }
  ```

---

## 3. Lesson Endpoints

### List Lessons (Course Outline)
* **Method**: `GET`
* **Route**: `/api/v1/courses/:courseId/lessons`
* **Authentication**: JWT Bearer Token Required
* **Authorized Roles**: `admin`, `student`
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "lessons": [
        {
          "id": "60d0fe4f5311236168a109e0",
          "title": "1. Course Overview",
          "order": 1,
          "completed": true
        },
        {
          "id": "60d0fe4f5311236168a109e1",
          "title": "2. Development Environment",
          "order": 2,
          "completed": false
        }
      ]
    }
  }
  ```
* **Notes**: Student users must be enrolled in the course to list lessons. The `"completed"` flag indicates student progress.

### Get Lesson Content (Watch Video)
* **Method**: `GET`
* **Route**: `/api/v1/courses/:courseId/lessons/:lessonId`
* **Authentication**: JWT Bearer Token Required
* **Authorized Roles**: `admin`, `student`
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "lesson": {
        "id": "60d0fe4f5311236168a109e1",
        "courseId": "60d0fe4f5311236168a109d2",
        "title": "2. Development Environment",
        "description": "Setting up Node and VSCode.",
        "videoUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        "order": 2
      }
    }
  }
  ```
* **Errors**:
  * `403 Forbidden` (Student is not enrolled in the course).

### Add Lesson
* **Method**: `POST`
* **Route**: `/api/v1/courses/:courseId/lessons`
* **Authentication**: JWT Bearer Token Required
* **Authorized Roles**: `admin`
* **Request Body**:
  ```json
  {
    "title": "3. Creating First Component",
    "description": "Understanding JSX and building basic functional components.",
    "videoUrl": "https://www.youtube.com/watch?v=yXYZ123",
    "order": 3
  }
  ```
* **Response (201 Created)**:
  ```json
  {
    "success": true,
    "message": "Lesson added successfully",
    "data": {
      "lesson": {
        "id": "60d0fe4f5311236168a109e2",
        "courseId": "60d0fe4f5311236168a109d2",
        "title": "3. Creating First Component",
        "description": "Understanding JSX...",
        "videoUrl": "https://www.youtube.com/watch?v=yXYZ123",
        "order": 3
      }
    }
  }
  ```

### Edit Lesson
* **Method**: `PATCH`
* **Route**: `/api/v1/courses/:courseId/lessons/:lessonId`
* **Authentication**: JWT Bearer Token Required
* **Authorized Roles**: `admin`
* **Request Body**:
  ```json
  {
    "title": "3. Creating Functional Components",
    "videoUrl": "https://www.youtube.com/watch?v=newVideo"
  }
  ```
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Lesson updated successfully",
    "data": {
      "lesson": {
        "id": "60d0fe4f5311236168a109e2",
        "courseId": "60d0fe4f5311236168a109d2",
        "title": "3. Creating Functional Components",
        "videoUrl": "https://www.youtube.com/watch?v=newVideo",
        "order": 3
      }
    }
  }
  ```

### Delete Lesson
* **Method**: `DELETE`
* **Route**: `/api/v1/courses/:courseId/lessons/:lessonId`
* **Authentication**: JWT Bearer Token Required
* **Authorized Roles**: `admin`
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Lesson deleted successfully"
  }
  ```

---

## 4. Enrollment Endpoints

### Enroll in Course
* **Method**: `POST`
* **Route**: `/api/v1/enrollments`
* **Authentication**: JWT Bearer Token Required
* **Authorized Roles**: `student`
* **Request Body**:
  ```json
  {
    "courseId": "60d0fe4f5311236168a109d2"
  }
  ```
* **Response (201 Created)**:
  ```json
  {
    "success": true,
    "message": "Enrolled in course successfully",
    "data": {
      "enrollment": {
        "id": "60d0fe4f5311236168a109f5",
        "studentId": "60d0fe4f5311236168a109ca",
        "courseId": "60d0fe4f5311236168a109d2",
        "enrolledAt": "2026-07-20T12:00:00.000Z"
      }
    }
  }
  ```

### Get My Enrolled Courses
* **Method**: `GET`
* **Route**: `/api/v1/enrollments`
* **Authentication**: JWT Bearer Token Required
* **Authorized Roles**: `student`
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "enrollments": [
        {
          "id": "60d0fe4f5311236168a109f5",
          "course": {
            "id": "60d0fe4f5311236168a109d2",
            "title": "React Advanced Techniques",
            "thumbnailUrl": "https://cdn.skillmatrix.com/react-adv.jpg"
          },
          "progressPercentage": 40,
          "enrolledAt": "2026-07-20T12:00:00.000Z"
        }
      ]
    }
  }
  ```

---

## 5. Progress Tracking Endpoints

### Mark Lesson Completed
* **Method**: `POST`
* **Route**: `/api/v1/progress/lessons/:lessonId/complete`
* **Authentication**: JWT Bearer Token Required
* **Authorized Roles**: `student`
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Lesson marked as complete",
    "data": {
      "progress": {
        "studentId": "60d0fe4f5311236168a109ca",
        "courseId": "60d0fe4f5311236168a109d2",
        "lessonId": "60d0fe4f5311236168a109e1",
        "completed": true,
        "completedAt": "2026-07-20T12:15:30.000Z"
      }
    }
  }
  ```

### Mark Lesson Incomplete
* **Method**: `DELETE`
* **Route**: `/api/v1/progress/lessons/:lessonId/complete`
* **Authentication**: JWT Bearer Token Required
* **Authorized Roles**: `student`
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Lesson completion removed"
  }
  ```

### Get My Progress Stats
* **Method**: `GET`
* **Route**: `/api/v1/progress/courses/:courseId`
* **Authentication**: JWT Bearer Token Required
* **Authorized Roles**: `student`
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "courseId": "60d0fe4f5311236168a109d2",
      "totalLessons": 5,
      "completedLessonsCount": 2,
      "progressPercentage": 40,
      "completedLessonIds": [
        "60d0fe4f5311236168a109e0",
        "60d0fe4f5311236168a109e1"
      ]
    }
  }
  ```

---

## 6. Dashboard / Admin Metrics

### View Student Progress (Admin View)
* **Method**: `GET`
* **Route**: `/api/v1/admin/courses/:courseId/students/:studentId/progress`
* **Authentication**: JWT Bearer Token Required
* **Authorized Roles**: `admin`
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "student": {
        "id": "60d0fe4f5311236168a109ca",
        "name": "Jane Doe",
        "email": "jane@example.com"
      },
      "course": {
        "id": "60d0fe4f5311236168a109d2",
        "title": "React Advanced Techniques"
      },
      "progressPercentage": 40,
      "completedLessons": [
        {
          "lessonId": "60d0fe4f5311236168a109e0",
          "title": "1. Course Overview",
          "completedAt": "2026-07-20T12:05:00.000Z"
        },
        {
          "lessonId": "60d0fe4f5311236168a109e1",
          "title": "2. Development Environment",
          "completedAt": "2026-07-20T12:15:30.000Z"
        }
      ]
    }
  }
  ```

### Admin Aggregate Dashboard Stats
* **Method**: `GET`
* **Route**: `/api/v1/admin/dashboard`
* **Authentication**: JWT Bearer Token Required
* **Authorized Roles**: `admin`
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "totalStudents": 156,
      "totalCourses": 12,
      "totalEnrollmentsCount": 489,
      "completionRatePercentage": 68.4,
      "topCoursesByEnrollment": [
        {
          "courseId": "60d0fe4f5311236168a109d2",
          "title": "React Advanced Techniques",
          "enrollments": 105
        }
      ]
    }
  }
  ```
