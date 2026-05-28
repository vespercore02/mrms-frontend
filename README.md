# MRMS — Modern Records Management System

A modern web-based records management and workflow monitoring platform built using Node.js, Express, React, Sequelize, and MySQL.

The system is designed to manage records inventory, workflow requests, file uploads, approval processes, audit logging, and document lifecycle tracking in a centralized platform.

---

# Features

## Authentication & Security

* JWT Authentication
* Protected Routes
* Password Hashing
* Role-Based Access
* Request Validation Middleware
* Audit Logging

---

# Dashboard

* Request Summary
* Status Monitoring
* System Statistics
* Activity Overview

---

# Request Management

* Create Requests
* Update Request Status
* Workflow Tracking
* Status History Timeline
* Remarks & Monitoring

---

# Agency Management

* Agency CRUD
* Agency Information Tracking
* File Upload Integration

---

# Records Classification

* Departments Management
* Series Management
* Specific Records Management
* Retention Period Tracking

---

# File Management

* File Upload
* File Storage Management
* Download/View Support
* Document Linking

---

# User Management

* Users CRUD
* Roles & Permissions
* Status Management

---

# Audit Logs

* User Activity Monitoring
* Change Tracking
* Action History

---

# Tech Stack

## Backend

* Node.js
* Express.js
* Sequelize ORM
* MySQL
* JWT Authentication
* Multer
* Winston & Morgan Logging

---

## Frontend

* React.js
* React Router
* Axios

---

# Project Structure

```txt
mrms-backend/
mrms-frontend/
```

---

# Backend Setup

## Install Dependencies

```bash
npm install
```

---

# Environment Variables

Create a `.env` file:

```env
PORT=5000

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=db_mrms

JWT_SECRET=your_secret_key
```

---

# Run Backend

```bash
npm run dev
```

---

# Frontend Setup

## Install Dependencies

```bash
npm install
```

---

# Run Frontend

```bash
npm run dev
```

---

# Current Version

```txt
v1.0.0 — Phase 1 MVP
```

---

# Roadmap

## Phase 2

* Advanced File Viewer
* Records Inventory Module
* Excel Import
* Workflow Restrictions
* Role-Based Navigation
* Dashboard Charts
* Archive Management
* Export Features

---

# Development Notes

This project is currently under active development and continuously improving with modular architecture and scalable workflow design.

---
