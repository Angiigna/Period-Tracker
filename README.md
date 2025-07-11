#    🌙 Lunaria – Women's Health Tracker

Tech Stack: HTML, CSS, JavaScript, Node.js, Express.js, Chart.js, SQL

Overview
Lunaria is a personalized women's health tracker designed to help users monitor their menstrual cycles, moods, and health vitals. Inspired by the natural cycles of the moon, Lunaria offers an elegant and interactive interface that empowers women to understand their bodies better through data-driven insights.
________________________________________
1. Introduction
1.1 Purpose
This document specifies the functional and non-functional requirements for Lunaria, a women's health tracker that allows users to log menstrual cycles, moods, and vital health metrics. It provides a clear reference for developers, testers, and stakeholders.
1.2 Scope
Lunaria is a web-based application that assists women in tracking their menstrual health. Features include account management, period prediction, mood tracking with data visualization, vital sign logging, and an interactive user interface. The application is built with HTML, CSS, JavaScript, Node.js, Express.js, Chart.js, and SQL.
1.3 Definitions, Acronyms, and Abbreviations
•	SRS: Software Requirements Specification
•	UI: User Interface
•	DB: Database
•	BMI: Body Mass Index
•	RHR: Resting Heart Rate

1.4 References
•	IEEE SRS Template
•	Chart.js Documentation
•	Node.js & Express.js Documentation
________________________________________
2. Overall Description
2.1 Product Perspective
Lunaria is a stand-alone application that stores all user data in a centralized SQL database. It integrates a third-party charting library (Chart.js) for visualizations.
2.2 Product Functions
•	Secure registration and login
•	Period logging and predictive calculations
•	Mood logging with visual feedback
•	Health vitals recording and display
•	Dynamic calendar interface
2.3 User Classes and Characteristics
•	General Users: Female individuals interested in tracking menstrual health
2.4 Operating Environment
•	Browser-based application (Chrome, Firefox, Safari, Edge)
•	Server-side environment: Node.js
•	Database server: SQL (MySQL)
2.5 Design and Implementation Constraints
•	Responsive web design
•	Use of open-source libraries only
•	Back-end written in JavaScript (Node.js)
2.6 Assumptions and Dependencies
•	Users will access the system on modern browsers
•	Server is maintained and secured
•	Internet connection required for full functionality

Features
1.  User Registration & Login
•	Secure account creation with password hashing.
•	Session-based login system to protect user data.

2.  Period Logging & Prediction
•	Users can log their period start and end dates.
•	The system analyzes logs to:
o	Predict the next period date.
o	Estimate the ovulation date.
•	Both predictions are visually highlighted on the interactive calendar.

3. Daily Mood Logging
•	Users can log their mood each day with pre-set options (e.g., happy, sad, tired, energetic).
•	Displays mood patterns from the past 7 days using Chart.js line or bar graphs.
•	Aids in identifying emotional trends linked to the menstrual cycle.

4. Health Vitals Entry
•	Users can record key health metrics, such as:
o	Weight
o	Height
o	Age
o	Resting heart rate
o	BMI is automatically calculated
•	All vitals are stored securely in a relational SQL database for long-term tracking.

5.  Pleasant & Interactive UI
•	Calming visual theme with wave and moon-inspired elements.
•	Smooth animations and transitions for an engaging experience.
•	Calendar highlights key dates and allows easy input logging.
________________________________________
Database Design
Users Table
•	user_id (Primary Key)
•	username
•	email
•	hashed_password
periodlogs Table
•	id (Primary Key)
•	user_id(Foreign Key)
•	period_start_date
•	cycle_length
•	created_at
perioddetails Table
•	id (Primary Key)
•	user_id(Foreign Key)
•	period_start_date
•	period_end_date
•	logged_date
•	period_length
•	cycle_length
•	created_at
moods Table
•	id (Primary Key)
•	user_id(Foreign Key)
•	date
•	mood
vitals Table
•	id (Primary Key)
•	user_id(Foreign Key)
•	age
•	height
•	weight
•	rhr
•	bmi
________________________________________
Security Considerations
•	Session handling and timeout policies implemented.
•	Passwords are hashed using a secure algorithm (e.g., bcrypt).
________________________________________
Future Improvements
•	Provide customized info based on the cycle
•	Determine cycle length based on age of user
•	Email remainders
•	Add more vital measures


