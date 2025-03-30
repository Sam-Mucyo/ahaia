from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
import random
import os

app = Flask(__name__)
CORS(app)


# Database setup
def init_db():
    conn = sqlite3.connect("quiz_app.db")
    c = conn.cursor()

    # Create tables if they don't exist
    c.execute(
        """
    CREATE TABLE IF NOT EXISTS topics (
        id INTEGER PRIMARY KEY,
        name TEXT UNIQUE NOT NULL
    )
    """
    )

    c.execute(
        """
    CREATE TABLE IF NOT EXISTS questions (
        id INTEGER PRIMARY KEY,
        text TEXT NOT NULL,
        topic_id INTEGER,
        image_path TEXT,
        lecture_reference TEXT,
        FOREIGN KEY (topic_id) REFERENCES topics (id)
    )
    """
    )

    c.execute(
        """
    CREATE TABLE IF NOT EXISTS options (
        id INTEGER PRIMARY KEY,
        question_id INTEGER NOT NULL,
        text TEXT NOT NULL,
        is_correct BOOLEAN NOT NULL,
        explanation TEXT,
        FOREIGN KEY (question_id) REFERENCES questions (id)
    )
    """
    )

    c.execute(
        """
    CREATE TABLE IF NOT EXISTS user_stats (
        id INTEGER PRIMARY KEY,
        question_id INTEGER NOT NULL,
        correct_attempts INTEGER DEFAULT 0,
        incorrect_attempts INTEGER DEFAULT 0,
        last_attempt_date TEXT,
        FOREIGN KEY (question_id) REFERENCES questions (id)
    )
    """
    )

    conn.commit()
    conn.close()


init_db()


# Routes for topics
@app.route("/topics", methods=["GET"])
def get_topics():
    conn = sqlite3.connect("quiz_app.db")
    conn.row_factory = sqlite3.Row
    c = conn.cursor()
    c.execute("SELECT * FROM topics")
    topics = [dict(row) for row in c.fetchall()]
    conn.close()
    return jsonify(topics)


@app.route("/topics", methods=["POST"])
def add_topic():
    topic_data = request.json
    conn = sqlite3.connect("quiz_app.db")
    c = conn.cursor()
    try:
        c.execute("INSERT INTO topics (name) VALUES (?)", (topic_data["name"],))
        conn.commit()
        topic_id = c.lastrowid
        conn.close()
        return jsonify({"id": topic_id, "name": topic_data["name"]}), 201
    except sqlite3.IntegrityError:
        conn.close()
        return jsonify({"error": "Topic already exists"}), 400


# Routes for questions
@app.route("/questions", methods=["GET"])
def get_questions():
    topic_id = request.args.get("topic_id")

    conn = sqlite3.connect("quiz_app.db")
    conn.row_factory = sqlite3.Row
    c = conn.cursor()

    if topic_id:
        c.execute(
            """
        SELECT q.*, t.name as topic_name
        FROM questions q
        LEFT JOIN topics t ON q.topic_id = t.id
        WHERE q.topic_id = ?
        """,
            (topic_id,),
        )
    else:
        c.execute(
            """
        SELECT q.*, t.name as topic_name
        FROM questions q
        LEFT JOIN topics t ON q.topic_id = t.id
        """
        )

    questions = []
    for row in c.fetchall():
        question = dict(row)

        # Get options for this question
        c.execute("SELECT * FROM options WHERE question_id = ?", (question["id"],))
        options = [dict(option) for option in c.fetchall()]
        question["options"] = options

        questions.append(question)

    conn.close()
    return jsonify(questions)


@app.route("/questions", methods=["POST"])
def add_question():
    question_data = request.json

    conn = sqlite3.connect("quiz_app.db")
    c = conn.cursor()

    try:
        # Insert question
        c.execute(
            """
        INSERT INTO questions (text, topic_id, image_path, lecture_reference)
        VALUES (?, ?, ?, ?)
        """,
            (
                question_data["text"],
                question_data.get("topic_id"),
                question_data.get("image_path"),
                question_data.get("lecture_reference"),
            ),
        )

        question_id = c.lastrowid

        # Insert options
        for option in question_data["options"]:
            c.execute(
                """
            INSERT INTO options (question_id, text, is_correct, explanation)
            VALUES (?, ?, ?, ?)
            """,
                (
                    question_id,
                    option["text"],
                    option["is_correct"],
                    option.get("explanation"),
                ),
            )

        # Initialize stats for this question
        c.execute(
            """
        INSERT INTO user_stats (question_id, correct_attempts, incorrect_attempts)
        VALUES (?, 0, 0)
        """,
            (question_id,),
        )

        conn.commit()
        conn.close()

        return (
            jsonify({"id": question_id, "message": "Question added successfully"}),
            201,
        )

    except Exception as e:
        conn.rollback()
        conn.close()
        return jsonify({"error": str(e)}), 400


