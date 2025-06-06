# Note Taking App

A full-stack web application designed for creating, managing, and organizing personal notes. Built with Node.js, Express, and MongoDB, this application provides a secure and intuitive interface for users to jot down their thoughts, with features like tagging, color-coding, and pinning important notes.

_Add screenshot_

![Note Card Example]()

## ✨ Key Features

- **User Authentication:** Secure user registration and login system using Passport.js. Users can only access their own notes.
- **Full CRUD Functionality:** Create, read, update, and delete notes.
- **Rich Note Organization:**
  - **Pinning:** Pin important notes to the top of the list.
  - **Color-Coding:** Assign one of five background colors (white, blue, green, yellow, pink) to visually categorize notes.
  - **Tagging:** Add comma-separated tags to notes for easy searching and filtering (future feature).
- **Responsive UI:** A clean and modern user interface built with Bootstrap 5 that works on all screen sizes.
- **RESTful API:** A well-structured backend API for handling note and user operations asynchronously.

## 🛠️ Built With

### Backend

- **Node.js:** JavaScript runtime environment.
- **Express.js:** Web framework for Node.js.
- **MongoDB:** NoSQL database for storing user and note data.
- **Mongoose:** Object Data Modeling (ODM) library for MongoDB.
- **Passport.js:** Authentication middleware for Node.js (`passport-local`, `passport-local-mongoose`).
- **EJS:** Embedded JavaScript templating for server-rendered views.
- **Express Validator:** Middleware for server-side data validation.
- **Connect Flash:** Middleware for displaying flash messages (e.g., success/error notifications).
- **Helmet:** Helps secure Express apps by setting various HTTP headers.
- **Dotenv:** For managing environment variables.

### Frontend

- **HTML5 & EJS**
- **CSS3 & Bootstrap 5**
- **Vanilla JavaScript:** For client-side interactions like the note pinning feature.

## 🚀 Getting Started

Follow these instructions to get a local copy of the project up and running.

### Prerequisites

- Node.js installed (v18.x or later recommended)
- npm (Node Package Manager)
- MongoDB (You can use a local installation or a cloud service like MongoDB Atlas)

### Installation

1.  **Clone the repository:**

    ```sh
    git clone [https://github.com/analiviag/notesapp.git](https://github.com/analiviag/notesapp.git)
    ```

2.  **Navigate to the project directory:**

    ```sh
    cd notesapp
    ```

3.  **Install NPM packages:**

    ```sh
    npm install
    ```

4.  **Create an environment file:**
    Create a `.env` file in the root of the project and add the necessary environment variables. You can use the example below as a template.

### Environment Variables

Your `.env` file should contain the following variables:

- `DB_CONN`: Your connection string for the MongoDB database.
- `SESSION_SECRET`: A long, complex, and random string to ensure your user sessions are secure.
- `PORT`: 3000 (for example).

### Running the Application

Once the dependencies are installed and the `.env` file is configured, you can start the server with:

```sh
npm start
```