@app.route("/quiz/random", methods=["GET"])
def get_random_quiz():
    count = request.args.get("count", default=10, type=int)
    topic_id = request.args.get("topic_id")

    conn = sqlite3.connect("quiz_app.db")
    conn.row_factory = sqlite3.Row
    c = conn.cursor()

    if topic_id:
        c.execute(
            """
        SELECT q.*, t.name as topic_name
        FROM questions q
        LEFT JOIN topics t ON q.topic_id = t.id
        WHERE q.topic_id = ?
        """,
            (topic_id,),
        )
    else:
        c.execute(
            """
        SELECT q.*, t.name as topic_name
        FROM questions q
        LEFT JOIN topics t ON q.topic_id = t.id
        """
        )

    all_questions = [dict(row) for row in c.fetchall()]

    # Randomly select questions up to the requested count
    selected_questions = random.sample(all_questions, min(count, len(all_questions)))

    # Get options for each selected question
    for question in selected_questions:
        c.execute("SELECT * FROM options WHERE question_id = ?", (question["id"],))
        options = [dict(option) for option in c.fetchall()]
        question["options"] = options

    conn.close()
    return jsonify(selected_questions)


@app.route("/stats", methods=["POST"])
def update_stats():
    stat_data = request.json
    question_id = stat_data["question_id"]
    is_correct = stat_data["is_correct"]

    conn = sqlite3.connect("quiz_app.db")
    c = conn.cursor()

    # Check if stats exist for this question
    c.execute("SELECT * FROM user_stats WHERE question_id = ?", (question_id,))
    stats = c.fetchone()

    if stats:
        if is_correct:
            c.execute(
                """
            UPDATE user_stats
            SET correct_attempts = correct_attempts + 1, last_attempt_date = CURRENT_TIMESTAMP
            WHERE question_id = ?
            """,
                (question_id,),
            )
        else:
            c.execute(
                """
            UPDATE user_stats
            SET incorrect_attempts = incorrect_attempts + 1, last_attempt_date = CURRENT_TIMESTAMP
            WHERE question_id = ?
            """,
                (question_id,),
            )
    else:
        if is_correct:
            c.execute(
                """
            INSERT INTO user_stats (question_id, correct_attempts, incorrect_attempts, last_attempt_date)
            VALUES (?, 1, 0, CURRENT_TIMESTAMP)
            """,
                (question_id,),
            )
        else:
            c.execute(
                """
            INSERT INTO user_stats (question_id, correct_attempts, incorrect_attempts, last_attempt_date)
            VALUES (?, 0, 1, CURRENT_TIMESTAMP)
            """,
                (question_id,),
            )

    conn.commit()
    conn.close()

    return jsonify({"message": "Stats updated successfully"})


@app.route("/stats", methods=["GET"])
def get_stats():
    conn = sqlite3.connect("quiz_app.db")
    conn.row_factory = sqlite3.Row
    c = conn.cursor()

    c.execute(
        """
    SELECT us.*, q.text as question_text, t.name as topic_name
    FROM user_stats us
    JOIN questions q ON us.question_id = q.id
    LEFT JOIN topics t ON q.topic_id = t.id
    """
    )

    stats = [dict(row) for row in c.fetchall()]

    # Calculate success rate for each question
    for stat in stats:
        total_attempts = stat["correct_attempts"] + stat["incorrect_attempts"]
        if total_attempts > 0:
            stat["success_rate"] = (stat["correct_attempts"] / total_attempts) * 100
        else:
            stat["success_rate"] = 0

    conn.close()
    return jsonify(stats)


@app.route("/search", methods=["GET"])
def search_questions():
    query = request.args.get("q", "")
    topic_id = request.args.get("topic_id")

    if not query:
        return jsonify({"error": "Search query is required"}), 400

    conn = sqlite3.connect("quiz_app.db")
    conn.row_factory = sqlite3.Row
    c = conn.cursor()

    # Prepare the SQL query with search parameters
    sql_query = """
    SELECT q.*, t.name as topic_name
    FROM questions q
    LEFT JOIN topics t ON q.topic_id = t.id
    WHERE q.text LIKE ?
    """
    params = [f"%{query}%"]

    # Add topic filter if provided
    if topic_id:
        sql_query += " AND q.topic_id = ?"
        params.append(topic_id)

    c.execute(sql_query, params)

    # Process results
    questions = []
    for row in c.fetchall():
        question = dict(row)

        # Get options for this question
        c.execute("SELECT * FROM options WHERE question_id = ?", (question["id"],))
        options = [dict(option) for option in c.fetchall()]
        question["options"] = options

        questions.append(question)

    conn.close()
    return jsonify({"count": len(questions), "results": questions})


# Create folder for image uploads if it doesn't exist
if not os.path.exists("uploads"):
    os.makedirs("uploads")

if __name__ == "__main__":
    app.run(debug=True)
